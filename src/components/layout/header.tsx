"use client"

import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { Search, ShoppingCart, User, Menu, Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"

interface HeaderProps {
  onMenuToggle?: () => void
  className?: string
}

export function Header({ onMenuToggle, className }: HeaderProps) {
  const { data: session } = useSession()
  const [cartCount, setCartCount] = useState(0)

  useEffect(() => {
    // Fetch cart count
    const fetchCart = async () => {
      try {
        const response = await fetch("/api/cart")
        if (response.ok) {
          const data = await response.json()
          setCartCount(data.itemCount || 0)
        }
      } catch {
        // Silent fail
      }
    }
    
    fetchCart()
    
    // Poll for cart updates
    const interval = setInterval(fetchCart, 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <header className={cn("sticky top-0 z-40 w-full border-b bg-white/80 backdrop-blur-md", className)}>
      <div className="flex h-16 items-center gap-4 px-4 sm:px-6">
        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onMenuToggle}
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Ouvrir le menu</span>
        </Button>

        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 shadow-sm">
            <span className="text-sm font-bold text-white">2A</span>
          </div>
          <div className="hidden sm:block">
            <span className="font-semibold text-slate-900">Deux A Para</span>
            <span className="ml-2 text-xs text-slate-400">Espace Pro</span>
          </div>
        </Link>

        {/* Search Bar */}
        <div className="flex-1 max-w-md mx-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              placeholder="Rechercher un produit..."
              className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          {/* Cart */}
          <Button variant="ghost" size="icon" asChild className="relative">
            <Link href="/panier">
              <ShoppingCart className="h-5 w-5 text-slate-600" />
              {cartCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-xs font-medium text-white">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
              <span className="sr-only">Panier</span>
            </Link>
          </Button>

          {/* User Menu */}
          {session?.user ? (
            <div className="flex items-center gap-3 pl-4 border-l">
              <div className="hidden text-right md:block">
                <p className="text-sm font-medium text-slate-900">
                  {session.user.firstName} {session.user.lastName}
                </p>
                <p className="text-xs text-slate-500">{session.user.companyName}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full"
                onClick={() => signOut({ callbackUrl: '/login' })}
              >
                <User className="h-5 w-5" />
              </Button>
            </div>
          ) : (
            <Button asChild size="sm">
              <Link href="/login">Connexion</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
