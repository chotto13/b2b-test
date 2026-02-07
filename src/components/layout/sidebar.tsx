"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useSession } from "next-auth/react"
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  FileText,
  Headphones,
  UserCircle,
  Settings,
  Users,
  BarChart3,
  Tags,
  Warehouse,
  FileSpreadsheet,
  ClipboardList,
} from "lucide-react"

interface SidebarProps {
  isOpen?: boolean
  onClose?: () => void
  className?: string
}

interface NavItem {
  label: string
  href: string
  icon: React.ElementType
  roles?: string[]
  children?: NavItem[]
}

const navigation: NavItem[] = [
  {
    label: "Tableau de bord",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Catalogue",
    href: "/catalogue",
    icon: Package,
  },
  {
    label: "Commande rapide",
    href: "/commande-rapide",
    icon: ClipboardList,
  },
  {
    label: "Mes commandes",
    href: "/commandes",
    icon: ShoppingBag,
  },
  {
    label: "Factures",
    href: "/factures",
    icon: FileText,
  },
  {
    label: "Support",
    href: "/support",
    icon: Headphones,
  },
  {
    label: "Mon compte",
    href: "/compte",
    icon: UserCircle,
  },
]

const adminNavigation: NavItem[] = [
  {
    label: "Tableau de bord",
    href: "/admin",
    icon: LayoutDashboard,
    roles: ["ADMIN", "SUPER_ADMIN"],
  },
  {
    label: "Produits",
    href: "/admin/produits",
    icon: Package,
    roles: ["ADMIN", "SUPER_ADMIN"],
  },
  {
    label: "Import/Export",
    href: "/admin/import-export",
    icon: FileSpreadsheet,
    roles: ["ADMIN", "SUPER_ADMIN"],
  },
  {
    label: "Catégories",
    href: "/admin/categories",
    icon: Tags,
    roles: ["ADMIN", "SUPER_ADMIN"],
  },
  {
    label: "Commandes",
    href: "/admin/commandes",
    icon: ShoppingBag,
    roles: ["ADMIN", "SUPER_ADMIN"],
  },
  {
    label: "Clients",
    href: "/admin/clients",
    icon: Users,
    roles: ["ADMIN", "SUPER_ADMIN"],
  },
  {
    label: "Stock",
    href: "/admin/stock",
    icon: Warehouse,
    roles: ["ADMIN", "SUPER_ADMIN"],
  },
  {
    label: "Rapports",
    href: "/admin/rapports",
    icon: BarChart3,
    roles: ["ADMIN", "SUPER_ADMIN"],
  },
  {
    label: "Paramètres",
    href: "/admin/parametres",
    icon: Settings,
    roles: ["ADMIN", "SUPER_ADMIN"],
  },
]

export function Sidebar({ isOpen, onClose, className }: SidebarProps) {
  const pathname = usePathname()
  const { data: session } = useSession()
  
  const isAdmin = session?.user?.role === "ADMIN" || session?.user?.role === "SUPER_ADMIN"
  const navItems = isAdmin ? adminNavigation : navigation

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-full w-64 transform border-r bg-white transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static",
          isOpen ? "translate-x-0" : "-translate-x-full",
          className
        )}
      >
        {/* Logo for mobile */}
        <div className="flex h-16 items-center border-b px-6 lg:hidden">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
              <span className="text-sm font-bold text-white">2A</span>
            </div>
            <span className="font-semibold text-gray-900">Deux A Para</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex h-[calc(100vh-4rem)] flex-col gap-1 overflow-y-auto p-4 lg:h-[calc(100vh-1rem)]">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
            const Icon = item.icon

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                )}
                onClick={() => onClose?.()}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {item.label}
              </Link>
            )
          })}

          {/* Admin Section Label */}
          {!isAdmin && (
            <div className="mt-6 mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
              Administration
            </div>
          )}
          
          {/* Quick Links for non-admin */}
          {!isAdmin && (
            <>
              <Link
                href="/panier"
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  pathname === "/panier"
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                )}
              >
                <ShoppingBag className="h-5 w-5 shrink-0" />
                Mon Panier
              </Link>
            </>
          )}
        </nav>

        {/* Version Footer */}
        <div className="border-t p-4">
          <p className="text-xs text-gray-500">
            Deux A Para Espace Pro v1.0
          </p>
          <p className="text-xs text-gray-400 mt-1">
            © 2024 Tous droits réservés
          </p>
        </div>
      </aside>
    </>
  )
}
