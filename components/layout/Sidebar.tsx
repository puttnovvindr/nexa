"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  LayoutDashboard, 
  Users, 
  CalendarDays, 
  ClipboardList, 
  Wallet, 
  ChevronDown 
} from "lucide-react"
import { cn } from "@/lib/utils"

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/" },
  { 
    icon: Users, 
    label: "Employees", 
    href: "/employees",
    submenu: [
      { label: "Employee Lists", href: "/employees" },
      { label: "Employee Configurations", href: "/employees/settings" }
    ]
  },
  { icon: CalendarDays, label: "Attendance", href: "/attendance" },
  { icon: Wallet, label: "Payroll", href: "/payroll" },
  { icon: ClipboardList, label: "Report", href: "/reports" },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="w-64 border-r bg-white h-screen flex flex-col sticky top-0">
      <div className="p-6">
        <h1 className="text-xl font-bold text-indigo-600">Nexa</h1>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
          
          return (
            <div key={item.label}>
              <Link
                href={item.href}
                className={cn(
                  "flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                  isActive 
                    ? "bg-indigo-50 text-indigo-600" 
                    : "text-gray-600 hover:bg-gray-50"
                )}
              >
                <div className="flex items-center gap-3">
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </div>
                {item.submenu && <ChevronDown className="w-4 h-4" />}
              </Link>
              
              {item.submenu && isActive && (
                <div className="ml-9 mt-2 space-y-1">
                  {item.submenu.map((sub) => (
                    <Link
                      key={sub.label}
                      href={sub.href}
                      className={cn(
                        "block px-4 py-2 text-xs rounded-md",
                        pathname === sub.href ? "text-indigo-600 font-semibold" : "text-gray-500 hover:text-gray-700"
                      )}
                    >
                      {sub.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </nav>
    </div>
  )
}