"use client"

import { Users, UserCheck, Briefcase, TrendingUp } from "lucide-react"
import { StatCard } from "@/components/data-table/stat-card"
import { EmployeeWithRelations } from "@/types/employee"

interface EmployeeStatsProps {
  data: EmployeeWithRelations[]
}

export function EmployeeStats({ data }: EmployeeStatsProps) {
  const now = new Date()
  const firstDayCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const oneMonthAgo = new Date()
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)

  const calculateTrend = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0
    return parseFloat(((current - previous) / previous * 100).toFixed(1))
  }

  const totalEmployees = data.length
  const prevTotalEmployees = data.filter(emp => new Date(emp.createdAt) < firstDayCurrentMonth).length
  const totalTrend = calculateTrend(totalEmployees, prevTotalEmployees)

  const activeEmployees = data.filter(emp => emp.isActive).length
  const prevActiveEmployees = data.filter(emp => emp.isActive && new Date(emp.createdAt) < firstDayCurrentMonth).length
  const activeTrend = calculateTrend(activeEmployees, prevActiveEmployees)

  const totalDepts = new Set(data.map(emp => emp.job?.orgUnit?.name).filter(Boolean)).size

  const newJoiners = data.filter(emp => new Date(emp.createdAt) >= oneMonthAgo).length
  const prevNewJoiners = data.filter(emp => {
    const twoMonthsAgo = new Date()
    twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2)
    const date = new Date(emp.createdAt)
    return date >= twoMonthsAgo && date < oneMonthAgo
  }).length
  const joinerTrend = calculateTrend(newJoiners, prevNewJoiners)

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 shrink-0">
      <StatCard 
        label="Total Employees"
        value={totalEmployees}
        icon={Users}
        iconBgColor="bg-blue-50"
        iconColor="text-blue-600"
        infoText="Total registered employees in the database"
        trend={{
          value: totalTrend,
          label: "from last month",
          sentiment: "neutral"
        }}
      />

      <StatCard 
        label="Active Staff"
        value={activeEmployees}
        icon={UserCheck}
        iconBgColor="bg-emerald-50"
        iconColor="text-emerald-600"
        infoText="Employees with active working status"
        trend={{
          value: activeTrend,
          label: "vs last month",
          sentiment: "positive"
        }}
      />

      <StatCard 
        label="New Joiners"
        value={newJoiners}
        icon={TrendingUp}
        iconBgColor="bg-violet-50"
        iconColor="text-violet-600"
        infoText="Employees who joined within the last 30 days"
        trend={{
          value: joinerTrend,
          label: "vs prev month",
          sentiment: "positive"
        }}
      />
    </div>
  )
}