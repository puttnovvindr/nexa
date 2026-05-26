"use client"

import React from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, FileText, CheckCircle2, XCircle, Info } from "lucide-react"

interface LeaveData {
  id: string
  employee: {
    fullName: string
    employeeId: string
    orgUnit: string
  }
  leaveType: string
  startDate: string
  endDate: string
  duration: number
  reason: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
}

interface LeaveDetailSheetProps {
  leave: LeaveData | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onAction: (id: string, action: 'APPROVE' | 'REJECT') => void
}

export default function LeaveDetailSheet({ leave, open, onOpenChange, onAction }: LeaveDetailSheetProps) {
  if (!leave) return null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md flex flex-col font-poppins p-0 border-l-0">
        <SheetHeader className="p-8 border-b bg-white">
          <div className="flex items-center justify-between mb-2">
            <Badge variant="outline" className="border-violet-200 text-violet-600 bg-violet-50 text-[10px] uppercase font-bold">Audit HR</Badge>
            <Badge className={
              leave.status === 'PENDING' ? "bg-orange-100 text-orange-600" :
              leave.status === 'APPROVED' ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-600"
            }>
              {leave.status}
            </Badge>
          </div>
          <SheetTitle className="text-2xl font-bold text-slate-800">Detail Pengajuan</SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-xl border border-slate-200 flex items-center justify-center font-bold text-violet-600">
              {leave.employee.fullName.charAt(0)}
            </div>
            <div>
              <h4 className="font-bold text-slate-800 text-sm leading-none mb-1">{leave.employee.fullName}</h4>
              <p className="text-xs text-slate-400">{leave.employee.employeeId} • {leave.employee.orgUnit}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tipe Cuti</span>
              <p className="font-semibold text-slate-700">{leave.leaveType}</p>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Hari</span>
              <p className="font-semibold text-slate-700">{leave.duration} Hari</p>
            </div>
          </div>

          <div className="space-y-4">
             <div className="flex justify-between items-center p-4 rounded-xl bg-violet-50/30 border border-violet-100">
                <div className="text-center">
                  <span className="text-[9px] font-bold text-violet-400 uppercase">Mulai</span>
                  <p className="text-sm font-bold text-violet-700">{leave.startDate}</p>
                </div>
                <div className="h-4 w-[1px] bg-violet-200" />
                <div className="text-center">
                  <span className="text-[9px] font-bold text-violet-400 uppercase">Selesai</span>
                  <p className="text-sm font-bold text-violet-700">{leave.endDate}</p>
                </div>
             </div>

             <div className="space-y-2">
                <div className="flex items-center gap-2 text-slate-400">
                   <FileText className="w-3 h-3" />
                   <span className="text-[10px] font-bold uppercase tracking-widest">Alasan</span>
                </div>
                <div className="text-sm text-slate-600 bg-slate-50 p-4 rounded-xl leading-relaxed italic">
                  {leave.reason}
                </div>
             </div>
          </div>

          <div className="p-4 bg-blue-50 rounded-xl flex gap-3 items-start border border-blue-100">
            <Info className="w-4 h-4 text-blue-500 mt-0.5" />
            <p className="text-[11px] text-blue-600 leading-normal">
              Saldo karyawan akan otomatis terpotong saat Anda menekan tombol Setujui. Pastikan data sudah sesuai.
            </p>
          </div>
        </div>

        {leave.status === 'PENDING' && (
          <div className="p-8 border-t bg-white grid grid-cols-2 gap-4">
            <Button 
              variant="outline" 
              className="rounded-xl h-12 border-red-200 text-red-600 hover:bg-red-50 font-bold"
              onClick={() => onAction(leave.id, 'REJECT')}
            >
              <XCircle className="w-4 h-4 mr-2" /> Tolak
            </Button>
            <Button 
              className="rounded-xl h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-lg shadow-emerald-50"
              onClick={() => onAction(leave.id, 'APPROVE')}
            >
              <CheckCircle2 className="w-4 h-4 mr-2" /> Setujui
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}