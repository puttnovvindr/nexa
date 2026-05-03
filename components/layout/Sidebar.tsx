"use client"

import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  LayoutDashboard, 
  Users, 
  CalendarDays, 
  ClipboardList, 
  Wallet, 
  CalendarClock,
  Settings, 
  LucideIcon 
} from "lucide-react"
import { cn } from "@/lib/utils"

interface MenuItem {
  icon: LucideIcon
  label: string
  href: string
}

const menuItems: MenuItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/" },
  { icon: Users, label: "Employees", href: "/employees" },
  { icon: CalendarClock, label: "Leave", href: "/leave" }, 
  { icon: CalendarDays, label: "Attendance", href: "/attendance" },
  { icon: Wallet, label: "Payroll", href: "/payroll" },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="w-20 bg-white h-screen flex flex-col sticky top-0 font-poppins border-r border-slate-100 shadow-none transition-all duration-300">
      <div className="py-8 flex justify-center mb-4 mt-4">
        <div className="w-10 h-10 bg-[#7C3AED] rounded-xl flex items-center justify-center">
          <h1 className="text-xl font-black text-white uppercase tracking-tighter">N</h1>
        </div>
      </div>

      <nav className="flex-1 px-3 space-y-4 overflow-y-auto flex flex-col items-center">
        {menuItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))

          return (
            <Link
              key={item.label}
              href={item.href}
              title={item.label}
              className={cn(
                "flex items-center justify-center w-12 h-12 rounded-2xl transition-all group cursor-pointer relative",
                isActive
                  ? "bg-violet-50 text-[#7C3AED]" 
                  : "text-slate-400 hover:bg-slate-50 hover:text-slate-600"
              )}
            >
              {isActive && (
                <div className="absolute -left-3 w-1 h-6 bg-[#7C3AED] rounded-r-full" />
              )}
              
              <item.icon className={cn(
                "w-5 h-5 transition-all duration-300", 
                isActive ? "text-[#7C3AED] scale-110" : "text-slate-400 group-hover:text-slate-600"
              )} />
              
              <span className="sr-only">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="py-8 border-t border-slate-50 flex justify-center">
        <Link
          href="/settings"
          title="Settings"
          className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 cursor-pointer ring-2 ring-transparent hover:ring-[#7C3AED]/20 hover:bg-violet-50 hover:text-[#7C3AED] transition-all duration-300 group"
        >
          <Settings className="w-5 h-5 group-hover:rotate-45 transition-all duration-500" />
          <span className="sr-only">Settings</span>
        </Link>
      </div>
    </div>
  )
}