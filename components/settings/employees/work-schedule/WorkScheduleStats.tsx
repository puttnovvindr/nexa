"use client"

import { WorkSchedule } from "@prisma/client"
import { StatCard } from "@/components/data-table/stat-card"
import { Clock, Timer, Users, Zap } from "lucide-react"

type WorkScheduleWithCounts = WorkSchedule & {
  createdAt?: Date | string
  _count?: { employees: number }
}

interface Props {
  data: WorkScheduleWithCounts[]
}

export function WorkScheduleStats({ data = [] }: Props) {
  const now = new Date()
  const firstDayCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const calculateTrend = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0
    return parseFloat(((current - previous) / previous * 100).toFixed(1))
  }

  const getShiftDuration = (start: string, end: string) => {
    const [h1, m1] = start.split(":").map(Number)
    const [h2, m2] = end.split(":").map(Number)
    let diff = (h2 * 60 + m2) - (h1 * 60 + m1)
    if (diff < 0) diff += 24 * 60 
    return diff / 60
  }

  const total = data.length
  const totalDuration = data.reduce((acc, curr) => acc + getShiftDuration(curr.checkInTime, curr.checkOutTime), 0)
  const avgDuration = total === 0 ? 0 : (totalDuration / total).toFixed(1)
  const totalAssigned = data.reduce((acc, curr) => acc + (curr._count?.employees || 0), 0)
  const avgOT = total === 0 ? 0 : Math.round(data.reduce((acc, curr) => acc + (curr.overtimeThreshold || 0), 0) / total)
  const prevData = data.filter(s => s.createdAt ? new Date(s.createdAt) < firstDayCurrentMonth : false)
  const prevTotal = prevData.length
  const prevAvgDuration = prevTotal === 0 ? 0 : (prevData.reduce((acc, curr) => acc + getShiftDuration(curr.checkInTime, curr.checkOutTime), 0) / prevTotal).toFixed(1)
  const prevAvgOT = prevTotal === 0 ? 0 : Math.round(prevData.reduce((acc, curr) => acc + (curr.overtimeThreshold || 0), 0) / prevTotal)

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 shrink-0">
      <StatCard
        label="Total Schedules"
        value={total}
        icon={Clock}
        trend={{
          value: calculateTrend(total, prevTotal),
          label: "vs last month",
          sentiment: total >= prevTotal ? "positive" : "negative"
        }}
      />
      
      <StatCard
        label="Avg. Shift Hours"
        value={`${avgDuration} hrs`}
        icon={Timer}
        trend={{
          value: calculateTrend(Number(avgDuration), Number(prevAvgDuration)),
          label: "shift length shift",
          sentiment: "neutral"
        }}
      />

      <StatCard
        label="Employee Coverage"
        value={totalAssigned}
        icon={Users}
        trend={{
          value: calculateTrend(totalAssigned, 0), 
          label: "assigned emps",
          sentiment: "positive"
        }}
      />

      <StatCard
        label="Avg. OT Threshold"
        value={`${avgOT} min`}
        icon={Zap}
        trend={{
          value: calculateTrend(avgOT, prevAvgOT),
          label: "policy change",
          sentiment: "neutral"
        }}
      />
    </div>
  )
}