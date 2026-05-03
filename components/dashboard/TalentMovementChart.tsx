"use client"

import React, { useMemo } from "react"
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Cell, LabelList
} from "recharts"
import { Card } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Users } from "lucide-react"
import { EmployeeWithRelations } from "@/types/dashboard"

interface TalentMovementChartProps {
  data: EmployeeWithRelations[]
}

interface CustomTickProps {
  x: number | string
  y: number | string
  payload: {
    value: string
  }
}

interface ChartPayload {
  value: number
  dataKey: string
}

const CustomTooltip = ({
  active, payload
}: {
  active?: boolean
  payload?: ChartPayload[]
}) => {
  if (!active || !payload?.length) return null
  const item = payload[0]
  return (
    <div className="bg-white border border-slate-100 rounded-xl px-3 py-2 shadow-lg text-[11px] font-poppins">
      <p className="font-bold text-slate-700">{item.value} people</p>
    </div>
  )
}

export function TalentMovementChart({ data }: TalentMovementChartProps) {
  const { newJoiners, offboarding, netGrowth } = useMemo(() => {
    const now = new Date()

    const newJoinersCount = data.filter((e) => {
      if (!e.joinDate) return false
      const diffDays =
        (now.getTime() - new Date(e.joinDate).getTime()) / (1000 * 60 * 60 * 24)
      return diffDays >= 0 && diffDays <= 30
    }).length

    const offboardingCount = data.filter((e) => {
      if (!e.contractEndDate && !e.resignDate) return false
      const endDate = e.resignDate
        ? new Date(e.resignDate)
        : new Date(e.contractEndDate!)
      const diffDays =
        (endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      return diffDays >= 0 && diffDays <= 7
    }).length

    return { 
        newJoiners: newJoinersCount, 
        offboarding: offboardingCount, 
        netGrowth: newJoinersCount - offboardingCount 
    }
  }, [data])

  const chartData = [
    {
      label: "HIRING",
      sublabel: "Last 30 days",
      count: newJoiners,
      fill: "#7C3AED",
      bg: "#F5F3FF",
    },
    {
      label: "OFFBOARDING",
      sublabel: "Next 7 days",
      count: offboarding,
      fill: "#C4B5FD", 
      bg: "#F5F3FF",
    },
  ]

  const maxVal = Math.max(newJoiners, offboarding, 1)

  return (
    <Card className="p-6 rounded-2xl border border-gray-200 bg-white shadow-none h-[280px] font-poppins flex flex-col">
      <div className="flex justify-between items-start shrink-0">
        <div>
          <h4 className="text-[14px] font-semibold text-slate-800">Talent Movement</h4>
          <p className="text-[11px] text-slate-400 font-medium">Hiring vs Offboarding</p>
        </div>
        <div className="p-2 bg-violet-50 rounded-xl">
          <Users className="w-4 h-4 text-violet-600" />
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 4, right: 56, left: 0, bottom: 4 }}
            barCategoryGap="30%"
          >
            <XAxis type="number" hide domain={[0, maxVal * 1.3]} />
            <YAxis
              type="category"
              dataKey="label"
              axisLine={false}
              tickLine={false}
              width={92}
              tick={(props: CustomTickProps) => {
                const { x, y, payload } = props
                const item = chartData.find((d) => d.label === payload.value)
                return (
                  <g transform={`translate(${x},${y})`}>
                    <text
                      x={0}
                      y={-4}
                      textAnchor="end"
                      fill="#1e293b"
                      fontSize={10}
                      fontWeight={700}
                      fontFamily="Poppins, sans-serif"
                      letterSpacing="0.08em"
                    >
                      {payload.value}
                    </text>
                    <text
                      x={0}
                      y={10}
                      textAnchor="end"
                      fill="#94a3b8"
                      fontSize={9}
                      fontWeight={500}
                      fontFamily="Poppins, sans-serif"
                    >
                      {item?.sublabel}
                    </text>
                  </g>
                )
              }}
            />
            <Tooltip
              cursor={{ fill: "transparent" }}
              content={<CustomTooltip />}
            />
            <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={22}>
              {chartData.map((entry) => (
                <Cell key={entry.label} fill={entry.fill} />
              ))}
              <LabelList
                dataKey="count"
                position="right"
                style={{
                  fontSize: "14px",
                  fontWeight: 800,
                  fontFamily: "Poppins, sans-serif",
                  fill: "#1e293b",
                }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="shrink-0 pt-4 mt-auto border-t border-slate-50 flex items-center justify-between">
        <div className="flex flex-col gap-0.5">
          <span className="text-[9px] font-semibold uppercase  text-slate-400">
            Net Growth
          </span>
          <span className="text-[20px] font-black leading-none text-violet-600">
            {netGrowth >= 0 ? "+" : ""}
            {netGrowth}
          </span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold bg-violet-50 text-violet-700 border border-violet-100">
          {netGrowth >= 0 ? (
            <TrendingUp className="w-3.5 h-3.5" />
          ) : (
            <TrendingDown className="w-3.5 h-3.5" />
          )}
          {netGrowth >= 0 ? "Headcount growing" : "Headcount shrinking"}
        </div>
      </div>
    </Card>
  )
}