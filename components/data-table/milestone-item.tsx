"use client"

import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"

interface MilestoneItemProps {
  label: string
  description: string
  date: string
  icon: LucideIcon
  iconColor: string
  iconBg: string
}

export function MilestoneItem({ label, description, date, icon: Icon, iconColor, iconBg }: MilestoneItemProps) {
  return (
    <div className="flex items-center gap-3 group">
      <div className={cn("shrink-0 p-2 rounded-xl transition-transform group-hover:scale-110", iconBg, iconColor)}>
        <Icon className="w-3.5 h-3.5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[12px] font-bold text-slate-700 truncate">{label}</p>
        <p className="text-[10px] text-slate-400 font-medium truncate">{description}</p>
      </div>
      <div className="text-right shrink-0">
        <span className="text-[10px] font-bold text-slate-500 bg-slate-50 px-2 py-0.5 rounded-full">
          {date}
        </span>
      </div>
    </div>
  )
}