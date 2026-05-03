"use client"

import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts"
import { Card } from "@/components/ui/card"
import { TrendingUp, DollarSign } from "lucide-react"

const payrollTrendData = [
  { month: "Jan", expense: 4200 },
  { month: "Feb", expense: 4500 },
  { month: "Mar", expense: 4300 },
  { month: "Apr", expense: 4800 },
  { month: "May", expense: 5100 },
  { month: "Jun", expense: 4900 },
]

export function PayrollTrendChart() {
  return (
    <Card className="p-6 rounded-2xl border border-gray-200 bg-white shadow-none h-[280px] font-poppins flex flex-col">
      <div className="flex justify-between items-start shrink-0">
        <div>
          <h4 className="text-[14px] font-semibold text-slate-800">Payroll Pulse</h4>
          <p className="text-[11px] text-slate-400 font-medium">Monthly Disbursement Trend</p>
        </div>
        <div className="p-2 bg-violet-50 rounded-xl">
          <DollarSign className="w-4 h-4 text-violet-600" />
        </div>
      </div>

      <div className="flex-1 min-h-0 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={payrollTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="payrollGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.2}/> 
                <stop offset="95%" stopColor="#7C3AED" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis 
              dataKey="month" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fontWeight: 600, fill: '#94a3b8' }}
            />
            <YAxis hide />
            <Tooltip 
              contentStyle={{ 
                borderRadius: "12px", 
                border: "none", 
                boxShadow: "0 8px 16px rgba(0,0,0,0.1)", 
                fontSize: "11px"
              }}
            />
            <Area 
              type="monotone" 
              dataKey="expense" 
              stroke="#7C3AED" 
              strokeWidth={3} 
              fillOpacity={1} 
              fill="url(#payrollGradient)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-[18px] font-black text-slate-800 leading-none">$24,800</span>
          <span className="text-[9px] font-semibold text-slate-400 uppercase">Avg. Monthly Cost</span>
        </div>
        <div className="flex items-center gap-1 text-violet-600">
          <TrendingUp className="w-3.5 h-3.5" />
          <span className="text-[11px] font-bold">+4.2%</span>
        </div>
      </div>
    </Card>
  )
}