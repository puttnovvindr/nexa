"use client"

import React, { useMemo } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { 
  Table, TableBody, TableRow
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, CalendarClock, UserPlus, ShieldAlert, LayoutList, LucideIcon } from "lucide-react"
import { EmployeeWithRelations } from "@/types/dashboard"
import { cn } from "@/lib/utils"

type Priority = "URGENT" | "HIGH" | "MEDIUM" | "LOW"

interface TaskItem {
  id: string
  title: string
  desc: string
  priority: Priority
  icon: LucideIcon
  link: string
  color: string
  bgColor: string
}

export function DashboardTaskTable({ data }: { data: EmployeeWithRelations[] }) {
  const router = useRouter()

  const dynamicTasks = useMemo((): TaskItem[] => {
    const today = new Date()
    const todayString = today.toISOString().split('T')[0]

    const expiring = data.filter(e => {
      if (!e.contractEndDate) return false
      const diff = (new Date(e.contractEndDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      return diff > 0 && diff <= 30
    }).length

    const todayOnboarding = data.filter(e => {
      if(!e.joinDate) return false
      return new Date(e.joinDate).toISOString().split('T')[0] === todayString
    }).length

    const missingDocs = data.filter(e => !e.identityNumber || e.identityNumber === "-").length

    const probationEnds = data.filter(e => {
      if (!e.joinDate) return false
      const join = new Date(e.joinDate)
      const probEnd = new Date(join.setMonth(join.getMonth() + 3))
      const diff = (probEnd.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      return diff > 0 && diff <= 14 
    }).length

    return [
      {
        id: 'onboarding',
        title: "Onboarding",
        desc: `${todayOnboarding} staff joining today`,
        priority: todayOnboarding > 0 ? "HIGH" : "LOW",
        icon: UserPlus,
        link: "/employees",
        color: "text-blue-600",
        bgColor: "bg-blue-50/50"
      },
      {
        id: 'probation',
        title: "Probation",
        desc: `${probationEnds} reviews due soon`,
        priority: probationEnds > 0 ? "HIGH" : "LOW",
        icon: ShieldAlert,
        link: "/employees",
        color: "text-violet-600",
        bgColor: "bg-violet-50/50"
      },
      {
        id: 'contract',
        title: "Contracts",
        desc: `${expiring} expiring soon`,
        priority: expiring > 0 ? "MEDIUM" : "LOW",
        icon: CalendarClock,
        link: "/employees",
        color: "text-amber-600",
        bgColor: "bg-amber-50/50"
      },
      {
        id: 'docs',
        title: "Missing Docs",
        desc: `${missingDocs} incomplete profiles`,
        priority: "URGENT",
        icon: AlertCircle,
        link: "/employees",
        color: "text-rose-600",
        bgColor: "bg-rose-50/50"
      }
    ]
  }, [data])

  return (
    <Card className="p-6 gap-4 rounded-2xl border border-gray-200 bg-white shadow-none h-[280px] font-poppins flex flex-col">
      <div className="flex justify-between items-start shrink-0">
        <div>
          <h4 className="text-[14px] font-semibold text-slate-800">Action Center</h4>
          <p className="text-[11px] text-slate-400 font-medium">Priority Tasks Monitoring</p>
        </div>
        <div className="p-2 bg-violet-50 rounded-xl">
          <LayoutList className="w-4 h-4 text-violet-600" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <Table>
          <TableBody>
            {dynamicTasks.map((task) => (
              <TableRow 
                key={task.id} 
                onClick={() => router.push(task.link)}
                className="group border-slate-50 hover:bg-slate-50/40 transition-colors cursor-pointer relative"
              >
                <td className="py-3 relative">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all border border-transparent", 
                      task.bgColor
                    )}>
                      <task.icon className={cn("w-4 h-4", task.color)} />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-semibold text-slate-800 text-[13px] leading-tight truncate">
                        {task.title}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium truncate mt-1">
                        {task.desc}
                      </span>
                    </div>
                  </div>

                  <div className="absolute top-3 right-2">
                    <Badge className={cn(
                      "px-2 py-0.5 rounded-md font-bold text-[8px] tracking-tight shadow-none border",
                      task.priority === "URGENT" ? "bg-rose-50 text-rose-600 border-rose-200" : 
                      task.priority === "HIGH"   ? "bg-emerald-50 text-emerald-600 border-emerald-200" : 
                      task.priority === "MEDIUM" ? "bg-amber-50 text-amber-600 border-amber-200" : 
                      "bg-gray-50 text-slate-400 border-gray-200"
                    )}>
                      {task.priority}
                    </Badge>
                  </div>
                </td>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  )
}