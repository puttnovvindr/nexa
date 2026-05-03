"use client"

import { Layers, Building2, GitBranch } from "lucide-react"
import { StatCard } from "@/components/data-table/stat-card"
import { OrgUnitWithParent } from "@/types/settings"

type OrgWithAnalytics = OrgUnitWithParent & { 
  _count?: { employees: number };
  createdAt: Date | string;
}

interface OrgUnitStatsProps {
  data: OrgWithAnalytics[]
}

export function OrgUnitStats({ data = [] }: OrgUnitStatsProps) {
  const now = new Date()
  const firstDayCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const calculateTrend = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0
    return parseFloat(((current - previous) / previous * 100).toFixed(1))
  }

  const totalUnits = data.length
  const prevTotalUnits = data.filter(u => new Date(u.createdAt) < firstDayCurrentMonth).length
  const unitsTrend = calculateTrend(totalUnits, prevTotalUnits)
  const departments = data.filter(u => u.parentId && !u.parent?.parentId)
  const totalDepartments = departments.length
  const prevDepartments = departments.filter(u => new Date(u.createdAt) < firstDayCurrentMonth).length
  const departmentsTrend = calculateTrend(totalDepartments, prevDepartments)
  const divisions = data.filter(u => u.parent?.parentId)
  const totalDivisions = divisions.length
  const prevDivisions = divisions.filter(u => new Date(u.createdAt) < firstDayCurrentMonth).length
  const divisionsTrend = calculateTrend(totalDivisions, prevDivisions)

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 shrink-0">
      <StatCard
        label="Total Units"
        value={totalUnits}
        icon={Layers}
        iconBgColor="bg-purple-50"
        iconColor="text-purple-600"
        infoText="Total organizational units registered"
        trend={{
          value: unitsTrend,
          label: "from last month",
          sentiment: "neutral"
        }}
      />
      
      <StatCard
        label="Departments"
        value={totalDepartments}
        icon={Building2}
        iconBgColor="bg-orange-50"
        iconColor="text-orange-600"
        infoText="Units directly under Company"
        trend={{
          value: departmentsTrend,
          label: "growth rate",
          sentiment: "neutral"
        }}
      />

      <StatCard
        label="Divisions"
        value={totalDivisions}
        icon={GitBranch}
        iconBgColor="bg-blue-50"
        iconColor="text-blue-600"
        infoText="Units under departments"
        trend={{
          value: divisionsTrend,
          label: "growth rate",
          sentiment: "neutral"
        }}
      />
    </div>
  )
}