"use client"

import { useMemo } from "react"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import { AnalyticsCard } from "@/components/data-table/analytics-card"
import { TableContainer } from "@/components/data-table/table-container"

interface Props {
  data: {
    status: string
  }[]
}

const COLORS = ["#10B981", "#F59E0B", "#EF4444", "#6366F1", "#7C3AED", "#3B82F6"]

export function AttendanceDistribution({ data = [] }: Props) {
  const chartData = useMemo(() => {
    const map: Record<string, number> = {}

    data.forEach((d) => {
      map[d.status] = (map[d.status] || 0) + 1
    })

    return Object.entries(map)
      .map(([name, value], index) => ({
        name,
        value,
        color: COLORS[index % COLORS.length],
      }))
      .filter(item => item.value > 0)
  }, [data])

  return (
    <AnalyticsCard 
      title="Attendance Composition" 
      subtitle="By Status"
      className="h-[240px] relative flex flex-col"
    >
      <div className="flex-1 min-h-0">
        <TableContainer className="h-full border-none shadow-none bg-transparent p-0">
          <div className="h-full w-full flex items-center">
            <ResponsiveContainer width="100%" height={140}>
              <PieChart>
                <Pie
                  data={chartData}
                  innerRadius={45}
                  outerRadius={65}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {chartData.map((entry, index) => (
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

            <div className="flex flex-col gap-1.5 pr-6 shrink-0 min-w-[120px]">
              {chartData.map((item) => (
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
    </AnalyticsCard>
  )
}