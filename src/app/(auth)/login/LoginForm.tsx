"use client"

import { useState, useEffect } from "react"
import { signIn, useSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { AlertCircle, Loader2 } from "lucide-react"

export default function LoginForm() {
  const router = useRouter()
  const { status } = useSession()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard"
  const registered = searchParams.get("registered")
  const error = searchParams.get("error")
  
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [errorMessage, setErrorMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (status === "authenticated") {
      router.push(callbackUrl)
    }
    
    if (error) {
      const errorMap: Record<string, string> = {
        "CredentialsSignin": "Email ou mot de passe incorrect",
        "AccessDenied": "Votre compte n'est pas encore approuvé",
        "UserInactive": "Votre compte est désactivé",
        "CompanyNotApproved": "Votre entreprise n'est pas encore approuvée",
        "Default": "Une erreur est survenue. Veuillez réessayer."
      }
      setErrorMessage(errorMap[error] || errorMap["Default"])
    }
  }, [status, router, callbackUrl, error])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorMessage("")

    try {
      const result = await signIn("credentials", {
        email: email.trim(),
        password,
        redirect: false,
        callbackUrl,
      })

      if (result?.error) {
        router.push(`/login?error=${result.error}`)
      } else if (result?.ok) {
        router.push(callbackUrl)
        router.refresh()
      }
    } catch {
      setErrorMessage("Une erreur est survenue. Veuillez réessayer.")
    } finally {
      setIsLoading(false)
    }
  }

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 shadow-lg shadow-blue-200">
            <span className="text-3xl font-bold text-white">2A</span>
          </div>
          <h1 className="mt-6 text-3xl font-bold tracking-tight text-slate-900">Deux A Para</h1>
          <p className="mt-2 text-slate-500">Espace Professionnel</p>
        </div>

        {registered && (
          <div className="mb-6 rounded-lg bg-green-50 p-4 text-sm text-green-700">
            <p className="font-medium">Inscription réussie !</p>
            <p>Votre demande est en attente d&apos;approbation.</p>
          </div>
        )}

        <div className="rounded-2xl bg-white p-8 shadow-xl">
          <h2 className="text-2xl font-semibold text-slate-900">Connexion</h2>
          <p className="mt-2 text-slate-500">Connectez-vous à votre compte professionnel</p>
          
          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            {errorMessage && (
              <div className="flex items-start gap-3 rounded-lg bg-red-50 p-4 text-sm text-red-600">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Adresse email</label>
              <input
                type="email"
                placeholder="nom@entreprise.ma"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="flex h-11 w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-slate-700">Mot de passe</label>
                <Link href="/forgot-password" className="text-sm text-blue-600 hover:underline">
                  Mot de passe oublié ?
                </Link>
              </div>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                className="flex h-11 w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <Button type="submit" className="h-11 w-full text-base" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connexion...
                </>
              ) : (
                "Se connecter"
              )}
            </Button>

            <p className="text-center text-sm text-slate-500">
              Pas encore de compte ?{" "}
              <Link href="/register" className="font-medium text-blue-600 hover:underline">
                Demander un accès pro
              </Link>
            </p>
          </form>
        </div>

        <p className="mt-8 text-center text-sm text-slate-400">
          © 2024 Deux A Para. Tous droits réservés.
        </p>
      </div>
    </div>
  )
}
