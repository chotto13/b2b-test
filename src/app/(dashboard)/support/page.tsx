"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Plus, MessageCircle, Clock, CheckCircle, Eye, Loader2 } from "lucide-react"
import { formatDateShort, formatTicketPriority, formatTicketStatus } from "@/lib/utils"

interface Ticket {
  id: string
  ticketNumber: string
  subject: string
  category: string
  status: string
  priority: string
  createdAt: string
  updatedAt: string
  _count: {
    messages: number
  }
}

export default function SupportPage() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTickets()
  }, [])

  async function fetchTickets() {
    try {
      setLoading(true)
      const res = await fetch("/api/tickets")
      if (!res.ok) throw new Error("Failed to fetch tickets")

      const data = await res.json()
      setTickets(data.tickets)
    } catch (error) {
      console.error("Error fetching tickets:", error)
    } finally {
      setLoading(false)
    }
  }

  function getStatusBadgeVariant(status: string) {
    switch (status) {
      case "RESOLVED":
      case "CLOSED":
        return "success"
      case "OPEN":
        return "warning"
      case "IN_PROGRESS":
        return "default"
      case "WAITING_CUSTOMER":
        return "secondary"
      default:
        return "default"
    }
  }

  function getPriorityBadgeVariant(priority: string) {
    switch (priority) {
      case "URGENT":
        return "destructive"
      case "HIGH":
        return "warning"
      case "MEDIUM":
        return "secondary"
      case "LOW":
        return "outline"
      default:
        return "secondary"
    }
  }

  function getCategoryLabel(category: string) {
    const labels: Record<string, string> = {
      ORDER_ISSUE: "Problème de commande",
      PRODUCT_QUESTION: "Question produit",
      ACCOUNT: "Compte",
      BILLING: "Facturation",
      TECHNICAL: "Technique",
      OTHER: "Autre",
    }
    return labels[category] || category
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Support</h1>
          <p className="text-gray-500">Contactez notre équipe pour toute assistance</p>
        </div>
        <Button asChild>
          <Link href="/support/nouveau">
            <Plus className="mr-2 h-4 w-4" />
            Nouveau ticket
          </Link>
        </Button>
      </div>

      {/* Quick Contact Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
              <MessageCircle className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="font-medium">Par email</p>
              <p className="text-sm text-gray-500">support@deuxapara.ma</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
              <Clock className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="font-medium">Horaires</p>
              <p className="text-sm text-gray-500">Lun-Ven: 9h-18h</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
              <CheckCircle className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="font-medium">Temps de réponse</p>
              <p className="text-sm text-gray-500">Sous 24h ouvrées</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tickets List */}
      <Card>
        <CardHeader>
          <CardTitle>Mes tickets</CardTitle>
          <CardDescription>Historique de vos demandes de support</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>N° Ticket</TableHead>
                  <TableHead>Sujet</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Priorité</TableHead>
                  <TableHead>Créé le</TableHead>
                  <TableHead>Messages</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tickets.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      Aucun ticket trouvé. Créez votre premier ticket ci-dessus.
                    </TableCell>
                  </TableRow>
                ) : (
                  tickets.map((ticket) => (
                    <TableRow key={ticket.id}>
                      <TableCell className="font-medium">{ticket.ticketNumber}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{ticket.subject}</p>
                          <p className="text-xs text-gray-500">{getCategoryLabel(ticket.category)}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(ticket.status)}>
                          {formatTicketStatus(ticket.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getPriorityBadgeVariant(ticket.priority)}>
                          {formatTicketPriority(ticket.priority)}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDateShort(ticket.createdAt)}</TableCell>
                      <TableCell>{ticket._count.messages}</TableCell>
                      <TableCell>
                        <div className="flex justify-end">
                          <Button variant="ghost" size="icon" asChild>
                            <Link href={`/support/${ticket.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* FAQ Section */}
      <Card>
        <CardHeader>
          <CardTitle>Questions fréquentes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { q: "Comment passer une commande rapide ?", a: "Utilisez la page Commande rapide pour importer une liste de produits par copier-coller ou en recherchant individuellement." },
            { q: "Quels sont les délais de livraison ?", a: "Les délais varient entre 24h et 72h selon votre localisation." },
            { q: "Comment modifier une commande ?", a: "Contactez-nous rapidement via un ticket si votre commande n'est pas encore en préparation." },
          ].map((faq, i) => (
            <div key={i} className="rounded-lg border p-4">
              <p className="font-medium text-gray-900">{faq.q}</p>
              <p className="mt-1 text-sm text-gray-500">{faq.a}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
