"use client"

import React, { useState, useEffect } from "react"
import * as XLSX from "xlsx"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableHeader, TableRow } from "@/components/ui/table"
import { RefreshCw } from "lucide-react"
import { TableSortHeader } from "@/components/data-table/table-sort-header"
import { StatusDialog } from "@/components/data-table/status-dialog"
import { TableData } from "@/components/data-table/table-data"
import { FileUploadZone } from "@/components/data-table/file-upload-zone"
import { MappingStepper } from "@/components/data-table/mapping-stepper"
import { SubmitButton } from "@/components/data-table/submit-button"
import { parseErrorMessage } from "@/lib/parse-error"
import { ImportResult, ColumnMapping } from "@/types/leave"
import { importLeaves } from "@/actions/leave-actions"

interface LeaveExcelImportSectionProps {
  onFinish: (result: ImportResult) => void
  onDataLoaded: (hasData: boolean) => void
}

const getDefaultMapping = (): ColumnMapping[] => [
  { field: "Employee ID (NIK)", index: null },
  { field: "Full Name", index: null },
  { field: "Leave Type", index: null },
  { field: "Start Date", index: null },
  { field: "End Date", index: null },
  { field: "Reason / Notes", index: null },
]

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
      if (bstr instanceof ArrayBuffer) {
        const wb = XLSX.read(bstr, { type: "array", cellDates: true })
        const ws = wb.Sheets[wb.SheetNames[0]]
        const rawData = XLSX.utils.sheet_to_json(ws, { header: 1 }) as (string | number | Date)[][]

        if (rawData.length > 0) {
          setHeaders(rawData[0] as string[])
          setData(rawData.slice(1))
        }
      }
    }
    reader.readAsArrayBuffer(file)
  }

  const handleHeaderClick = (colIndex: number) => {
    if (currentStep >= mapping.length) return
    if (mapping.some((m) => m.index === colIndex)) return
    const newMapping = [...mapping]
    newMapping[currentStep].index = colIndex
    setMapping(newMapping)
    setCurrentStep(currentStep + 1)
  }

  const handleImport = async () => {
    setLoading(true)
    try {
      const result = await importLeaves({ data, mapping })
      setStatus({
        open: true,
        success: result.success,
        message: result.success
          ? `Berhasil import ${result.count} data cuti!`
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
              onUnmap={(idx) => {
                const newMapping = [...mapping]
                newMapping[idx].index = null
                setMapping(newMapping)
                setCurrentStep(idx)
              }}
            />
          </div>

          <div className="flex-1 min-h-0 w-full border border-gray-100 rounded-2xl bg-white overflow-auto shadow-sm custom-scroll">
            <Table className="min-w-[1200px] relative border-collapse">
              <TableHeader className="sticky top-0 z-30 bg-gray-50/95 backdrop-blur-sm">
                <TableRow className="border-b">
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
                  <TableRow key={i} className="hover:bg-gray-50/50 border-b last:border-none">
                    {row.map((cell, j) => (
                      <TableData key={j} variant="secondary" className="px-4 py-3">
                        {cell instanceof Date ? cell.toLocaleDateString() : String(cell ?? "")}
                      </TableData>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="shrink-0 flex items-center justify-between pt-6 bg-white">
            <Button variant="ghost" onClick={() => { setMapping(getDefaultMapping()); setCurrentStep(0); }}>
              <RefreshCw className="w-4 h-4 mr-2" /> Reset Mapping
            </Button>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => { setData([]); setHeaders([]); setCurrentStep(0); }}>
                Change File
              </Button>
              <SubmitButton
                loading={loading}
                disabled={currentStep < 4} 
                label="Import Leave Data"
                onClick={handleImport}
                className="px-10 rounded-xl h-11 font-bold"
              />
            </div>
          </div>
        </>
      )}

      <StatusDialog
        open={status.open}
        success={status.success}
        message={status.message}
        onClose={() => {
          setStatus({ ...status, open: false })
          if (status.success) onFinish({ success: true })
        }}
      />
    </div>
  )
}