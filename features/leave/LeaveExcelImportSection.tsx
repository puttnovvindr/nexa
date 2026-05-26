"use client"

import React, { useState, useEffect } from "react"
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
import { useExcelImporter } from "@/hooks/use-excel-importer"

interface LeaveExcelImportSectionProps {
  onFinish: (result: ImportResult) => void
  onDataLoaded: (hasData: boolean) => void
}

const INITIAL_LEAVE_MAPPING: ColumnMapping[] = [
  { field: "Employee ID (NIK)", index: null },
  { field: "Full Name", index: null },
  { field: "Leave Type", index: null },
  { field: "Start Date", index: null },
  { field: "End Date", index: null },
  { field: "Reason / Notes", index: null },
]

const REQUIRED_FIELDS = [
  "Employee ID (NIK)",
  "Leave Type",
  "Start Date",
  "End Date",
]

export default function LeaveExcelImportSection({
  onFinish,
  onDataLoaded,
}: LeaveExcelImportSectionProps) {
  const {
    excelData: data,
    headers,
    mapping,
    currentStep,
    loading,
    status,
    processExcelFile,
    handleHeaderClick,
    handleUnmap,
    resetImporter,
    setStatus,
    setLoading,
  } = useExcelImporter(INITIAL_LEAVE_MAPPING)

  const [lastDataLength, setLastDataLength] = useState(0)

  useEffect(() => {
    if (data.length !== lastDataLength) {
      onDataLoaded(data.length > 0)
      setLastDataLength(data.length)
    }
  }, [data, onDataLoaded, lastDataLength])

  const allRequiredMapped = REQUIRED_FIELDS.every((reqField) =>
    mapping.some((m) => m.field === reqField && m.index !== null)
  )

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      processExcelFile(file)
    }
  }

  const handleImport = async () => {
    setLoading(true)
    try {
      const formattedMapping: ColumnMapping[] = mapping.map((m) => ({
        field: m.field,
        index: m.index,
      }))
      const formattedData: (string | number | Date)[][] = data.map((row: unknown[]) =>
        row.map((cell: unknown) => (cell instanceof Date ? cell : (cell as string | number)))
      )
      const result = await importLeaves({ data: formattedData, mapping: formattedMapping })
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
              onUnmap={handleUnmap}
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
                {data.map((row: unknown[], i: number) => (
                  <TableRow key={i} className="hover:bg-gray-50/50 border-b last:border-none">
                    {row.map((cell: unknown, j: number) => (
                      <TableData key={j} variant="secondary" className="px-4 py-3">
                        {cell instanceof Date ? cell.toLocaleDateString() : String(cell ?? "")}
                      </TableData>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="shrink-0 flex items-center justify-between pt-6 bg-white z-10">
            <Button variant="ghost" onClick={resetImporter} className="text-gray-400 px-4 h-11 hover:text-[#1E293B] font-bold text-[13px] cursor-pointer">
              <RefreshCw className="w-4 h-4 mr-2" /> Reset Mapping
            </Button>
            <div className="flex gap-3">
              <Button variant="outline" onClick={resetImporter} className="rounded-xl px-8 h-11 font-bold text-[13px] border-gray-200 cursor-pointer hover:bg-gray-50">
                Change File
              </Button>
              <SubmitButton
                type="button"
                loading={loading}
                disabled={!allRequiredMapped}
                label="Import Leave Data"
                loadingLabel="Importing..."
                onClick={handleImport}
                className="w-auto px-10 rounded-xl h-11 shadow-sm font-bold cursor-pointer"
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