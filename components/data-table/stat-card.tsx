"use client"

import React from "react"
import { LucideIcon, HelpCircle, ArrowUpRight, ArrowDownRight } from "lucide-react"
import { Card } from "@/components/ui/card"
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

export type TrendSentiment = "positive" | "negative" | "neutral"

interface StatCardProps {
  label: string
  value: string | number
  icon: LucideIcon
  infoText?: string
  trend?: {
    value: number
    label: string
    sentiment?: TrendSentiment 
  }
  className?: string
  iconBgColor?: string
  iconColor?: string
}

export function StatCard({ 
  label, 
  value, 
  icon: Icon, 
  infoText, 
  trend,
  className,
  iconBgColor = "bg-violet-50",
  iconColor = "text-purple-800"
}: StatCardProps) {
  
  const getTrendStyles = () => {
    if (!trend) return null
    
    const isUp = trend.value >= 0
    const sentiment = trend.sentiment || "positive"

    if (sentiment === "neutral") {
      return {
        colorClass: "bg-blue-50 text-blue-600",
        Icon: isUp ? ArrowUpRight : ArrowDownRight
      }
    }

    if (sentiment === "positive") {
      return {
        colorClass: isUp ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600",
        Icon: isUp ? ArrowUpRight : ArrowDownRight
      }
    }

    return {
      colorClass: isUp ? "bg-rose-50 text-rose-600" : "bg-emerald-50 text-emerald-600",
      Icon: isUp ? ArrowUpRight : ArrowDownRight
    }
  }

  const trendStyles = getTrendStyles()

  return (
    <Card className={cn(
      "p-4 rounded-2xl border border-gray-200 bg-white shadow-none hover:shadow-md hover:border-violet-200 transition-all group flex flex-col gap-2",
      className
    )}>
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className={cn("p-2 rounded-lg transition-colors", iconBgColor, iconColor)}>
            <Icon className="w-4 h-4" />
          </div>
          <p className="text-[12px] font-medium font-poppins text-slate-500">
            {label}
          </p>
        </div>
        
        {infoText && (
          <TooltipProvider delayDuration={100}>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="w-3.5 h-3.5 text-slate-300 cursor-help hover:text-slate-500 transition-colors" />
              </TooltipTrigger>
              <TooltipContent 
                side="top"
                className="bg-slate-100 text-slate-600 border border-slate-200 shadow-sm px-2 py-1 text-[10px] lowercase first-letter:uppercase font-normal font-poppins"
              >
                <p>{infoText}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>

      <div className="mt-2 flex flex-col gap-1">
        <h2 className="text-2xl font-black text-slate-800 leading-none">
          {value}
        </h2>
        
        {trend && trendStyles && (
          <div className="flex items-center gap-1.5 mt-0.5">
            <div className={cn(
              "flex items-center font-bold text-[10px] px-1.5 py-0.5 rounded-md",
              trendStyles.colorClass
            )}>
              <trendStyles.Icon className="w-3 h-3 mr-0.5" />
              {Math.abs(trend.value)}%
            </div>
            <span className="text-[10px] text-slate-400 font-medium">
              {trend.label}
            </span>
          </div>
        )}
      </div>
    </Card>
  )
}