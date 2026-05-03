"use client"

import React from "react"
import { Users, PieChart, CalendarCheck, AlertCircle } from "lucide-react"
import { StatCard } from "@/components/data-table/stat-card"

type LeaveBalanceWithMeta = {
  id: string
  entitlement: number
  taken: number
  remaining: number
  createdAt?: Date | string
}

interface Props {
  data: LeaveBalanceWithMeta[]
}

export function LeaveBalanceStats({ data = [] }: Props) {
  const now = new Date()
  const firstDayCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const calculateTrend = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0
    return parseFloat(((current - previous) / previous * 100).toFixed(1))
  }

  const totalRecords = data.length
  const totalEntitlement = data.reduce((acc, curr) => acc + curr.entitlement, 0)
  const totalTaken = data.reduce((acc, curr) => acc + curr.taken, 0)
  const lowBalanceCount = data.filter(b => b.remaining <= 2).length
  const prevData = data.filter(d => d.createdAt && new Date(d.createdAt) < firstDayCurrentMonth)
  const prevTotalRecords = prevData.length
  const prevEntitlement = prevData.reduce((acc, curr) => acc + curr.entitlement, 0)
  const prevTaken = prevData.reduce((acc, curr) => acc + curr.taken, 0)
  const prevLowBalance = prevData.filter(b => b.remaining <= 2).length

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 shrink-0">
      
      <StatCard 
        label="Total Records"
        value={totalRecords}
        icon={Users}
        iconBgColor="bg-sky-50"
        iconColor="text-sky-600"
        infoText="Number of employee leave balance entries"
        trend={{
          value: calculateTrend(totalRecords, prevTotalRecords),
          label: "vs last month",
          sentiment: "neutral"
        }}
      />

      <StatCard 
        label="Total Entitlement"
        value={`${totalEntitlement} Days`}
        icon={PieChart}
        iconBgColor="bg-indigo-50"
        iconColor="text-indigo-600"
        infoText="Sum of all allocated leave days for this year"
        trend={{
          value: calculateTrend(totalEntitlement, prevEntitlement),
          label: "allocated days",
          sentiment: "positive"
        }}
      />

      <StatCard 
        label="Total Days Taken"
        value={`${totalTaken} Days`}
        icon={CalendarCheck}
        iconBgColor="bg-emerald-50"
        iconColor="text-emerald-600"
        infoText="Total leave days consumed by employees"
        trend={{
          value: calculateTrend(totalTaken, prevTaken),
          label: "usage trend",
          sentiment: "neutral"
        }}
      />

      <StatCard 
        label="Low Balance"
        value={lowBalanceCount}
        icon={AlertCircle}
        iconBgColor="bg-rose-50"
        iconColor="text-rose-600"
        infoText="Employees with 2 or fewer days remaining"
        trend={{
          value: calculateTrend(lowBalanceCount, prevLowBalance),
          label: "critical status",
          sentiment: lowBalanceCount > prevLowBalance ? "negative" : "positive"
        }}
      />

    </div>
  )
}