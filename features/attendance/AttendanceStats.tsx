"use client"

import { Users, Clock, UserX, Percent } from "lucide-react"
import { StatCard } from "@/components/data-table/stat-card"
import { AttendanceWithEmployee } from "@/types/attendance"
import { startOfDay, isSameDay, subDays } from "date-fns" 

interface AttendanceStatsProps {
  data: AttendanceWithEmployee[]
}

export function AttendanceStats({ data = [] }: AttendanceStatsProps) {
  const today = new Date()
  const yesterday = subDays(today, 1)

  const calculateTrend = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0
    return parseFloat(((current - previous) / previous * 100).toFixed(1))
  }

  const todayData = data.filter(a => isSameDay(new Date(a.date), today))
  const yesterdayData = data.filter(a => isSameDay(new Date(a.date), yesterday))
  const presentToday = todayData.filter(a => ["PRESENT", "LATE"].includes(a.status)).length
  const presentYesterday = yesterdayData.filter(a => ["PRESENT", "LATE"].includes(a.status)).length
  const presentTrend = calculateTrend(presentToday, presentYesterday)
  const lateToday = todayData.filter(a => a.status === "LATE").length
  const lateYesterday = yesterdayData.filter(a => a.status === "LATE").length
  const lateTrend = calculateTrend(lateToday, lateYesterday)
  const absentToday = todayData.filter(a => a.status === "ABSENT").length
  const absentYesterday = yesterdayData.filter(a => a.status === "ABSENT").length
  const absentTrend = calculateTrend(absentToday, absentYesterday)
  const onTimeTodayCount = todayData.filter(a => a.status === "PRESENT").length
  const onTimeRate = presentToday > 0 
    ? Math.round((onTimeTodayCount / presentToday) * 100) 
    : 0

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 shrink-0">
      <StatCard
        label="Total Present"
        value={presentToday}
        icon={Users}
        iconBgColor="bg-emerald-50"
        iconColor="text-emerald-600"
        infoText="Employees currently present or late today"
        trend={{ 
          value: presentTrend, 
          label: "vs yesterday",
          sentiment: "positive" 
        }}
      />

      <StatCard
        label="Late Check-ins"
        value={lateToday}
        icon={Clock}
        iconBgColor="bg-amber-50"
        iconColor="text-amber-600"
        infoText="Employees who arrived after the scheduled shift"
        trend={{ 
          value: lateTrend, 
          label: "vs yesterday",
          sentiment: "negative"
        }}
      />

      <StatCard
        label="Absent"
        value={absentToday}
        icon={UserX}
        iconBgColor="bg-red-50"
        iconColor="text-red-600"
        infoText="Employees marked as absent today"
        trend={{ 
          value: absentTrend, 
          label: "vs yesterday",
          sentiment: "negative"
        }}
      />

      <StatCard
        label="On-Time Rate"
        value={`${onTimeRate}%`}
        icon={Percent}
        iconBgColor="bg-blue-50"
        iconColor="text-blue-600"
        infoText="Percentage of present employees who were on time"
        trend={{ 
          value: 0, 
          label: "daily rate",
          sentiment: "neutral"
        }}
      />
    </div>
  )
}