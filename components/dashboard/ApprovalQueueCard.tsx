"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import { Card } from "@/components/ui/card"
import { ArrowUpRight, LayoutList } from "lucide-react"

const COLORS = ["#7C3AED", "#10B981", "#F59E0B", "#F43F5E"]

export function ApprovalQueueCard() {
  const typeData = [
    { name: "Leave", value: 8, color: COLORS[0] },
    { name: "Overtime", value: 3, color: COLORS[1] },
    { name: "Documents", value: 12, color: COLORS[3] },
  ]

  const total = typeData.reduce((acc, curr) => acc + curr.value, 0)

  return (
    <Card className="h-[280px] p-6 rounded-2xl border border-gray-200 bg-white shadow-none font-poppins flex flex-col relative overflow-hidden">
      <div className="flex justify-between items-start shrink-0">
        <div>
          <h4 className="text-[14px] font-semibold text-slate-800">Approval Queue</h4>
          <p className="text-[11px] text-slate-400 font-medium">Request Categories</p>
        </div>
        <div className="p-2 bg-violet-50 rounded-xl">
          <LayoutList className="w-4 h-4 text-violet-600" />
        </div>
      </div>

      <div className="flex-1 flex items-center">
        <div className="relative flex-1">
          <ResponsiveContainer width="100%" height={150}>
            <PieChart>
              <Pie
                data={typeData}
                innerRadius={45}
                outerRadius={65}
                paddingAngle={6}
                dataKey="value"
                stroke="none"
              >
                {typeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  borderRadius: "12px", 
                  border: "none", 
                  boxShadow: "0 8px 16px rgba(0,0,0,0.1)", 
                  fontSize: "10px",
                  fontWeight: "bold"
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-[18px] font-black text-slate-800">{total}</span>
            <span className="text-[8px] font-bold text-slate-400 uppercase">Tasks</span>
          </div>
        </div>

        <div className="flex flex-col gap-2.5 pr-2 shrink-0 min-w-[110px]">
          {typeData.map((item) => (
            <div key={item.name} className="flex items-center gap-2">
              <div 
                className="w-1.5 h-1.5 rounded-full shrink-0" 
                style={{ backgroundColor: item.color }} 
              />
              <span className="text-[10px] font-bold text-slate-600 truncate max-w-[70px] uppercase tracking-tight">
                {item.name}
              </span>
              <span className="text-[10px] text-slate-400 ml-auto font-mono font-bold">
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}