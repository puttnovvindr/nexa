"use client"

import { useState, useEffect } from "react"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import { AnalyticsCard } from "@/components/data-table/analytics-card"
import { TableContainer } from "@/components/data-table/table-container"
import { EmployeeWithRelations } from "@/types/employee"
import { JobLevel, EmploymentType } from "@prisma/client"

interface DistributionProps {
  data: EmployeeWithRelations[]
  jobLevels: JobLevel[]
  employmentTypes: EmploymentType[]
}

const COLORS = ["#7C3AED", "#10B981", "#F59E0B", "#3B82F6", "#EC4899", "#6366F1"]

export function EmployeeDistribution({ data, jobLevels, employmentTypes }: DistributionProps) {
  const [view, setView] = useState<"level" | "status">("level")
  const [isFading, setIsFading] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setIsFading(true)
      setTimeout(() => {
        setView((prev) => (prev === "level" ? "status" : "level"))
        setIsFading(false)
      }, 500) 
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  const levelData = jobLevels.map((level, index) => ({
    name: level.levelName,
    value: data.filter(e => e.jobLevelId === level.id).length,
    color: COLORS[index % COLORS.length]
  })).filter(item => item.value > 0)

  const statusData = employmentTypes.map((type, index) => ({
    name: type.name,
    value: data.filter(e => e.employmentTypeId === type.id).length,
    color: COLORS[index % COLORS.length]
  })).filter(item => item.value > 0)

  const activeData = view === "level" ? levelData : statusData
  const activeTitle = view === "level" ? "Job Level Distribution" : "Employment Status"

  return (
    <AnalyticsCard 
      title="Staff Composition" 
      subtitle={activeTitle}
      className="h-[240px] relative flex flex-col"
    >
      <div className="flex-1 min-h-0">
        <TableContainer className="h-full border-none shadow-none bg-transparent p-0">
          <div className={`h-full w-full flex items-center transition-opacity duration-500 ${isFading ? "opacity-0" : "opacity-100"}`}>
            <ResponsiveContainer width="100%" height={140}>
              <PieChart>
                <Pie
                  data={activeData}
                  innerRadius={45}
                  outerRadius={65}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {activeData.map((entry, index) => (
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
              {activeData.map((item) => (
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

      <div className="pb-3  flex justify-center gap-1.5 shrink-0">
        <div 
          className={`h-1 rounded-full transition-all duration-500 ${
            view === "level" ? "w-4 bg-[#7C3AED]" : "w-1.5 bg-slate-200"
          }`} 
        />
        <div 
          className={`h-1 rounded-full transition-all duration-500 ${
            view === "status" ? "w-4 bg-[#7C3AED]" : "w-1.5 bg-slate-200"
          }`} 
        />
      </div>
    </AnalyticsCard>
  )
}