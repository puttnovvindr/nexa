"use client"

import React, { useState, useEffect } from 'react'
import * as XLSX from 'xlsx'
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { importEmployees } from "@/actions/employee-actions"
import { ImportResult, Mapping } from "@/types/employee"
import { UploadCloud, RefreshCw, Loader2, Check } from "lucide-react"
import { cn } from "@/lib/utils"

import { TableContainer } from "@/components/data-table/table-container"
import { StatusDialog } from "@/components/data-table/status-dialog"

interface ExcelImportProps {
  onFinish: (result: ImportResult) => void
  onDataLoaded: (hasData: boolean) => void
}

export default function ExcelImportSection({ onFinish, onDataLoaded }: ExcelImportProps) {
  const [data, setData] = useState<(string | number)[][]>([])
  const [headers, setHeaders] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  
  const [status, setStatus] = useState<{ open: boolean; success: boolean; message: string }>({
    open: false, success: false, message: ""
  })

  const [mapping, setMapping] = useState<Mapping[]>([
    { field: "Full Name", index: null },
    { field: "Employee ID (NIK)", index: null },
    { field: "Email", index: null },
    { field: "Department", index: null },
    { field: "Job Title", index: null },
    { field: "Level", index: null },
    { field: "Status", index: null },
  ])

  useEffect(() => {
    onDataLoaded(data.length > 0)
  }, [data, onDataLoaded])

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (evt) => {
      const bstr = evt.target?.result
      if (!(bstr instanceof ArrayBuffer)) {
        const wb = XLSX.read(bstr, { type: 'binary' })
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
    if (mapping.some(m => m.index === colIndex)) return
    const newMapping = [...mapping]
    newMapping[currentStep].index = colIndex
    setMapping(newMapping)
    setCurrentStep(currentStep + 1)
  }

  const handleImport = async () => {
    setLoading(true)
    try {
      const result = await importEmployees({ data, mapping }) as ImportResult
      if (result.success) {
        setStatus({ open: true, success: true, message: `Successfully imported ${result.count ?? 0} employees!` })
      } else {
        setStatus({ open: true, success: false, message: result.error || "Failed to import." })
      }
    } catch (err) {
      setStatus({ open: true, success: false, message: "Critical error occurred." })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-4 pt-2 font-sans h-full max-h-[75vh]">
      {!headers.length ? (
        <label className="flex flex-col items-center justify-center w-full h-52 border-2 border-dashed rounded-2xl cursor-pointer bg-gray-50 hover:bg-gray-100 border-gray-200 transition-colors shadow-none shrink-0">
          <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
            <div className="p-4 bg-white rounded-full mb-3 border border-gray-100">
                <UploadCloud className="w-8 h-8 text-[#8B5CF6]" />
            </div>
            <p className="mb-1 text-sm text-gray-600 font-bold">Upload your employee list</p>
            <p className="text-xs text-gray-400">Click to browse (.xlsx or .xls)</p>
          </div>
          <input type="file" className="hidden" accept=".xlsx, .xls" onChange={handleFileUpload} />
        </label>
      ) : (
        <>
          <div className="p-4 bg-[#F5F3FF] border border-[#DDD6FE] rounded-xl shrink-0">
            <div className="flex items-center justify-between mb-3">
                <h4 className="text-[11px] font-black text-[#7C3AED] uppercase tracking-widest flex items-center gap-2">
                {currentStep < mapping.length 
                    ? `Step ${currentStep + 1}: Select Column for ${mapping[currentStep].field}`
                    : "Ready to process"}
                </h4>
                {currentStep === mapping.length && <Badge className="bg-green-500 text-white shadow-none rounded-sm">Validated</Badge>}
            </div>
            <div className="flex flex-wrap gap-2">
              {mapping.map((m, i) => (
                <Badge 
                  key={i} 
                  variant="outline"
                  className={cn(
                    "text-[10px] px-2.5 py-1 rounded-sm transition-all border-2 shadow-none font-bold",
                    m.index !== null 
                      ? "bg-[#8B5CF6] border-[#8B5CF6] text-white" 
                      : i === currentStep 
                        ? "border-[#8B5CF6] text-[#8B5CF6] bg-white ring-2 ring-[#F5F3FF]" 
                        : "bg-white text-gray-300 border-gray-100"
                  )}
                >
                  {m.field} {m.index !== null ? `(Col ${m.index + 1})` : ""}
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex-1 min-h-0 -mt-6 flex flex-col overflow-hidden">
            <TableContainer>
                <div className={cn(
                    "overflow-auto w-full h-full max-h-[400px]",
                    "[&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar]:h-1.5",
                    "[&::-webkit-scrollbar-track]:bg-transparent",
                    "[&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-gray-300"
                )}>
                  <Table className="w-full border-collapse min-w-[1400px]">
                      <TableHeader className="bg-gray-50 sticky top-0 z-20 border-b">
                      <TableRow className="hover:bg-transparent border-none">
                          {headers.map((h, idx) => {
                          const mapped = mapping.find(m => m.index === idx)
                          return (
                              <TableHead 
                              key={idx} 
                              className={cn(
                                  "cursor-pointer border-r last:border-0 h-16 min-w-[180px] transition-colors p-4 relative",
                                  mapped ? 'bg-[#F5F3FF] text-[#7C3AED]' : 'hover:bg-gray-100'
                              )}
                              onClick={() => handleHeaderClick(idx)}
                              >
                              <div className="text-[10px] font-bold text-gray-400 uppercase mb-1 truncate">
                                  {mapped ? `Mapped: ${mapped.field}` : `Column ${idx + 1}`}
                              </div>
                              <div className="font-bold text-[13px] truncate text-gray-800">{h || "Untitled"}</div>
                              {mapped && <div className="absolute top-2 right-2"><Check className="w-3.5 h-3.5 text-[#8B5CF6]" /></div>}
                              </TableHead>
                          )
                          })}
                      </TableRow>
                      </TableHeader>
                      <TableBody>
                      {data.map((row, i) => (
                          <TableRow key={i} className="hover:bg-gray-50/50 border-b last:border-0">
                          {row.map((cell, j) => (
                              <TableCell key={j} className="text-[12px] py-3.5 px-4 text-gray-600 border-r last:border-0 whitespace-nowrap">
                              {String(cell ?? "")}
                              </TableCell>
                          ))}
                          </TableRow>
                      ))}
                      </TableBody>
                  </Table>
                </div>
            </TableContainer>
          </div>

          <div className="flex items-center justify-between pt-4 shrink-0 mt-auto">
            <Button 
              variant="ghost" 
              className="text-gray-400 hover:text-red-500 hover:bg-red-50 text-xs font-bold shadow-none"
              onClick={() => { setMapping(mapping.map(m => ({ ...m, index: null }))); setCurrentStep(0); }}
            >
              <RefreshCw className="w-3.5 h-3.5 mr-2" /> Reset Mapping
            </Button>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="cursor-pointer rounded-sm px-6 h-11 font-bold text-xs shadow-none border-gray-200"
                onClick={() => { setData([]); setHeaders([]); setCurrentStep(0); }}
              >
                Change File
              </Button>
              <Button 
                disabled={currentStep < mapping.length || loading} 
                onClick={handleImport} 
                className="bg-[#8B5CF6] hover:bg-[#7C3AED] cursor-pointer text-white px-8 h-11 rounded-sm font-bold shadow-none disabled:opacity-20 transition-all"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "Import Employees"}
              </Button>
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