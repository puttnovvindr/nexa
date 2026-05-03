"use client"

import { Layers, ClipboardCheck } from "lucide-react"
import { StatCard } from "@/components/data-table/stat-card"

type EmploymentTypeWithCount = {
  id: string
  name: string
  createdAt?: Date | string
  _count?: {
    employees: number 
  }
}

interface Props {
  data: EmploymentTypeWithCount[]
}

export function EmploymentTypeStats({ data = [] }: Props) {
  const now = new Date()
  const firstDayCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const calculateTrend = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0
    return parseFloat(((current - previous) / previous * 100).toFixed(1))
  }

  const getSentiment = (value: number) => {
    if (value === 0) return "neutral"
    return value > 0 ? "positive" : "negative"
  }

  const totalTypes = data.length
  const prevTypes = data.filter(d => d.createdAt && new Date(d.createdAt) < firstDayCurrentMonth).length
  const typeTrend = calculateTrend(totalTypes, prevTypes)
  const totalAssigned = data.reduce((acc, curr) => acc + (curr._count?.employees || 0), 0)
  const prevAssigned = data.reduce((acc, curr) => {
     return acc + (curr.createdAt && new Date(curr.createdAt) < firstDayCurrentMonth ? (curr._count?.employees || 0) : 0)
  }, 0)
  const assignmentTrend = calculateTrend(totalAssigned, prevAssigned)

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2 shrink-0">
      <StatCard
        label="Total Employment Types"
        value={totalTypes}
        icon={Layers}
        iconBgColor="bg-purple-50"
        iconColor="text-purple-600"
        infoText="Jumlah variasi status kepegawaian yang terdaftar"
        trend={{
          value: typeTrend,
          label: "vs last month",
          sentiment: "neutral"
        }}
      />

      <StatCard
        label="Employee Assignment"
        value={totalAssigned}
        icon={ClipboardCheck}
        iconBgColor="bg-emerald-50"
        iconColor="text-emerald-600"
        infoText="Jumlah karyawan yang sudah memiliki status kontrak"
        trend={{
          value: assignmentTrend,
          label: "growth rate",
          sentiment: getSentiment(assignmentTrend)
        }}
      />
    </div>
  )
}