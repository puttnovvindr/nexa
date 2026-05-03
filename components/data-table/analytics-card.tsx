"use client"

import React from "react"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface AnalyticsCardProps {
  title: string
  subtitle?: string
  children: React.ReactNode
  className?: string
  rightAction?: React.ReactNode 
}

export function AnalyticsCard({ title, subtitle, children, className, rightAction }: AnalyticsCardProps) {
  return (
    <Card className={cn("p-5 rounded-2xl border border-gray-200 bg-white shadow-none flex flex-col gap-4", className)}>
      <div className="flex justify-between items-start">
        <div className="flex flex-col gap-0.5">
          <h3 className="text-[14px] font-bold text-slate-800 tracking-tight">{title}</h3>
          {subtitle && <p className="text-[11px] text-slate-400 font-medium lowercase first-letter:uppercase">{subtitle}</p>}
        </div>
        {rightAction}
      </div>
      <div className="flex-1">
        {children}
      </div>
    </Card>
  )
}