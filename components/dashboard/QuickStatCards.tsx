"use client"

import React from "react"
import { Users, UserCheck } from "lucide-react"
import { StatCard } from "@/components/data-table/stat-card"
import { EmployeeWithRelations } from "@/types/dashboard"

interface QuickStatCardsProps {
  data: EmployeeWithRelations[]
}

export function QuickStatCards({ data }: QuickStatCardsProps) {
  const totalEmployees = data.length
  const activeEmployees = data.filter(e => e.status === "ACTIVE").length
  
  const activeRate = totalEmployees > 0 
    ? Math.round((activeEmployees / totalEmployees) * 100) 
    : 0

  return (
    <div className="flex flex-col gap-4 h-[280px]">
      <div className="flex-1">
        <StatCard
          label="Total Workforce"
          value={totalEmployees}
          icon={Users}
          iconBgColor="bg-violet-50"
          iconColor="text-violet-600"
          infoText="Total registered employees in the system"
          trend={{ 
            value: 0, 
            label: "Total database",
            sentiment: "neutral"
          }}
        />
      </div>

      <div className="flex-1">
        <StatCard
          label="Active Staff"
          value={activeEmployees}
          icon={UserCheck}
          iconBgColor="bg-emerald-50"
          iconColor="text-emerald-600"
          infoText="Employees with active contract status"
          trend={{ 
            value: activeRate, 
            label: "% Retention rate",
            sentiment: "positive"
          }}
        />
      </div>
    </div>
  )
}