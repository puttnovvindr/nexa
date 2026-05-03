"use client"

import { Layers, TrendingUp, Zap, Users } from "lucide-react"
import { StatCard } from "@/components/data-table/stat-card"
import { SerializedComponentMaster } from "@/types/payroll"

interface MasterComponentStatsProps {
  data: SerializedComponentMaster[]
}

export function MasterComponentStats({ data = [] }: MasterComponentStatsProps) {
  const now = new Date()
  const firstDayCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const calculateTrend = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0
    return parseFloat(((current - previous) / previous * 100).toFixed(1))
  }

  const total = data.length
  const prevTotal = data.filter(d => new Date(d.createdAt) < firstDayCurrentMonth).length
  const totalTrend = calculateTrend(total, prevTotal)

  const totalEarnings = data.filter((d) => d.category === "EARNING").length
  const prevEarnings = data.filter((d) => d.category === "EARNING" && new Date(d.createdAt) < firstDayCurrentMonth).length
  const earningsTrend = calculateTrend(totalEarnings, prevEarnings)

  const totalDeductions = data.filter((d) => d.category === "DEDUCTION").length
  const prevDeductions = data.filter((d) => d.category === "DEDUCTION" && new Date(d.createdAt) < firstDayCurrentMonth).length
  const deductionsTrend = calculateTrend(totalDeductions, prevDeductions)

  const totalAssigned = data.reduce((acc, d) => acc + (d._count?.configs || 0), 0)

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 shrink-0">
      <StatCard
        label="Total Components"
        value={total}
        icon={Layers}
        iconBgColor="bg-violet-50"
        iconColor="text-violet-600"
        infoText="All registered payroll components (Earnings & Deductions)"
        trend={{ 
          value: totalTrend, 
          label: "vs last month",
          sentiment: "neutral" 
        }}
      />
      <StatCard
        label="Earnings"
        value={totalEarnings}
        icon={TrendingUp}
        iconBgColor="bg-emerald-50"
        iconColor="text-emerald-600"
        infoText="Components that add to gross salary (e.g., Basic, Transport)"
        trend={{ 
          value: earningsTrend, 
          label: "vs last month",
          sentiment: earningsTrend >= 0 ? "positive" : "negative"
        }}
      />
      <StatCard
        label="Deductions"
        value={totalDeductions}
        icon={Zap}
        iconBgColor="bg-rose-50"
        iconColor="text-rose-600"
        infoText="Components that reduce take-home pay (e.g., Tax, BPJS)"
        trend={{ 
          value: deductionsTrend, 
          label: "vs last month",
          sentiment: "neutral" 
        }}
      />
      <StatCard
        label="Total Assigned"
        value={totalAssigned}
        icon={Users}
        iconBgColor="bg-blue-50"
        iconColor="text-blue-600"
        infoText="Total active component-to-employee mappings"
        trend={{ 
          value: 0, 
          label: "current active",
          sentiment: "neutral"
        }}
      />
    </div>
  )
}