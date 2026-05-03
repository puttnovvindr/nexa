"use client"

import { useMemo } from "react"
import { AnalyticsCard } from "@/components/data-table/analytics-card"
import { OrgUnitWithParent } from "@/types/settings"

type OrgWithAnalytics = OrgUnitWithParent & { _count?: { employees: number } }

interface OrgUnitInsightsProps {
  data: OrgWithAnalytics[]
}

export function OrgUnitInsights({ data = [] }: OrgUnitInsightsProps) {
  const insights = useMemo(() => {
    return [...data]
      .filter(u => (u._count?.employees || 0) > 0)
      .sort((a, b) => (b._count?.employees || 0) - (a._count?.employees || 0))
      .slice(0, 4)
  }, [data])

  return (
    <AnalyticsCard title="Top Units" subtitle="By Headcount">
      <div className="flex flex-col gap-3 pt-1">
        {insights.length === 0 ? (
          <p className="text-[11px] text-slate-400 text-center py-4">No data available</p>
        ) : (
          insights.map((unit, index) => {
            const count = unit._count?.employees || 0
            const max = insights[0]._count?.employees || 1
            const pct = Math.round((count / max) * 100)

            return (
              <div key={unit.id} className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-600 truncate max-w-[160px]">
                    {unit.name}
                  </span>
                  <span className="text-[11px] font-bold text-slate-500">{count}</span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: index === 0 ? "#7C3AED" : index === 1 ? "#10B981" : index === 2 ? "#F59E0B" : "#3B82F6"
                    }}
                  />
                </div>
              </div>
            )
          })
        )}
      </div>
    </AnalyticsCard>
  )
}