"use client"

import { Wallet, CheckCircle, Clock, FileCheck, FileText } from "lucide-react"
import { StatCard } from "@/components/data-table/stat-card"
import { FlattenedPayroll } from "@/types/payroll"
import { PayrollStatus } from "@prisma/client"

interface PayrollStatsProps {
  data: FlattenedPayroll[]
}

export function PayrollStats({ data = [] }: PayrollStatsProps) {
  const now = new Date()
  const firstDayCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const calculateTrend = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0
    return parseFloat(((current - previous) / previous * 100).toFixed(1))
  }

  const totalCount = data.length
  const prevTotalCount = data.filter(p => new Date(p.createdAt) < firstDayCurrentMonth).length
  const totalTrend = calculateTrend(totalCount, prevTotalCount)
  const paidCount = data.filter(p => p.status === PayrollStatus.PAID).length
  const prevPaidCount = data.filter(p => p.status === PayrollStatus.PAID && new Date(p.createdAt) < firstDayCurrentMonth).length
  const pendingCount = data.filter(p => p.status === PayrollStatus.PENDING).length
  const prevPendingCount = data.filter(p => p.status === PayrollStatus.PENDING && new Date(p.createdAt) < firstDayCurrentMonth).length
  const approvedCount = data.filter(p => p.status === PayrollStatus.APPROVED).length
  const prevApprovedCount = data.filter(p => p.status === PayrollStatus.APPROVED && new Date(p.createdAt) < firstDayCurrentMonth).length
  const draftCount = data.filter(p => p.status === PayrollStatus.DRAFT).length
  const prevDraftCount = data.filter(p => p.status === PayrollStatus.DRAFT && new Date(p.createdAt) < firstDayCurrentMonth).length

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 shrink-0">
      <StatCard 
        label="Total Payroll"
        value={totalCount}
        icon={Wallet}
        iconBgColor="bg-blue-50"
        iconColor="text-blue-600"
        infoText="Total records in database"
        trend={{
          value: totalTrend,
          label: "from last month",
          sentiment: "neutral"
        }}
      />

      <StatCard 
        label="Paid"
        value={paidCount}
        icon={CheckCircle}
        iconBgColor="bg-emerald-50"
        iconColor="text-emerald-600"
        infoText="Fully paid payrolls"
        trend={{
          value: calculateTrend(paidCount, prevPaidCount),
          label: "vs last month",
          sentiment: "positive"
        }}
      />

      <StatCard 
        label="Pending"
        value={pendingCount}
        icon={Clock}
        iconBgColor="bg-amber-50"
        iconColor="text-amber-600"
        infoText="Waiting for approval"
        trend={{
          value: calculateTrend(pendingCount, prevPendingCount),
          label: "vs last month",
          sentiment: "negative" 
        }}
      />

      <StatCard 
        label="Approved"
        value={approvedCount}
        icon={FileCheck}
        iconBgColor="bg-indigo-50"
        iconColor="text-indigo-600"
        infoText="Ready to be paid"
        trend={{
          value: calculateTrend(approvedCount, prevApprovedCount),
          label: "vs last month",
          sentiment: "positive"
        }}
      />

      <StatCard 
        label="Draft"
        value={draftCount}
        icon={FileText}
        iconBgColor="bg-slate-100"
        iconColor="text-slate-600"
        infoText="Unprocessed drafts"
        trend={{
          value: calculateTrend(draftCount, prevDraftCount),
          label: "vs last month",
          sentiment: "negative"
        }}
      />
    </div>
  )
}