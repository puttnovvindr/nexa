"use client"

import { Briefcase, Users, CheckCircle2, XCircle } from "lucide-react"
import { StatCard } from "@/components/data-table/stat-card"
import { JobWithDetails } from "@/types/employee"

interface JobTitleStatsProps {
  data: JobWithDetails[]
}

export function JobTitleStats({ data = [] }: JobTitleStatsProps) {
  const now = new Date()
  const firstDayCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const calculateTrend = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0
    return parseFloat(((current - previous) / previous * 100).toFixed(1))
  }

  const getSentiment = (value: number, type: "positive" | "negative" = "positive") => {
    if (value === 0) return "neutral"
    if (type === "positive") return value > 0 ? "positive" : "negative"
    return value > 0 ? "negative" : "positive" 
  }

  const totalTitles = data.length
  const prevTotalTitles = data.filter(j => 
    j.createdAt ? new Date(j.createdAt) < firstDayCurrentMonth : false
  ).length
  const titlesTrend = calculateTrend(totalTitles, prevTotalTitles)
  const totalHeadcount = data.reduce((acc, curr) => acc + (curr._count?.employees || 0), 0)

  const prevTotalHeadcount = data.reduce((acc, curr) => {
    return acc + (new Date(curr.createdAt) < firstDayCurrentMonth ? (curr._count?.employees || 0) : 0)
  }, 0)
  const headcountTrend = calculateTrend(totalHeadcount, prevTotalHeadcount)

  const occupiedTitles = data.filter(j => (j._count?.employees || 0) > 0).length
  const prevOccupiedTitles = data.filter(j => 
    (j._count?.employees || 0) > 0 && 
    (j.createdAt ? new Date(j.createdAt) < firstDayCurrentMonth : false)
  ).length
  const occupiedTrend = calculateTrend(occupiedTitles, prevOccupiedTitles)

  const vacantTitles = data.filter(j => (j._count?.employees || 0) === 0).length
  const prevVacantTitles = data.filter(j => 
    (j._count?.employees || 0) === 0 && 
    (j.createdAt ? new Date(j.createdAt) < firstDayCurrentMonth : false)
  ).length
  const vacantTrend = calculateTrend(vacantTitles, prevVacantTitles)

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 shrink-0">
      <StatCard
        label="Total Job Titles"
        value={totalTitles}
        icon={Briefcase}
        iconBgColor="bg-blue-50"
        iconColor="text-blue-600"
        infoText="Unique job titles registered"
        trend={{
          value: titlesTrend,
          label: "vs last month",
          sentiment: getSentiment(titlesTrend)
        }}
      />

      <StatCard
        label="Total Headcount"
        value={totalHeadcount}
        icon={Users}
        iconBgColor="bg-violet-50"
        iconColor="text-violet-600"
        infoText="Total active employees assigned"
        trend={{
          value: headcountTrend,
          label: "new hires growth",
          sentiment: getSentiment(headcountTrend)
        }}
      />

      <StatCard
        label="Occupied Positions"
        value={occupiedTitles}
        icon={CheckCircle2}
        iconBgColor="bg-emerald-50"
        iconColor="text-emerald-600"
        infoText="Titles with at least 1 employee"
        trend={{
          value: occupiedTrend,
          label: "fill rate",
          sentiment: getSentiment(occupiedTrend)
        }}
      />

      <StatCard
        label="Vacant Positions"
        value={vacantTitles}
        icon={XCircle}
        iconBgColor="bg-rose-50"
        iconColor="text-rose-600"
        infoText="Registered titles with no employees"
        trend={{
          value: vacantTrend,
          label: "unfilled roles",
          sentiment: getSentiment(vacantTrend, "negative") 
        }}
      />
    </div>
  )
}