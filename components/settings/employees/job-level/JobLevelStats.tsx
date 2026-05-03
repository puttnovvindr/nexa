"use client"

import { Layers, Users } from "lucide-react"
import { StatCard } from "@/components/data-table/stat-card"

type JobLevelWithCount = {
  id: string
  levelName: string
  createdAt?: Date | string
  _count?: {
    employees: number 
  }
}

interface Props {
  data: JobLevelWithCount[]
}

export function JobLevelStats({ data = [] }: Props) {
  const now = new Date()
  const firstDayCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const calculateTrend = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0
    return parseFloat(((current - previous) / previous * 100).toFixed(1))
  }

  const totalLevels = data.length
  const prevLevels = data.filter(d => d.createdAt && new Date(d.createdAt) < firstDayCurrentMonth).length
  const levelTrend = calculateTrend(totalLevels, prevLevels)

  const totalAssignedEmployees = data.reduce((acc, curr) => acc + (curr._count?.employees || 0), 0)
  const prevAssigned = data.reduce((acc, curr) => {
     return acc + (curr.createdAt && new Date(curr.createdAt) < firstDayCurrentMonth ? (curr._count?.employees || 0) : 0)
  }, 0)
  const assignmentTrend = calculateTrend(totalAssignedEmployees, prevAssigned)

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2 shrink-0">
      <StatCard
        label="Total Job Levels"
        value={totalLevels}
        icon={Layers}
        iconBgColor="bg-purple-50"
        iconColor="text-purple-600"
        infoText="Total variasi jenjang karir (Grade) yang terdaftar"
        trend={{
          value: levelTrend,
          label: "from last month",
          sentiment: "neutral"
        }}
      />

      <StatCard
        label="Total Employee Assignment"
        value={totalAssignedEmployees}
        icon={Users}
        iconBgColor="bg-blue-50"
        iconColor="text-blue-600"
        infoText="Jumlah karyawan yang sudah diberikan level jabatan"
        trend={{
          value: assignmentTrend,
          label: "assignment growth",
          sentiment: "positive"
        }}
      />
    </div>
  )
}