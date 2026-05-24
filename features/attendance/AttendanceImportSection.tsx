"use client"

import React, { useEffect } from "react"
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

import { importAttendance } from "@/actions/attendance-actions"
import { useExcelImporter } from "@/hooks/use-excel-importer"
import {
  AttendanceImportSectionProps,
  AttendanceMapping,
  AttendanceImportField,
} from "@/types/attendance"

interface FieldDef {
  field: AttendanceImportField
  label: string
  required: boolean
}

const ATTENDANCE_IMPORT_FIELDS: FieldDef[] = [
  { field: "Employee ID (NIK)",  label: "Employee ID (NIK)",  required: true  },
  { field: "Date (YYYY-MM-DD)",  label: "Date (YYYY-MM-DD)",  required: true  },
  { field: "Clock In (HH:mm)",   label: "Clock In (HH:mm)",   required: false },
  { field: "Clock Out (HH:mm)",  label: "Clock Out (HH:mm)",  required: false },
]

const INITIAL_MAPPING: AttendanceMapping[] = ATTENDANCE_IMPORT_FIELDS.map((f) => ({
  field: f.field,
  index: null,
}))

export default function AttendanceImportSection({
  onFinish,
  onDataLoaded,
}: AttendanceImportSectionProps) {
  const {
    excelData,
    headers,
    mapping,
    currentStep,
    loading,
    status,
    processExcelFile,
    handleHeaderClick,
    handleUnmap,
    resetImporter,
    setLoading,
    setStatus,
  } = useExcelImporter(INITIAL_MAPPING)

  const hasData = headers.length > 0

  useEffect(() => {
    onDataLoaded(hasData)
  }, [hasData, onDataLoaded])

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    processExcelFile(file)
  }

  const allRequiredMapped = ATTENDANCE_IMPORT_FIELDS.filter((f) => f.required).every(
    (f) => mapping.find((m) => m.field === f.field)?.index !== null
  )

  const handleImport = async () => {
    setLoading(true)
    try {
      const result = await importAttendance({ 
        data: excelData as (string | number | Date)[][], 
        mapping: mapping as AttendanceMapping[] 
      })
      setStatus({
        open: true,
        success: result.success,
        message: result.success
          ? result.message || `Successfully imported ${result.count ?? 0} attendance records!`
          : parseErrorMessage(result.error),
      })
    } catch (err: unknown) {
      setStatus({
        open: true,
        success: false,
        message: err instanceof Error ? err.message : "Something went wrong. Please try again.",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full w-full">
      {!hasData ? (
        <FileUploadZone onFileChange={handleFileUpload} />
      ) : (
        <>
          <div className="shrink-0 mb-4">
            <MappingStepper
              mapping={mapping as AttendanceMapping[]}
              currentStep={currentStep}
              onUnmap={handleUnmap}
            />
          </div>

          <div className="flex-1 min-h-0 w-full border border-gray-100 rounded-2xl bg-white overflow-auto custom-scroll shadow-sm">
            <Table className="min-w-[900px] relative border-collapse">
              <TableHeader className="sticky top-0 z-30 bg-gray-50/95 backdrop-blur-sm">
                <TableRow className="hover:bg-transparent border-b">
                  {headers.map((h, idx) => {
                    const mapped = mapping.find((m) => m.index === idx)
                    return (
                      <TableSortHeader
                        key={idx}
                        variant="import"
                        mapped={!!mapped}
                        label={h || `Column ${idx + 1}`}
                        subLabel={
                          mapped
                            ? `Mapped: ${mapped.field}`
                            : `Click to map`
                        }
                        onClick={() => handleHeaderClick(idx)}
                        className="min-w-[180px]"
                      />
                    )
                  })}
                </TableRow>
              </TableHeader>
              <TableBody>
                {excelData.slice(0, 50).map((row, i) => (
                  <TableRow
                    key={i}
                    className="hover:bg-gray-50/50 border-b border-gray-50 last:border-none"
                  >
                    {headers.map((_, j) => (
                      <TableData
                        key={j}
                        variant="secondary"
                        className="px-4 py-3 border-r border-gray-50 last:border-none"
                      >
                        {row[j] instanceof Date 
                          ? (row[j] as Date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) 
                          : String(row[j] ?? "")}
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
              onClick={resetImporter}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Reset Mapping
            </Button>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="rounded-xl px-8 h-11 font-bold text-[13px] border-gray-200 cursor-pointer hover:bg-gray-50"
                onClick={resetImporter}
              >
                Change File
              </Button>
              <SubmitButton
                type="button"
                loading={loading}
                disabled={!allRequiredMapped}
                label="Import Attendance"
                loadingLabel="Importing..."
                onClick={handleImport}
                className="w-auto px-10 rounded-xl h-11 shadow-sm font-bold"
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
          setStatus((s) => ({ ...s, open: false }))
          if (status.success) onFinish({ success: true })
        }}
      />
    </div>
  )
}