"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Loader2, CheckCircle } from "lucide-react"

export default function RegisterPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [step, setStep] = useState(1)
  
  const [formData, setFormData] = useState({
    // Company info
    companyName: "",
    ice: "",
    ifField: "",
    rc: "",
    companyEmail: "",
    companyPhone: "",
    address: "",
    city: "",
    
    // User info
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const validateStep1 = () => {
    if (!formData.companyName || !formData.ice || !formData.companyEmail) {
      setError("Veuillez remplir tous les champs obligatoires")
      return false
    }
    if (formData.ice.length !== 15) {
      setError("L'ICE doit contenir 15 chiffres")
      return false
    }
    return true
  }

  const validateStep2 = () => {
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      setError("Veuillez remplir tous les champs obligatoires")
      return false
    }
    if (formData.password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères")
      return false
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Les mots de passe ne correspondent pas")
      return false
    }
    return true
  }

  const handleNext = () => {
    setError("")
    if (validateStep1()) {
      setStep(2)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    
    if (!validateStep2()) return
    
    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Une erreur est survenue")
        return
      }

      // Redirect to login with success message
      router.push("/login?registered=true")
    } catch {
      setError("Une erreur est survenue. Veuillez réessayer.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 px-4 py-8">
      <div className="mx-auto max-w-2xl">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 shadow-lg">
            <span className="text-2xl font-bold text-white">2A</span>
          </div>
          <h1 className="mt-4 text-2xl font-bold text-slate-900">Deux A Para</h1>
          <p className="text-slate-500">Demande d'accès professionnel</p>
        </div>

        {/* Progress */}
        <div className="mb-8 flex items-center justify-center gap-4">
          <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
            step >= 1 ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-500"
          }`}>
            1
          </div>
          <div className={`h-1 w-16 ${step >= 2 ? "bg-blue-600" : "bg-slate-200"}`} />
          <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
            step >= 2 ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-500"
          }`}>
            2
          </div>
        </div>

        <Card className="border-0 shadow-xl">
          <CardHeader className="space-y-1">
            <CardTitle>
              {step === 1 ? "Informations entreprise" : "Informations utilisateur"}
            </CardTitle>
            <CardDescription>
              {step === 1 
                ? "Renseignez les informations de votre établissement" 
                : "Créez votre compte administrateur"
              }
            </CardDescription>
          </CardHeader>

          <form onSubmit={step === 2 ? handleSubmit : (e) => { e.preventDefault(); handleNext(); }}>
            <CardContent className="space-y-4">
              {error && (
                <div className="flex items-start gap-3 rounded-lg bg-red-50 p-4 text-sm text-red-600">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {step === 1 ? (
                <>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2 sm:col-span-2">
                      <label className="text-sm font-medium text-slate-700">
                        Raison sociale <span className="text-red-500">*</span>
                      </label>
                      <Input
                        name="companyName"
                        placeholder="Pharmacie Centrale"
                        value={formData.companyName}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">
                        ICE <span className="text-red-500">*</span>
                      </label>
                      <Input
                        name="ice"
                        placeholder="001234567890123"
                        maxLength={15}
                        value={formData.ice}
                        onChange={handleChange}
                        required
                      />
                      <p className="text-xs text-slate-400">15 chiffres</p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">IF</label>
                      <Input
                        name="ifField"
                        placeholder="12345678"
                        value={formData.ifField}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">RC</label>
                      <Input
                        name="rc"
                        placeholder="123456"
                        value={formData.rc}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">
                        Email professionnel <span className="text-red-500">*</span>
                      </label>
                      <Input
                        name="companyEmail"
                        type="email"
                        placeholder="contact@entreprise.ma"
                        value={formData.companyEmail}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">Téléphone</label>
                      <Input
                        name="companyPhone"
                        placeholder="+212 522 123 456"
                        value={formData.companyPhone}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="space-y-2 sm:col-span-2">
                      <label className="text-sm font-medium text-slate-700">Adresse</label>
                      <Input
                        name="address"
                        placeholder="123 Boulevard Mohammed V"
                        value={formData.address}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">Ville</label>
                      <Input
                        name="city"
                        placeholder="Casablanca"
                        value={formData.city}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">
                        Prénom <span className="text-red-500">*</span>
                      </label>
                      <Input
                        name="firstName"
                        placeholder="Jean"
                        value={formData.firstName}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">
                        Nom <span className="text-red-500">*</span>
                      </label>
                      <Input
                        name="lastName"
                        placeholder="Dupont"
                        value={formData.lastName}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="space-y-2 sm:col-span-2">
                      <label className="text-sm font-medium text-slate-700">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <Input
                        name="email"
                        type="email"
                        placeholder="jean.dupont@entreprise.ma"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="space-y-2 sm:col-span-2">
                      <label className="text-sm font-medium text-slate-700">Téléphone personnel</label>
                      <Input
                        name="phone"
                        placeholder="+212 6XX XXX XXX"
                        value={formData.phone}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">
                        Mot de passe <span className="text-red-500">*</span>
                      </label>
                      <Input
                        name="password"
                        type="password"
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={handleChange}
                        required
                      />
                      <p className="text-xs text-slate-400">Min. 8 caractères</p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">
                        Confirmer <span className="text-red-500">*</span>
                      </label>
                      <Input
                        name="confirmPassword"
                        type="password"
                        placeholder="••••••••"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                </>
              )}
            </CardContent>

            <CardFooter className="flex flex-col gap-4">
              <div className="flex w-full gap-3">
                {step === 2 && (
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setStep(1)}
                    disabled={isLoading}
                  >
                    Retour
                  </Button>
                )}
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Traitement...
                    </>
                  ) : step === 1 ? (
                    "Continuer"
                  ) : (
                    "Envoyer la demande"
                  )}
                </Button>
              </div>

              <p className="text-center text-sm text-slate-500">
                Déjà un compte ?{" "}
                <Link href="/login" className="font-medium text-blue-600 hover:underline">
                  Se connecter
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
