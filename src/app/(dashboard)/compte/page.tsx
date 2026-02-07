"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useSession } from "next-auth/react"
import { User, Building2, MapPin, CreditCard, Lock } from "lucide-react"

export default function AccountPage() {
  const { data: session } = useSession()
  const [activeTab, setActiveTab] = useState("profile")

  const tabs = [
    { id: "profile", label: "Profil", icon: User },
    { id: "company", label: "Entreprise", icon: Building2 },
    { id: "addresses", label: "Adresses", icon: MapPin },
    { id: "payment", label: "Paiement", icon: CreditCard },
    { id: "security", label: "Sécurité", icon: Lock },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mon compte</h1>
        <p className="text-gray-500">Gérez vos informations personnelles et professionnelles</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Sidebar */}
        <Card className="h-fit">
          <CardContent className="p-2">
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </CardContent>
        </Card>

        {/* Content */}
        <div className="lg:col-span-3">
          {activeTab === "profile" && (
            <Card>
              <CardHeader>
                <CardTitle>Informations personnelles</CardTitle>
                <CardDescription>Mettez à jour vos informations de contact</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    label="Prénom"
                    defaultValue={session?.user?.firstName}
                  />
                  <Input
                    label="Nom"
                    defaultValue={session?.user?.lastName}
                  />
                </div>
                <Input
                  label="Email"
                  type="email"
                  defaultValue={session?.user?.email}
                />
                <Input
                  label="Téléphone"
                  type="tel"
                  placeholder="+212 6XX XXX XXX"
                />
                <Button>Sauvegarder les modifications</Button>
              </CardContent>
            </Card>
          )}

          {activeTab === "company" && (
            <Card>
              <CardHeader>
                <CardTitle>Informations entreprise</CardTitle>
                <CardDescription>Informations fiscales et légales</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  label="Raison sociale"
                  defaultValue="Pharmacie Centrale Casablanca"
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    label="ICE"
                    placeholder="001234567890123"
                  />
                  <Input
                    label="IF"
                    placeholder="12345678"
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    label="RC"
                    placeholder="123456"
                  />
                  <Input
                    label="CNSS"
                    placeholder="1234567"
                  />
                </div>
                <Button>Sauvegarder</Button>
              </CardContent>
            </Card>
          )}

          {activeTab === "addresses" && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Adresses de livraison</CardTitle>
                  <CardDescription>Gérez vos adresses de livraison</CardDescription>
                </div>
                <Button size="sm">+ Ajouter</Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="rounded-lg border p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">Pharmacie Principale</p>
                          <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                            Par défaut
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-gray-500">
                          123 Boulevard Mohammed V<br />
                          20000 Casablanca, Maroc
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm">Modifier</Button>
                        <Button variant="ghost" size="sm" className="text-red-600">Supprimer</Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "payment" && (
            <Card>
              <CardHeader>
                <CardTitle>Conditions de paiement</CardTitle>
                <CardDescription>Vos modalités de paiement agréées</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg bg-green-50 p-4">
                  <p className="font-medium text-green-900">Virement 30 jours</p>
                  <p className="text-sm text-green-700 mt-1">
                    Vous disposez d'un crédit de 30 jours à compter de la date de facturation.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "security" && (
            <Card>
              <CardHeader>
                <CardTitle>Sécurité du compte</CardTitle>
                <CardDescription>Modifiez votre mot de passe</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  label="Mot de passe actuel"
                  type="password"
                />
                <Input
                  label="Nouveau mot de passe"
                  type="password"
                />
                <Input
                  label="Confirmer le nouveau mot de passe"
                  type="password"
                />
                <Button>Changer le mot de passe</Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
