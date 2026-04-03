"use client"

import type React from "react"

import { useState } from "react"
import {Link, useLocation} from "react-router-dom"
// import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Calendar,
  Users,
  Ticket,
  BarChart3,
  Settings,
  ChevronDown,
  ChevronUp,
  Menu,
  X,
} from "lucide-react"
import { Button } from "@heroui/react"
import { cn } from "@/lib/utils"

interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
  badge?: string
  submenu?: NavItem[]
}

interface SidebarNavProps {
  userRole: "ORGANIZER" | "ATTENDEE"
}

export default function SidebarNav({ userRole }: SidebarNavProps) {
    const location = useLocation();
  const pathname = location.pathname;
  const [isOpen, setIsOpen] = useState(true)
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null)
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const organizerNavItems: NavItem[] = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      label: "Events",
      href: "/events-management",
      icon: <Calendar className="w-5 h-5" />,
    },
    {
      label: "Attendees",
      href: "/attendees",
      icon: <Users className="w-5 h-5" />,
    },
    {
      label: "Analytics",
      href: "/analytics",
      icon: <BarChart3 className="w-5 h-5" />,
    },
    {
      label: "Settings",
      href: "/settings",
      icon: <Settings className="w-5 h-5" />,
    },
  ]

  const attendeeNavItems: NavItem[] = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      label: "My Bookings",
      href: "/bookings",
      icon: <Ticket className="w-5 h-5" />,
    },
    {
      label: "Discover Events",
      href: "/discover",
      icon: <Calendar className="w-5 h-5" />,
    },
    {
      label: "Settings",
      href: "/settings",
      icon: <Settings className="w-5 h-5" />,
    },
  ]

  const navItems = userRole === "ORGANIZER" ? organizerNavItems : attendeeNavItems

  const NavLink = ({ item }: { item: NavItem }) => {
    const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
    const hasSubmenu = item.submenu && item.submenu.length > 0
    const isExpanded = expandedMenu === item.label

    return (
      <div key={item.label}>
        <Link 
        to={item.href}
        onClick={(e) => {
              if (hasSubmenu) {
                e.preventDefault()
                setExpandedMenu(isExpanded ? null : item.label)
              }
            }}
        className={cn(
              "w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-foreground hover:bg-sidebar/50 text-muted-foreground hover:text-foreground",
            )}
          >
            <div className="flex items-center gap-3">
              {item.icon}
              <span className={cn("font-medium", !isOpen && "hidden")}>{item.label}</span>
            </div>
            {hasSubmenu && isOpen && (
              <div className="ml-auto">
                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            )}
            {item.badge && isOpen && (
              <span className="ml-auto bg-destructive text-xs px-2 py-1 rounded-full text-destructive-foreground">
                {item.badge}
              </span>
            )}
        </Link>

        {hasSubmenu && isExpanded && isOpen && (
          <div className="ml-4 mt-1 space-y-1 border-l border-border pl-3">
            {item.submenu!.map((subitem) => {
              const isSubActive = pathname === subitem.href
              return (
                <Link key={subitem.label} to={subitem.href}>
                  <button
                    className={cn(
                      "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors",
                      isSubActive
                        ? "bg-primary/20 text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-sidebar/50",
                    )}
                  >
                    {subitem.label}
                  </button>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  return (
    <>
      {/* Mobile Menu Toggle */}
      <Button
        variant="ghost"
        size="sm"
        onPress={() => setIsMobileOpen(!isMobileOpen)}
        className="fixed top-20 left-4 z-40 md:hidden"
      >
        {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </Button>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-16 h-[calc(100vh-4rem)] bg-sidebar border-r border-sidebar-border transition-all duration-300 z-30",
          isOpen ? "w-64" : "w-20",
          isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        )}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
          {isOpen && <h2 className="font-semibold text-sidebar-foreground hidden md:block">Menu</h2>}
          <Button
            variant="ghost"
            size="sm"
            onPress={() => setIsOpen(!isOpen)}
            className="text-sidebar-foreground hover:bg-sidebar-accent hidden md:flex"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {navItems.map((item) => (
            <NavLink key={item.label} item={item} />
          ))}
        </nav>

        {/* Sidebar Footer */}
        {isOpen && (
          <div className="p-4 border-t border-sidebar-border mt-auto">
            <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-sidebar-accent/50">
              <div className="w-8 h-8 rounded-full bg-sidebar-primary flex items-center justify-center text-sidebar-primary-foreground text-sm font-semibold">
                U
              </div>
              <div>
                <p className="text-sm font-medium text-sidebar-foreground">User</p>
                <p className="text-xs text-sidebar-accent-foreground">{userRole}</p>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 bg-black/50 z-20 md:hidden" onClick={() => setIsMobileOpen(false)} />
      )}
    </>
  )
}
