"use client"

import { useMemo, useState, useEffect } from "react"
import { AnalyticsCard } from "@/components/data-table/analytics-card"

interface Props {
  data: {
    employee?: { fullName?: string }
    status: string
  }[]
}

export function AttendanceInsights({ data = [] }: Props) {
  const [view, setView] = useState<"late" | "ontime">("late")
  const [isFading, setIsFading] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setIsFading(true)
      setTimeout(() => {
        setView((prev) => (prev === "late" ? "ontime" : "late"))
        setIsFading(false)
      }, 500)
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  const lateInsights = useMemo(() => {
    const map: Record<string, number> = {}

    data.forEach((d) => {
      if (d.status === "LATE") {
        const name = d.employee?.fullName || "Unknown"
        map[name] = (map[name] || 0) + 1
      }
    })

    return Object.entries(map)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
  }, [data])

  const onTimeInsights = useMemo(() => {
    const map: Record<string, number> = {}

    data.forEach((d) => {
      if (d.status === "PRESENT") {
        const name = d.employee?.fullName || "Unknown"
        map[name] = (map[name] || 0) + 1
      }
    })

    return Object.entries(map)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
  }, [data])

  const activeData = view === "late" ? lateInsights : onTimeInsights
  const title = view === "late" ? "Top Late Employees" : "Top On-Time Employees"
  const subtitle = view === "late" ? "Most frequent late" : "Most consistent on time"

  return (
    <AnalyticsCard title={title} subtitle={subtitle} className="h-[240px] flex flex-col">
      <div className={`flex flex-col gap-3 pt-1 transition-opacity duration-500 ${isFading ? "opacity-0" : "opacity-100"}`}>
        {activeData.length === 0 ? (
          <p className="text-[11px] text-slate-400 text-center py-4">No data available</p>
        ) : (
          activeData.map((item, index) => {
            const max = activeData[0].count || 1
            const pct = Math.round((item.count / max) * 100)

            return (
              <div key={index} className="flex flex-col gap-1">
                <div className="flex justify-between">
                  <span className="text-[11px] font-semibold text-slate-600 truncate">
                    {item.name}
                  </span>
                  <span className="text-[11px] font-bold text-slate-500">
                    {item.count}
                  </span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: view === "late"
                        ? index === 0 ? "#EF4444" : "#F59E0B"
                        : index === 0 ? "#10B981" : "#3B82F6",
                    }}
                  />
                </div>
              </div>
            )
          })
        )}
      </div>

      <div className="pt-2 flex justify-center gap-1.5 mt-auto">
        <div 
          className={`h-1 rounded-full transition-all duration-500 ${
            view === "late" ? "w-4 bg-[#7C3AED]" : "w-1.5 bg-slate-200"
          }`} 
        />
        <div 
          className={`h-1 rounded-full transition-all duration-500 ${
            view === "ontime" ? "w-4 bg-[#7C3AED]" : "w-1.5 bg-slate-200"
          }`} 
        />
      </div>
    </AnalyticsCard>
  )
}