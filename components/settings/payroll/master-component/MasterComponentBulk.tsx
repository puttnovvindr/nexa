"use client"

import React, { useState, useEffect } from "react"
import * as XLSX from "xlsx"
import { RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableHeader, TableRow } from "@/components/ui/table"
import { TableSortHeader } from "@/components/data-table/table-sort-header"
import { TableData } from "@/components/data-table/table-data"
import { FileUploadZone } from "@/components/data-table/file-upload-zone"
import { MappingStepper } from "@/components/data-table/mapping-stepper"
import { SubmitButton } from "@/components/data-table/submit-button"
import { StatusDialog } from "@/components/data-table/status-dialog"
import { parseErrorMessage } from "@/lib/parse-error"

interface Props {
  onFinish: (result: { success: boolean }) => void
  onDataLoaded: (hasData: boolean) => void
}

interface ComponentMapping {
  field: string
  index: number | null
}

const getDefaultMapping = (): ComponentMapping[] => [
  { field: "Component Name", index: null },
  { field: "Category (EARNING/DEDUCTION)", index: null },
  { field: "Calculation Base", index: null },
  { field: "Default Amount", index: null },
  { field: "Is Taxable (TRUE/FALSE)", index: null },
  { field: "Preset Group", index: null },
]

export default function MasterComponentBulk({ onFinish, onDataLoaded }: Props) {
  const [data, setData] = useState<(string | number)[][]>([])
  const [headers, setHeaders] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [mapping, setMapping] = useState<ComponentMapping[]>(getDefaultMapping())
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
      if (typeof bstr === "string") {
        const wb = XLSX.read(bstr, { type: "binary" })
        const ws = wb.Sheets[wb.SheetNames[0]]
        const rawData = XLSX.utils.sheet_to_json(ws, { header: 1 }) as (string | number)[][]
        if (rawData.length > 0) {
          setHeaders(rawData[0] as string[])
          setData(rawData.slice(1))
        }
      }
    }
    reader.readAsBinaryString(file)
  }

  const handleHeaderClick = (colIndex: number) => {
    if (currentStep >= mapping.length) return
    if (mapping.some((m) => m.index === colIndex)) return
    const newMapping = [...mapping]
    newMapping[currentStep].index = colIndex
    setMapping(newMapping)
    setCurrentStep(currentStep + 1)
  }

  const handleUnmap = (stepIndex: number) => {
    const newMapping = mapping.map((m, i) => (i === stepIndex ? { ...m, index: null } : m))
    setMapping(newMapping)
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

  const handleImport = async () => {
    setLoading(true)
    try {
        await new Promise((resolve) => setTimeout(resolve, 1500))
        setStatus({
            open: true,
            success: true,
            message: "Master components have been successfully imported!",
        })
    } catch (error: unknown) {
        const errorMessage = error instanceof Error 
        ? error.message 
        : "An unexpected error occurred during import"

        setStatus({ 
            open: true, 
            success: false, 
            message: parseErrorMessage(errorMessage) 
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
            <Table className="min-w-[1200px] relative border-collapse">
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
                        className="min-w-[200px]"
                      />
                    )
                  })}
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((row, i) => (
                  <TableRow key={i} className="hover:bg-gray-50/50 border-b border-gray-50 last:border-none">
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
              <RefreshCw className="w-4 h-4 mr-2" /> Reset Mapping
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
                disabled={currentStep < mapping.length}
                label="Import Components"
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
        .custom-scroll::-webkit-scrollbar-thumb { background: transparent; border-radius: 20px; }
        .custom-scroll::-webkit-scrollbar-track { background: transparent; border-radius: 20px; }
        .custom-scroll { scrollbar-width: thin; scrollbar-color: transparent transparent; }
        .custom-scroll:hover { scrollbar-width: thin; scrollbar-color: #e2e8f0 transparent; }
        .custom-scroll:hover::-webkit-scrollbar-thumb { background: #e2e8f0; }
        .custom-scroll:hover::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
      `}</style>

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