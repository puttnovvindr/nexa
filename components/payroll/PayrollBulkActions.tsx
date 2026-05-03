"use client"

import React, { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { updatePayrollStatusBulk } from "@/actions/payroll-actions"
import { PayrollStatus } from "@prisma/client"
import { ShieldCheck, AlertTriangle, X, Loader2, Layers } from "lucide-react"
import { BulkReviewDialog } from "./BulkReviewDialog"
import { FlattenedPayroll } from "@/types/payroll"
import { cn } from "@/lib/utils"

interface Props {
  selectedIds: string[]
  onClear: () => void
  allData: FlattenedPayroll[]
  onSelect: (ids: string[]) => void
}

export function PayrollBulkActions({ selectedIds, onClear, allData, onSelect }: Props) {
  const [isReviewOpen, setIsReviewOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  
  if (selectedIds.length === 0) return null

  const selectedData = allData.filter(p => selectedIds.includes(p.id))
  const hasAnomaly = selectedData.some(p => p.isAnomaly)

  const handleRemove = (id: string) => {
    onSelect(selectedIds.filter(sid => sid !== id))
    if (selectedIds.length <= 1) setIsReviewOpen(false)
  }

  const handleBulkConfirm = () => {
    startTransition(async () => {
      await updatePayrollStatusBulk(selectedIds, PayrollStatus.APPROVED)
      setIsReviewOpen(false)
      onClear()
    })
  }

  return (
    <>
      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-6 duration-500 font-poppins">
        <div className="bg-white/80 backdrop-blur-xl border border-violet-100 px-5 py-3 rounded-2xl shadow-[0_20px_50px_rgba(109,40,217,0.12)] flex items-center gap-6 min-w-[400px]">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 bg-violet-50 text-violet-600 rounded-xl flex items-center justify-center border border-violet-100">
              <Layers className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-[13px] font-semibold text-slate-700 leading-none">
                  {selectedIds.length} Selected
                </span>
                {hasAnomaly && (
                  <div className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                )}
              </div>
              <span className="text-[10px] text-slate-400 font-medium tracking-wide italic">Batch processing ready</span>
            </div>
          </div>

          <div className="h-8 w-[1px] bg-slate-100" />

          <div className="flex items-center gap-3 flex-1 justify-end">
            {hasAnomaly && (
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-amber-50 rounded-lg border border-amber-100">
                <AlertTriangle className="w-3 h-3 text-amber-500" />
                <span className="text-[9px] font-semibold text-amber-600 uppercase tracking-tight">Anomaly Detected</span>
              </div>
            )}
            
            <Button
              disabled={isPending}
              onClick={() => setIsReviewOpen(true)}
              className="bg-violet-600 hover:bg-violet-700 text-white rounded-sm font-semibold text-[11px] h-9 px-5 transition-all shadow-md shadow-violet-200 border-none cursor-pointer"
            >
              {isPending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                "Review Selection"
              )}
            </Button>

            <button 
              onClick={onClear} 
              className="p-1.5 hover:bg-slate-50 rounded-lg transition-colors group"
            >
              <X className="w-4 h-4 text-slate-300 group-hover:text-slate-500 cursor-pointer" />
            </button>
          </div>
        </div>
      </div>

      <BulkReviewDialog 
        open={isReviewOpen}
        onOpenChange={setIsReviewOpen}
        selectedData={selectedData}
        onRemove={handleRemove}
        onConfirm={handleBulkConfirm}
        isPending={isPending}
      />
    </>
  )
}