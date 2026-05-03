"use client"

import React from "react"
import { EmployeeWithRelations } from "@/types/dashboard"
import { AttendanceWithEmployee } from "@/types/attendance"

import { DashboardTaskTable } from "./DashboardTaskTable"
import { TalentMovementChart } from "./TalentMovementChart"
import { PayrollTrendChart } from "./PayrollTrendChart"
import { ApprovalQueueCard } from "./ApprovalQueueCard"
import { EmployeeEventTracker } from "./EmployeeEventTracker"
import { QuickStatCards } from "./QuickStatCards" 

interface DashboardClientProps {
  employees: EmployeeWithRelations[]
  attendances: AttendanceWithEmployee[]
}

export default function DashboardClient({ 
  employees, 
}: DashboardClientProps) {
  
  return (
    <div className="flex flex-col gap-6 h-full font-poppins text-slate-900">
      
      <div className="w-full bg-gradient-to-r from-[#7C3AED] to-[#A78BFA] py-5 px-7 rounded-2xl shrink-0 shadow-lg shadow-purple-200/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl -mr-5 -mt-5" />
        <div className="relative z-10 text-white">
          <h1 className="text-[16px] font-bold tracking-tight uppercase">HR Control Center</h1>
          <p className="opacity-80 text-[12px] font-medium mt-0.5">Real-time operational telemetry and priority monitoring</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <QuickStatCards data={employees} />
        <DashboardTaskTable data={employees} />
        <EmployeeEventTracker data={employees} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <PayrollTrendChart />
        <ApprovalQueueCard />
        <TalentMovementChart data={employees} />
      </div>
    </div>
  )
}