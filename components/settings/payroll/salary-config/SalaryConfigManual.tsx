"use client"

import React, { useState, useMemo } from "react"
import { FormInput, FormSelect } from "@/components/data-table/form-elements"
import { EmploymentBasis } from "@prisma/client"
import { SerializedSalaryConfig, SerializedComponentMaster } from "@/types/payroll"
import { Button } from "@/components/ui/button"
import { 
  XCircle, 
  PlusCircle, 
  ArrowUpCircle, 
  ArrowDownCircle 
} from "lucide-react"
import { cn } from "@/lib/utils"

const BASIS_LABELS: Record<EmploymentBasis, string> = {
  MONTHLY: "Monthly",
  WEEKLY: "Weekly",
  DAILY: "Daily",
  HOURLY: "Hourly",
}

interface ManualProps {
  editingData: SerializedSalaryConfig | null
  unconfiguredEmployees: { id: string; employeeId: string; fullName: string }[]
  masters: SerializedComponentMaster[]
}

export function SalaryConfigManual({ editingData, unconfiguredEmployees, masters }: ManualProps) {
  const [selectedComponentIds, setSelectedComponentIds] = useState<string[]>(
    editingData?.components.map((c) => c.masterId) || []
  )

  const activeComponents = useMemo(() => {
    return masters.filter((m) => selectedComponentIds.includes(m.id))
  }, [selectedComponentIds, masters])

  const earnings = activeComponents.filter((m) => m.category === "EARNING")
  const deductions = activeComponents.filter((m) => m.category === "DEDUCTION")

  const handleToggleComponent = (val: string | string[]) => {
    const ids = Array.isArray(val) ? val : [val];
    setSelectedComponentIds(ids);
  }

  const removeComponent = (id: string) => {
    setSelectedComponentIds((prev) => prev.filter((item) => item !== id));
  }

  return (
    <div className="flex flex-col h-[350px] justify-center">
      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <div className="flex-1 overflow-y-auto hide-scrollbar space-y-6 pr-1">
        {editingData && (
          <>
            <input type="hidden" name="configId" value={editingData.id} />
            <input type="hidden" name="employeeId" value={editingData.employeeId} />
          </>
        )}

        {!editingData && (
          <FormSelect
            label="Employee"
            name="employeeId"
            placeholder="Select employee..."
            options={unconfiguredEmployees.map((e) => ({
              label: `${e.fullName} (${e.employeeId})`,
              value: e.id,
            }))}
            required
          />
        )}

        <div className="grid grid-cols-2 gap-4">
          <FormSelect
            label="Basis"
            name="basis"
            defaultValue={editingData?.basis || "MONTHLY"}
            options={Object.entries(BASIS_LABELS).map(([v, l]) => ({ label: l, value: v }))}
            required
          />
          <FormInput
            label="Base Rate"
            name="baseRate"
            type="number"
            placeholder="Enter amount..."
            defaultValue={editingData?.baseRate ?? undefined}
            required
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-violet-50 flex items-center justify-center">
                <PlusCircle className="w-3.5 h-3.5 text-violet-500" />
              </div>
              <span className="text-[12px] font-bold text-slate-700">Salary Components</span>
            </div>
            <span className="text-[10px] font-black text-slate-400 uppercase">{selectedComponentIds.length} Active</span>
          </div>

          <FormSelect
            label=""
            name="components_selector"
            placeholder="Search and add earnings/deductions..."
            isMulti={true}
            defaultValue={selectedComponentIds.join(',')}
            onChange={handleToggleComponent}
            options={masters.map((m) => ({
              label: `${m.groupName ? `[${m.groupName}] ` : ""}${m.name} — IDR ${m.defaultAmount.toLocaleString()}`,
              value: m.id,
            }))}
          />

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 px-1">
                <ArrowUpCircle className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Earnings</span>
              </div>
              <div className="space-y-1.5">
                {earnings.length === 0 ? (
                  <EmptyComponentState />
                ) : (
                  earnings.map((m) => (
                    <ComponentItem key={m.id} master={m} onRemove={() => removeComponent(m.id)} />
                  ))
                )}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-1.5 px-1">
                <ArrowDownCircle className="w-3.5 h-3.5 text-rose-500" />
                <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Deductions</span>
              </div>
              <div className="space-y-1.5">
                {deductions.length === 0 ? (
                  <EmptyComponentState />
                ) : (
                  deductions.map((m) => (
                    <ComponentItem key={m.id} master={m} onRemove={() => removeComponent(m.id)} isDeduction />
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        <input type="hidden" name="selectedComponentIds" value={JSON.stringify(selectedComponentIds)} />
        
        <p className="text-[10px] text-slate-400 italic bg-slate-50 p-3 rounded-xl border border-dashed border-slate-200">
          Note: Komponen akan ditambahkan dengan nilai default dari master data.
        </p>
      </div>
    </div>
  )
}

function ComponentItem({ 
  master, 
  onRemove, 
  isDeduction = false 
}: { 
  master: SerializedComponentMaster; 
  onRemove: () => void;
  isDeduction?: boolean;
}) {
  return (
    <div className="flex items-center justify-between p-2.5 bg-white border border-slate-200 rounded-xl group transition-all hover:border-slate-300">
      <div className="flex flex-col min-w-0">
        <span className="text-[11px] font-bold text-slate-700 truncate leading-tight">
          {master.name}
        </span>
        <span className={cn(
          "text-[10px] font-mono font-bold",
          isDeduction ? "text-rose-600" : "text-emerald-600"
        )}>
          {isDeduction && "-"} IDR {master.defaultAmount.toLocaleString()}
        </span>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={onRemove}
        className="h-6 w-6 rounded-md opacity-0 group-hover:opacity-100 transition-opacity text-slate-300 hover:text-rose-600 hover:bg-rose-50"
      >
        <XCircle className="w-3.5 h-3.5" />
      </Button>
    </div>
  )
}

function EmptyComponentState() {
  return (
    <div className="py-4 border border-dashed border-slate-200 rounded-xl flex items-center justify-center bg-slate-50/50">
      <span className="text-[9px] font-bold text-slate-300 uppercase tracking-tighter">Empty</span>
    </div>
  )
}