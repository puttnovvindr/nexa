"use client"

import { DollarSign, Users, TrendingUp, Zap } from "lucide-react"
import { StatCard } from "@/components/data-table/stat-card"
import { SerializedSalaryConfig } from "@/types/payroll"

interface SalaryConfigStatsProps {
  data: SerializedSalaryConfig[]
}

function formatCurrency(value: number): string {
  return `IDR ${Math.round(value).toLocaleString("id-ID")}`
}

export function SalaryConfigStats({ data = [] }: SalaryConfigStatsProps) {
  const now = new Date()
  const firstDayCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const calculateTrend = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0
    return parseFloat(((current - previous) / previous * 100).toFixed(1))
  }

  const dataBeforeThisMonth = data.filter(
    (d) => new Date(d.createdAt) < firstDayCurrentMonth
  )

  const totalBaseRate = data.reduce((acc, c) => acc + Number(c.baseRate), 0)
  const prevTotalBaseRate = dataBeforeThisMonth.reduce((acc, c) => acc + Number(c.baseRate), 0)
  const totalBaseTrend = calculateTrend(totalBaseRate, prevTotalBaseRate)

  const activeCount = data.length
  const prevActiveCount = dataBeforeThisMonth.length
  const activeTrend = calculateTrend(activeCount, prevActiveCount)

  const avgRate = activeCount > 0 ? totalBaseRate / activeCount : 0
  const prevAvgRate = prevActiveCount > 0 ? prevTotalBaseRate / prevActiveCount : 0
  const avgTrend = calculateTrend(avgRate, prevAvgRate)

  const totalComponents = data.reduce((acc, c) => acc + (c._count?.components || 0), 0)
  const prevTotalComponents = dataBeforeThisMonth.reduce((acc, c) => acc + (c._count?.components || 0), 0)
  const componentsTrend = calculateTrend(totalComponents, prevTotalComponents)

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 shrink-0">
      <StatCard
        label="Total Base Value"
        value={formatCurrency(totalBaseRate)}
        icon={DollarSign}
        iconBgColor="bg-emerald-50"
        iconColor="text-emerald-600"
        infoText="Combined base rate of all configured employees"
        trend={{ 
          value: totalBaseTrend, 
          label: "vs last month",
          sentiment: totalBaseTrend >= 0 ? "positive" : "negative"
        }}
      />
      <StatCard
        label="Active Configs"
        value={activeCount}
        icon={Users}
        iconBgColor="bg-blue-50"
        iconColor="text-blue-600"
        infoText="Total employees with salary structures"
        trend={{ 
          value: activeTrend, 
          label: "new setups",
          sentiment: "neutral" 
        }}
      />
      <StatCard
        label="Avg. Base Rate"
        value={formatCurrency(avgRate)}
        icon={TrendingUp}
        iconBgColor="bg-violet-50"
        iconColor="text-violet-600"
        infoText="Average base rate across the workforce"
        trend={{ 
          value: avgTrend, 
          label: "vs last month",
          sentiment: "neutral"
        }}
      />
      <StatCard
        label="Total Components"
        value={totalComponents}
        icon={Zap}
        iconBgColor="bg-amber-50"
        iconColor="text-amber-600"
        infoText="Total salary components actively assigned"
        trend={{ 
          value: componentsTrend, 
          label: "vs last month",
          sentiment: "positive"
        }}
      />
    </div>
  )
}