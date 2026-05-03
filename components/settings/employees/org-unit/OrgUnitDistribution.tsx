"use client"

import { useMemo } from "react"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import { AnalyticsCard } from "@/components/data-table/analytics-card"
import { TableContainer } from "@/components/data-table/table-container"
import { OrgUnitWithParent } from "@/types/settings"

type OrgUnitWithCount = OrgUnitWithParent & {
  _count?: { employees: number }
}

interface DistributionProps {
  data: OrgUnitWithCount[]
}

const COLORS = ["#7C3AED", "#10B981", "#F59E0B", "#3B82F6"]

export function OrgUnitDistribution({ data = [] }: DistributionProps) {
  const hierarchyData = useMemo(() => {
    const head = data.filter(u => !u.parentId || u.parentId === "root").length
    const division = data.filter(u => u.parentId && u.parentId !== "root" && !u.parent?.parentId).length
    const dept = data.filter(u => u.parent?.parentId && u.parent?.parentId !== "root").length

    return [
      { name: "Head Office", value: head, color: COLORS[0] },
      { name: "Divisions", value: division, color: COLORS[1] },
      { name: "Departments", value: dept, color: COLORS[2] },
    ].filter(item => item.value > 0)
  }, [data])

  return (
    <AnalyticsCard 
      title="Org. Composition" 
      subtitle="Unit Hierarchy"
      className="h-[240px] relative flex flex-col"
    >
      <div className="flex-1 min-h-0">
        <TableContainer className="h-full border-none shadow-none bg-transparent p-0">
          <div className="h-full w-full flex items-center">
            <ResponsiveContainer width="100%" height={140}>
              <PieChart>
                <Pie
                  data={hierarchyData}
                  innerRadius={45}
                  outerRadius={65}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {hierarchyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: "12px", 
                    border: "none", 
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)", 
                    fontSize: "10px" 
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            
            <div className="flex flex-col gap-2 pr-6 shrink-0 min-w-[120px]">
              {hierarchyData.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div 
                    className="w-1.5 h-1.5 rounded-full shrink-0" 
                    style={{ backgroundColor: item.color }} 
                  />
                  <span className="text-[10px] font-bold text-slate-600 truncate max-w-[80px] uppercase tracking-tight">
                    {item.name}
                  </span>
                  <span className="text-[10px] text-slate-400 ml-auto font-bold">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </TableContainer>
      </div>
      <div className="pb-4" />
    </AnalyticsCard>
  )
}