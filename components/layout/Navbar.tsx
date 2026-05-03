"use client"

import React from "react"
import { Bell, ChevronLeft } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { useRouter, usePathname } from "next/navigation"

export default function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const isEmployeeSettings = pathname.includes("/employees/settings")
  const isPayrollSettings = pathname.includes("/payroll/settings")
  const isLeaveSettings = pathname.includes("/leave/settings")

  return (
    <header className="h-20 border-b border-gray-100 bg-white/80 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-20 font-poppins">
      <div className="flex items-center min-w-[200px]">
        {isEmployeeSettings && (
          <Button 
            variant="ghost" 
            onClick={() => router.push("/employees")}
            className="flex items-center gap-2.5 text-slate-500 hover:text-slate-900 transition-all font-semibold text-[13px] tracking-tight group cursor-pointer p-0 hover:bg-transparent"
          >
            <ChevronLeft className="w-4 h-4 transition-transform font-poppins" />
            Back to Employees
          </Button>
        )}

        {isPayrollSettings && (
          <Button 
            variant="ghost" 
            onClick={() => router.push("/payroll")}
            className="flex items-center gap-2.5 text-slate-500 hover:text-slate-900 transition-all font-semibold text-[13px] tracking-tight group cursor-pointer p-0 hover:bg-transparent"
          >
            <ChevronLeft className="w-4 h-4 transition-transform font-poppins" />
            Back to Payroll
          </Button>
        )}

        {isLeaveSettings && (
          <Button 
            variant="ghost" 
            onClick={() => router.push("/leave")}
            className="flex items-center gap-2.5 text-slate-500 hover:text-slate-900 transition-all font-semibold text-[13px] tracking-tight group cursor-pointer p-0 hover:bg-transparent"
          >
            <ChevronLeft className="w-4 h-4 transition-transform font-poppins" />
            Back to Leave
          </Button>
        )}
      </div>

      <div className="flex items-center gap-6">
        <button className="relative p-2.5 hover:bg-slate-50 rounded-xl text-gray-400 transition-colors border border-transparent hover:border-slate-100 group">
          <Bell className="w-5 h-5 group-hover:text-[#1E293B]" />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>

        <div className="flex items-center gap-4 pl-6 border-l border-gray-100">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-black text-[#1E293B] tracking-tight">Novita</p>
            <p className="text-[10px] font-bold text-gray-400 font-poppins uppercase tracking-wider leading-none mt-0.5">Administrator</p>
          </div>
          <Avatar className="h-10 w-10 border border-slate-100 shadow-sm ring-2 ring-white ring-offset-2 ring-offset-slate-50">
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback className="bg-slate-100 text-[#1E293B] font-bold text-xs">NV</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  )
}