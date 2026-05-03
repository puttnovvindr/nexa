"use client"

import { TabsTrigger } from "@/components/ui/tabs"
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface SettingTabCardProps {
  value: string
  label: string
  icon: LucideIcon
}

export function SettingTabCard({ value, label, icon: Icon }: SettingTabCardProps) {
  return (
    <TabsTrigger 
      value={value} 
      className={cn(
        "flex items-center gap-2.5 px-6 py-2.5 rounded-full border border-transparent bg-transparent",
        "transition-all text-slate-500 cursor-pointer outline-none",
        "data-[state=active]:bg-white  data-[state=active]:text-violet-600 data-[state=active]:font-semibold",
        "hover:text-slate-800 group"
      )}
    >
      <Icon className="w-4 h-4 transition-colors group-data-[state=active]:text-violet-600" />
      <span className="text-[13px] font-semibold font-poppins tracking-tight">
        {label}
      </span>
    </TabsTrigger>
  )
}