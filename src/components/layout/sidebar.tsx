"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu } from "lucide-react"
import type { UserProfile, UserRole } from "@/lib/types"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from "@/components/ui/sheet"

type NavItem = {
  label: string
  href: string
}

const navByRole: Record<UserRole, NavItem[]> = {
  super_admin: [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Organizations", href: "/organizations" },
    { label: "Move Ideas Library", href: "/move-ideas" },
    { label: "Feedback Inbox", href: "/feedback" }
  ],
  org_admin: [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Donors", href: "/donors" },
    { label: "Moves", href: "/moves" },
    { label: "Settings", href: "/settings" },
    { label: "Users", href: "/users" }
  ],
  solicitor: [
    { label: "Dashboard", href: "/dashboard" },
    { label: "My Donors", href: "/donors" },
    { label: "My Moves", href: "/moves" },
    { label: "Calendar", href: "/calendar" }
  ]
}

function NavLinks({
  items,
  pathname
}: {
  items: NavItem[]
  pathname: string
}) {
  return (
    <nav className="space-y-1">
      {items.map((item) => {
        const isActive =
          pathname === item.href || pathname.startsWith(`${item.href}/`)
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`block rounded-md px-3 py-2 text-sm transition ${
              isActive
                ? "bg-slate-700 text-white"
                : "text-slate-200 hover:bg-slate-800 hover:text-white"
            }`}
          >
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}

export function Sidebar({ userProfile }: { userProfile: UserProfile }) {
  const pathname = usePathname()
  const navItems = navByRole[userProfile.role] ?? []

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 bg-slate-900 p-4 text-white md:block">
        <div className="mb-6 text-lg font-semibold">Donor Moves</div>
        <NavLinks items={navItems} pathname={pathname} />
      </aside>

      <div className="md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="m-4">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Open navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 bg-slate-900 p-4 text-white">
            <SheetHeader>
              <SheetTitle className="text-left text-white">Donor Moves</SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              <NavLinks items={navItems} pathname={pathname} />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  )
}
