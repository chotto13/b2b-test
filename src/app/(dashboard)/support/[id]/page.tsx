"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Send, Loader2, User } from "lucide-react"
import { formatDateTime, formatTicketStatus, formatTicketPriority } from "@/lib/utils"

interface Message {
  id: string
  content: string
  createdAt: string
  isInternal: boolean
  user: {
    firstName: string
    lastName: string
    role: string
  }
}

interface Ticket {
  id: string
  ticketNumber: string
  subject: string
  description: string
  status: string
  priority: string
  category: string
  createdAt: string
  updatedAt: string
  messages: Message[]
}

export default function TicketDetailPage() {
  const params = useParams()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [newMessage, setNewMessage] = useState("")

  useEffect(() => {
    if (params.id) {
      fetchTicket()
    }
  }, [params.id])

  useEffect(() => {
    scrollToBottom()
  }, [ticket?.messages])

  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  async function fetchTicket() {
    try {
      setLoading(true)
      const res = await fetch(`/api/tickets/${params.id}`)
      if (!res.ok) throw new Error("Failed to fetch ticket")

      const data = await res.json()
      setTicket(data.ticket)
    } catch (error) {
      console.error("Error fetching ticket:", error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault()
    if (!newMessage.trim() || sending) return

    try {
      setSending(true)
      const res = await fetch(`/api/tickets/${params.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newMessage }),
      })

      if (!res.ok) throw new Error("Failed to send message")

      setNewMessage("")
      await fetchTicket()
    } catch (error) {
      console.error("Error sending message:", error)
    } finally {
      setSending(false)
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (!ticket) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Ticket non trouvé</p>
        <Button asChild className="mt-4">
          <Link href="/support">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour au support
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Button variant="ghost" size="sm" asChild className="mb-2">
          <Link href="/support">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Link>
        </Button>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{ticket.subject}</h1>
            <p className="text-gray-500">{ticket.ticketNumber}</p>
          </div>
          <div className="flex gap-2">
            <Badge variant={getStatusBadgeVariant(ticket.status)}>
              {formatTicketStatus(ticket.status)}
            </Badge>
            <Badge variant={getPriorityBadgeVariant(ticket.priority)}>
              {formatTicketPriority(ticket.priority)}
            </Badge>
          </div>
        </div>
      </div>

      {/* Ticket Info */}
      <Card>
        <CardContent className="p-4">
          <div className="grid gap-4 sm:grid-cols-3 text-sm">
            <div>
              <span className="text-gray-500">Catégorie:</span>
              <span className="ml-2 font-medium">{getCategoryLabel(ticket.category)}</span>
            </div>
            <div>
              <span className="text-gray-500">Créé le:</span>
              <span className="ml-2 font-medium">{formatDateTime(ticket.createdAt)}</span>
            </div>
            <div>
              <span className="text-gray-500">Mis à jour:</span>
              <span className="ml-2 font-medium">{formatDateTime(ticket.updatedAt)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Messages */}
      <Card className="flex flex-col h-[500px]">
        <CardHeader>
          <CardTitle>Messages</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto space-y-4">
          {ticket.messages.length === 0 ? (
            <p className="text-center text-gray-500 py-8">Aucun message</p>
          ) : (
            ticket.messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.user.role === "ADMIN" ? "flex-row" : "flex-row-reverse"
                }`}
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100">
                  <User className="h-4 w-4 text-gray-600" />
                </div>
                <div
                  className={`rounded-lg px-4 py-2 max-w-[80%] ${
                    message.user.role === "ADMIN"
                      ? "bg-gray-100"
                      : "bg-blue-50"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium">
                      {message.user.firstName} {message.user.lastName}
                    </span>
                    <span className="text-xs text-gray-400">
                      {formatDateTime(message.createdAt)}
                    </span>
                    {message.user.role === "ADMIN" && (
                      <Badge variant="outline" className="text-xs">Support</Badge>
                    )}
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </CardContent>

        {/* Message Input */}
        <CardContent className="border-t pt-4">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Écrivez votre message..."
              className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm text-slate-900 ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
              rows={2}
              disabled={sending || ticket.status === "CLOSED"}
            />
            <Button
              type="submit"
              disabled={sending || !newMessage.trim() || ticket.status === "CLOSED"}
            >
              {sending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>
          {ticket.status === "CLOSED" && (
            <p className="text-xs text-gray-500 mt-2">
              Ce ticket est fermé. Vous ne pouvez plus envoyer de messages.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
