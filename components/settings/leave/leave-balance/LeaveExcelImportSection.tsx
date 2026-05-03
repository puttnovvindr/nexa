"use client"

import React, { useState, useEffect } from "react"
import * as XLSX from "xlsx"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableHeader, TableRow } from "@/components/ui/table"
import { RefreshCw } from "lucide-react"
import { TableSortHeader } from "@/components/data-table/table-sort-header"
import { TableData } from "@/components/data-table/table-data"
import { FileUploadZone } from "@/components/data-table/file-upload-zone"
import { MappingStepper } from "@/components/data-table/mapping-stepper"
import { SubmitButton } from "@/components/data-table/submit-button"
import { StatusDialog } from "@/components/data-table/status-dialog"
import { parseErrorMessage } from "@/lib/parse-error"
import { bulkCreateLeaveBalances } from "@/actions/settings-actions"
import { LeaveExcelImportSectionProps, ColumnMapping, ImportResult } from "@/types/leave"

const LEAVE_BALANCE_FIELDS = [
  { field: "Employee ID",    label: "Employee ID",       required: true  },
  { field: "Leave Type",     label: "Leave Type",        required: true  },
  { field: "Entitlement",    label: "Entitlement (days)",required: true  },
  { field: "Year",           label: "Year",              required: true  },
  { field: "Valid From",     label: "Valid From",        required: false },
  { field: "Valid To",       label: "Valid To",          required: false },
]

const getDefaultMapping = (): ColumnMapping[] =>
  LEAVE_BALANCE_FIELDS.map((f) => ({ field: f.field, index: null }))

export default function LeaveExcelImportSection({
  onFinish,
  onDataLoaded,
}: LeaveExcelImportSectionProps) {
  const [data, setData] = useState<(string | number | Date)[][]>([])
  const [headers, setHeaders] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [mapping, setMapping] = useState<ColumnMapping[]>(getDefaultMapping)
  const [status, setStatus] = useState({ open: false, success: false, message: "" })

  useEffect(() => {
    onDataLoaded(data.length > 0)
  }, [data, onDataLoaded])

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (evt) => {
      const bstr = evt.target?.result
      if (!(bstr instanceof ArrayBuffer)) return

      const wb = XLSX.read(bstr, { 
        type: "array", 
        cellDates: true, 
        dateNF: "yyyy-mm-dd" 
      })
      
      const ws = wb.Sheets[wb.SheetNames[0]]
      const rawData = XLSX.utils.sheet_to_json(ws, {
        header: 1,
        raw: false,
        dateNF: 'yyyy-mm-dd'
      }) as (string | number | Date)[][]

      if (rawData.length > 0) {
        setHeaders(rawData[0] as string[])
        setData(rawData.slice(1))
        setMapping(getDefaultMapping())
        setCurrentStep(0)
      }
    }
    reader.readAsArrayBuffer(file)
  }

  const handleHeaderClick = (colIndex: number) => {
    if (currentStep >= mapping.length) return
    if (mapping.some((m) => m.index === colIndex)) return
    const updated = [...mapping]
    updated[currentStep] = { ...updated[currentStep], index: colIndex }
    setMapping(updated)
    setCurrentStep(currentStep + 1)
  }

  const handleUnmap = (stepIndex: number) => {
    setMapping((prev) =>
      prev.map((m, i) => (i === stepIndex ? { ...m, index: null } : m))
    )
    setCurrentStep(stepIndex)
  }

  const handleResetMapping = () => {
    setMapping(getDefaultMapping())
    setCurrentStep(0)
  }

  const handleChangeFile = () => {
    setData([])
    setHeaders([])
    setCurrentStep(0)
    setMapping(getDefaultMapping())
  }

  const allRequiredMapped = LEAVE_BALANCE_FIELDS.filter((f) => f.required).every(
    (f) => mapping.find((m) => m.field === f.field)?.index !== null
  )

  const handleImport = async () => {
    setLoading(true)
    try {
      const result = (await bulkCreateLeaveBalances({
        data,
        mapping,
      })) as ImportResult

      setStatus({
        open: true,
        success: result.success,
        message: result.success
          ? `Successfully imported ${result.count ?? 0} records!`
          : parseErrorMessage(result.error),
      })
    } catch (err: unknown) {
      setStatus({
        open: true,
        success: false,
        message: err instanceof Error ? err.message : "Something went wrong.",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full w-full">
      {!headers.length ? (
        <FileUploadZone onFileChange={handleFileUpload} />
      ) : (
        <>
          <div className="shrink-0 mb-4">
            <MappingStepper
              mapping={mapping}
              currentStep={currentStep}
              onUnmap={handleUnmap}
            />
          </div>

          <div className="flex-1 min-h-0 w-full border border-gray-100 rounded-2xl bg-white overflow-auto custom-scroll shadow-sm">
            <Table className="min-w-[1000px] relative border-collapse">
              <TableHeader className="sticky top-0 z-30 bg-gray-50/95 backdrop-blur-sm">
                <TableRow className="hover:bg-transparent border-b">
                  {headers.map((h, idx) => {
                    const mapped = mapping.find((m) => m.index === idx)
                    return (
                      <TableSortHeader
                        key={idx}
                        variant="import"
                        mapped={!!mapped}
                        label={h || "Untitled"}
                        subLabel={mapped ? `Mapped: ${mapped.field}` : `Column ${idx + 1}`}
                        onClick={() => handleHeaderClick(idx)}
                        className="min-w-[180px]"
                      />
                    )
                  })}
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((row, i) => (
                  <TableRow key={i} className="hover:bg-gray-50/50 border-b border-gray-50">
                    {row.map((cell, j) => (
                      <TableData key={j} variant="secondary" className="px-4 py-3 border-r border-gray-50 last:border-none">
                        {String(cell ?? "")}
                      </TableData>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="shrink-0 flex items-center justify-between pt-6 bg-white z-10">
            <Button
              variant="ghost"
              className="text-gray-400 px-4 h-11 hover:text-[#1E293B] font-bold text-[13px] cursor-pointer"
              onClick={handleResetMapping}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Reset Mapping
            </Button>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="rounded-xl px-8 h-11 font-bold text-[13px] border-gray-200 cursor-pointer hover:bg-gray-50"
                onClick={handleChangeFile}
              >
                Change File
              </Button>
              <SubmitButton
                type="button"
                loading={loading}
                disabled={!allRequiredMapped}
                label="Import Leave Balances"
                loadingLabel="Importing..."
                onClick={handleImport}
                className="w-auto px-10 rounded-xl h-11 shadow-sm font-bold"
              />
            </div>
          </div>
        </>
      )}

      <style jsx global>{`
        .custom-scroll::-webkit-scrollbar:vertical { width: 6px; }
        .custom-scroll::-webkit-scrollbar:horizontal { height: 4px; }
        .custom-scroll::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 20px; }
        .custom-scroll { scrollbar-width: thin; scrollbar-color: #e2e8f0 transparent; }
      `}</style>

      <StatusDialog
        open={status.open}
        success={status.success}
        message={status.message}
        onClose={() => {
          setStatus((s) => ({ ...s, open: false }))
          if (status.success) onFinish({ success: true })
        }}
      />
    </div>
  )
}