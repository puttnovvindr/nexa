"use client"

import { useState } from "react"
import Link from "next/link"
import { Settings2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { TableSearch } from "@/components/data-table/table-search"
import { TableFilter } from "@/components/data-table/table-filter"
import LeaveTable from "./LeaveTable"
import LeaveImportModal from "./LeaveImportModal"
import { Leave, LeaveType } from "@/types/leave"

interface LeaveClientProps {
  data: Leave[]
  leaveTypes: LeaveType[]
  currentEmployeeId: string
}

const LEAVE_STATUS_OPTIONS = [
  { id: "PENDING", label: "Pending" },
  { id: "APPROVED", label: "Approved" },
  { id: "REJECTED", label: "Rejected" },
]

export default function LeaveClient({ data, leaveTypes, currentEmployeeId }: LeaveClientProps) {
  const [search, setSearch] = useState("")
  const [selectedStatus, setSelectedStatus] = useState<string[]>([])

  return (
    <div className="flex flex-col gap-6 h-full font-poppins">
      <div className="w-full bg-gradient-to-r from-[#7C3AED] to-[#A78BFA] py-6 px-7 rounded-2xl shadow-lg shadow-purple-200/50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl -mr-6 -mt-6" />
        <div className="relative z-10 flex flex-col">
          <h1 className="text-[16px] font-bold tracking-tight text-white uppercase">
            Leave Management
          </h1>
          <p className="text-white/80 text-[12px] font-medium leading-tight mt-1 max-w-[500px]">
            Manage employee time-off requests, track quotas, and process approvals efficiently.
          </p>
        </div>
      </div>

      <div className="flex flex-1 gap-6 min-h-0 overflow-hidden">
        <div className="flex-1 flex flex-col overflow-hidden gap-6">
          <div className="flex justify-between items-center gap-4 shrink-0">
            <TableSearch
              value={search}
              onChange={setSearch}
              placeholder="Search by employee name..."
            />

            <div className="flex items-center gap-3">
              <TableFilter
                categories={[
                  {
                    id: "status",
                    label: "Status",
                    options: LEAVE_STATUS_OPTIONS,
                    selectedValues: selectedStatus,
                    onUpdate: setSelectedStatus,
                  },
                ]}
              />

              <Link href="/leave/settings">
                <Button
                  variant="outline"
                  className="h-10 px-5 rounded-sm border-gray-200 text-gray-500 hover:text-[#1E293B] hover:bg-gray-100 transition-all font-semibold text-[12px] gap-2 shadow-none cursor-pointer"
                >
                  <Settings2 className="w-4 h-4 text-gray-400" />
                  Configuration
                </Button>
              </Link>

              <LeaveImportModal leaveTypes={leaveTypes} />
            </div>
          </div>

          <div className="flex-1 min-h-0 overflow-hidden">
            <LeaveTable
              data={data}
              search={search}
              selectedStatus={selectedStatus}
            />
          </div>
        </div>
      </div>
    </div>
  )
}