"use client"

import React from "react"
import { ClipboardList, Wallet, Ban, Thermometer } from "lucide-react"
import { StatCard } from "@/components/data-table/stat-card"

type LeaveTypeWithMeta = {
  id: string
  name: string
  category: "PAID" | "UNPAID" | "SICK"
  createdAt?: Date | string
}

interface Props {
  data: LeaveTypeWithMeta[]
}

export function LeaveTypeStats({ data = [] }: Props) {
  const now = new Date()
  const firstDayCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const calculateTrend = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0
    return parseFloat(((current - previous) / previous * 100).toFixed(1))
  }

  const total = data.length
  const prevTotal = data.filter(d => d.createdAt && new Date(d.createdAt) < firstDayCurrentMonth).length
  
  const paid = data.filter((t) => t.category === "PAID")
  const unpaid = data.filter((t) => t.category === "UNPAID")
  const sick = data.filter((t) => t.category === "SICK")

  const getPrevCount = (list: LeaveTypeWithMeta[]) => 
    list.filter(d => d.createdAt && new Date(d.createdAt) < firstDayCurrentMonth).length

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 shrink-0">
      
      <StatCard 
        label="Total Types"
        value={total}
        icon={ClipboardList}
        iconBgColor="bg-blue-50"
        iconColor="text-blue-600"
        infoText="Master categories of leave policies"
        trend={{
          value: calculateTrend(total, prevTotal),
          label: "from last month",
          sentiment: "neutral"
        }}
      />

      <StatCard 
        label="Paid Leave"
        value={paid.length}
        icon={Wallet}
        iconBgColor="bg-emerald-50"
        iconColor="text-emerald-600"
        infoText="Leave types that are fully compensated"
        trend={{
          value: calculateTrend(paid.length, getPrevCount(paid)),
          label: "new policies",
          sentiment: "positive"
        }}
      />

      <StatCard 
        label="Unpaid Leave"
        value={unpaid.length}
        icon={Ban}
        iconBgColor="bg-amber-50"
        iconColor="text-amber-600"
        infoText="Leave types without compensation"
        trend={{
          value: calculateTrend(unpaid.length, getPrevCount(unpaid)),
          label: "vs last month",
          sentiment: "neutral"
        }}
      />

      <StatCard 
        label="Sick Leave"
        value={sick.length}
        icon={Thermometer}
        iconBgColor="bg-rose-50"
        iconColor="text-rose-600"
        infoText="Medical and health related categories"
        trend={{
          value: calculateTrend(sick.length, getPrevCount(sick)),
          label: "vs last month",
          sentiment: "positive"
        }}
      />

    </div>
  )
}