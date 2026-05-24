"use client"

import { useState } from "react"
import * as XLSX from "xlsx"

interface Mapping {
  field: string
  index: number | null
}

interface ImporterStatus {
  open: boolean
  success: boolean
  message: string
}

export function useExcelImporter(initialMapping: Mapping[]) {
  const [excelData, setExcelData] = useState<unknown[][]>([])
  const [headers, setHeaders] = useState<string[]>([])
  const [mapping, setMapping] = useState<Mapping[]>(initialMapping)
  const [currentStep, setCurrentStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<ImporterStatus>({ open: false, success: false, message: "" })

  const processExcelFile = (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const data = e.target?.result
      const workbook = XLSX.read(data, { type: "binary", cellDates: true })
      const sheetName = workbook.SheetNames[0]
      const sheet = workbook.Sheets[sheetName]
      const jsonRows = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, defval: "" })

      if (jsonRows.length > 0) {
        const fileHeaders = (jsonRows[0] as unknown[]).map((h) => String(h ?? "").trim())
        setHeaders(fileHeaders)
        setExcelData(jsonRows.slice(1) as unknown[][])

        const autoMapping = mapping.map((m) => {
          const matchIndex = fileHeaders.findIndex(
            (h) => h.toLowerCase().replace(/[^a-z0-9]/g, "") === m.field.toLowerCase().replace(/[^a-z0-9]/g, "")
          )
          return { ...m, index: matchIndex !== -1 ? matchIndex : null }
        })
        setMapping(autoMapping)
      }
    }
    reader.readAsBinaryString(file)
  }

  const handleHeaderClick = (headerIndex: number) => {
    if (currentStep >= mapping.length) return
    setMapping((prev) => prev.map((m, i) => (i === currentStep ? { ...m, index: headerIndex } : m)))
    setCurrentStep((prev) => prev + 1)
  }

  const handleUnmap = (indexToUnmap: number) => {
    setMapping((prev) => prev.map((m, i) => (i === indexToUnmap ? { ...m, index: null } : m)))
    setCurrentStep(indexToUnmap)
  }

  const resetImporter = () => {
    setExcelData([])
    setHeaders([])
    setMapping(initialMapping)
    setCurrentStep(0)
  }

  return {
    excelData,
    headers,
    mapping,
    currentStep,
    setCurrentStep,
    loading,
    setLoading,
    status,
    setStatus,
    processExcelFile,
    handleHeaderClick,
    handleUnmap,
    resetImporter,
  }
}