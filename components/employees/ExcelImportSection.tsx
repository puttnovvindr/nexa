"use client"

import React, { useState, useEffect } from 'react'
import * as XLSX from 'xlsx'
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableHeader, TableRow } from "@/components/ui/table"
import { importEmployees } from "@/actions/employee-actions"
import { ImportResult, Mapping } from "@/types/employee"
import { RefreshCw } from "lucide-react"
import { TableSortHeader } from "@/components/data-table/table-sort-header"
import { StatusDialog } from "@/components/data-table/status-dialog"
import { TableData } from "@/components/data-table/table-data"
import { FileUploadZone } from "@/components/data-table/file-upload-zone"
import { MappingStepper } from "@/components/data-table/mapping-stepper"
import { SubmitButton } from "@/components/data-table/submit-button"
import { parseErrorMessage } from "@/lib/parse-error"

interface ExcelImportProps {
  onFinish: (result: ImportResult) => void
  onDataLoaded: (hasData: boolean) => void
}

const getDefaultMapping = (): Mapping[] => [
  { field: "Full Name", index: null },
  { field: "Office Email", index: null },
  { field: "Personal Email", index: null },
  { field: "Gender", index: null },
  { field: "Birth Date", index: null },
  { field: "Employee ID (NIK)", index: null },
  { field: "Join Date", index: null },
  { field: "Department", index: null }, 
  { field: "Job Title", index: null },  
  { field: "Level", index: null },    
  { field: "Employment Status", index: null }, 
  { field: "Work Schedule", index: null },
  { field: "Identity Number (KTP)", index: null },
  { field: "Tax ID (NPWP)", index: null },
  { field: "BPJS Kesehatan", index: null },
  { field: "BPJS Ketenagakerjaan", index: null },
  { field: "Bank Name", index: null },
  { field: "Bank Account", index: null },
  { field: "Account Holder Name", index: null },
  { field: "PTKP Status", index: null },
]

export default function ExcelImportSection({ onFinish, onDataLoaded }: ExcelImportProps) {
  const [data, setData] = useState<(string | number)[][]>([])
  const [headers, setHeaders] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  
  const [status, setStatus] = useState<{ open: boolean; success: boolean; message: string }>({
    open: false, success: false, message: ""
  })

  const [mapping, setMapping] = useState<Mapping[]>(getDefaultMapping)

  useEffect(() => {
    onDataLoaded(data.length > 0)
  }, [data, onDataLoaded])

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (evt) => {
      const bstr = evt.target?.result
      if (typeof bstr === 'string') {
        const wb = XLSX.read(bstr, { type: 'binary', cellDates: true }) 
        const ws = wb.Sheets[wb.SheetNames[0]]
        const rawData = XLSX.utils.sheet_to_json(ws, { 
          header: 1,
          raw: false, 
          dateNF: 'yyyy-mm-dd' 
        }) as (string | number)[][]
        
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
    if (mapping.some(m => m.index === colIndex)) return

    const newMapping = [...mapping]
    newMapping[currentStep].index = colIndex
    setMapping(newMapping)
    setCurrentStep(currentStep + 1)
  }

  const handleUnmap = (stepIndex: number) => {
    const newMapping = mapping.map((m, i) =>
      i === stepIndex ? { ...m, index: null } : m
    )
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
      const result = await importEmployees({ data, mapping }) as ImportResult
      setStatus({ 
        open: true, 
        success: result.success, 
        message: result.success 
          ? `Successfully imported ${result.count ?? 0} employees!` 
          : parseErrorMessage(result.error)
      })
    } catch (err) {
      setStatus({ 
        open: true, 
        success: false, 
        message: "Something went wrong. Please try again." 
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
            <Table className="min-w-[1600px] relative border-collapse">
              <TableHeader className="sticky top-0 z-30 bg-gray-50/95 backdrop-blur-sm">
                <TableRow className="hover:bg-transparent border-b">
                  {headers.map((h, idx) => {
                    const mapped = mapping.find(m => m.index === idx)
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
                label="Import Employees"
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
        .custom-scroll:hover { scrollbar-color: #e2e8f0 transparent; }
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