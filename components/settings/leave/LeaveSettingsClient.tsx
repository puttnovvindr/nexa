"use client"

import React, { useState, useMemo } from "react"
import { ClipboardList, UserCheck } from "lucide-react"
import { Tabs, TabsContent, TabsList } from "@/components/ui/tabs"
import { StatusDialog } from "@/components/data-table/status-dialog"
import { DeleteDialog } from "@/components/data-table/delete-dialog"
import { TableSearch } from "@/components/data-table/table-search"
import { TableAddButton } from "@/components/data-table/table-add-button"

import { useCrudHandler } from "@/hooks/use-crud-handler"
import { useDuplicateValidator } from "@/hooks/use-duplicate-validator"

import { SettingTabCard } from "@/components/settings/employees/SettingTabCard"
import { LeaveTypeStats } from "@/components/settings/leave/leave-type/LeaveTypeStats"
import { LeaveTypeTable } from "./leave-type/LeaveTypeTable"
import { LeaveTypeControls } from "./leave-type/LeaveTypeControls"
import { LeaveBalanceStats } from "@/components/settings/leave/leave-balance/LeaveBalanceStats"
import { LeaveBalanceTable } from "@/components/settings/leave/leave-balance/LeaveBalanceTable"
import { LeaveBalanceControls } from "@/components/settings/leave/leave-balance/LeaveBalanceControls"

import {
  createLeaveType,
  updateLeaveType,
  deleteLeaveType,
  updateLeaveBalance,
  deleteLeaveBalance, 
} from "@/actions/settings-actions"

import { LeaveType, LeaveBalance, ImportResult, LeaveBalanceEmployee } from "@/types/leave"

interface LeaveSettingsClientProps {
  leaveTypes: LeaveType[]
  leaveBalances: LeaveBalance[]
  allEmployees: LeaveBalanceEmployee[]
}

export function LeaveSettingsClient({
  leaveTypes,
  leaveBalances,
  allEmployees,
}: LeaveSettingsClientProps) {
  const {
    isPending,
    statusOpen,
    statusSuccess,
    statusMessage,
    setStatusOpen,
    deleteOpen,
    setDeleteOpen,
    isDeleting,
    handleAction,
    openDelete,
    confirmDelete,
  } = useCrudHandler()

  const { isDuplicate } = useDuplicateValidator()

  const [typeSearch, setTypeSearch] = useState("")
  const [openAddType, setOpenAddType] = useState(false)
  const [editingType, setEditingType] = useState<LeaveType | null>(null)

  const [balanceSearch, setBalanceSearch] = useState("")
  const [openAddBalance, setOpenAddBalance] = useState(false)
  const [editingBalance, setEditingBalance] = useState<LeaveBalance | null>(null)

  const filteredTypes = useMemo(
    () =>
      leaveTypes.filter((t) =>
        t.name.toLowerCase().includes(typeSearch.toLowerCase())
      ),
    [leaveTypes, typeSearch]
  )

  const filteredBalances = useMemo(
    () =>
      leaveBalances.filter(
        (b) =>
          b.employee.fullName
            .toLowerCase()
            .includes(balanceSearch.toLowerCase()) ||
          b.employee.employeeId
            .toLowerCase()
            .includes(balanceSearch.toLowerCase())
      ),
    [leaveBalances, balanceSearch]
  )

  const handleTypeOpenChange = (val: boolean) => {
    setOpenAddType(val)
    if (!val) setEditingType(null)
  }

  const handleTypeSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const name = String(formData.get("name") ?? "").trim()
    if (!editingType && isDuplicate(leaveTypes, name, "name")) {
      handleAction(
        Promise.resolve({ success: false, error: "Name already exists" }),
        ""
      )
      return
    }
    handleAction(
      editingType ? updateLeaveType(formData) : createLeaveType(formData),
      editingType ? "Type updated" : "Type created",
      () => {
        setOpenAddType(false)
        setEditingType(null)
      }
    )
  }

  const handleBalanceOpenChange = (val: boolean) => {
    setOpenAddBalance(val)
    if (!val) setEditingBalance(null)
  }

  const handleBalanceSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    handleAction(
      updateLeaveBalance(new FormData(e.currentTarget)),
      "Balance updated successfully",
      () => {
        setOpenAddBalance(false)
        setEditingBalance(null)
      }
    )
  }

  const handleBulkFinish = (res: ImportResult) => {
    handleAction(
      Promise.resolve(res),
      res.message ?? "Import successful",
      () => {
        setOpenAddBalance(false)
      }
    )
  }

  const handleTypeDelete = (id: string | string[]) =>
    openDelete(id, deleteLeaveType, "Leave type data removed")

  const handleBalanceDelete = (id: string | string[]) =>
    openDelete(id, deleteLeaveBalance, "Balance record removed")

  return (
    <div className="h-full w-full flex flex-col font-poppins overflow-hidden">
      <div className="flex-1 flex flex-col overflow-hidden gap-6 p-6">
        <div className="w-full bg-gradient-to-r from-[#7C3AED] to-[#A78BFA] py-5 px-7 rounded-2xl shrink-0 text-white shadow-sm">
          <h1 className="text-[16px] font-bold uppercase tracking-tight">
            Leave Configuration
          </h1>
          <p className="text-white/80 text-[12px] font-medium mt-0.5">
            Define leave policies and manage employee entitlements
          </p>
        </div>

        <Tabs
          defaultValue="types"
          className="flex-1 flex flex-col min-h-0 overflow-hidden"
        >
          <TabsList className="bg-slate-100/60 p-1 rounded-full border border-slate-200/50 shrink-0 w-full">
            <SettingTabCard value="types" label="Leave Types" icon={ClipboardList} />
            <SettingTabCard value="balances" label="Leave Balances" icon={UserCheck} />
          </TabsList>

          <div className="flex-1 flex min-h-0 overflow-hidden mt-4">
            <div className="flex-1 min-w-0 flex flex-col gap-6 overflow-hidden">
              <TabsContent
                value="types"
                className="flex-1 flex flex-col gap-6 overflow-hidden outline-none"
              >
                <LeaveTypeStats data={leaveTypes} />
                <div className="flex items-center justify-between shrink-0">
                  <TableSearch
                    value={typeSearch}
                    onChange={setTypeSearch}
                    placeholder="Search leave type…"
                  />
                  <TableAddButton
                    label="Add Leave Type"
                    onClick={() => setOpenAddType(true)}
                    icon={ClipboardList}
                  />
                </div>
                <LeaveTypeTable
                  data={filteredTypes}
                  isPending={isPending}
                  onEdit={setEditingType}
                  onDelete={handleTypeDelete}
                />
              </TabsContent>

              <TabsContent
                value="balances"
                className="flex-1 flex flex-col gap-6 overflow-hidden outline-none"
              >
                <LeaveBalanceStats data={leaveBalances} />
                <div className="flex items-center justify-between shrink-0">
                  <TableSearch
                    value={balanceSearch}
                    onChange={setBalanceSearch}
                    placeholder="Search employee…"
                  />
                  <TableAddButton
                    label="Configure Balance"
                    onClick={() => setOpenAddBalance(true)}
                    icon={UserCheck}
                  />
                </div>
                <LeaveBalanceTable
                  data={filteredBalances}
                  isPending={isPending}
                  onEdit={setEditingBalance}
                  onDelete={handleBalanceDelete}
                />
              </TabsContent>
            </div>
          </div>
        </Tabs>
      </div>

      <LeaveTypeControls
        open={openAddType || !!editingType}
        onOpenChange={handleTypeOpenChange}
        editingData={editingType}
        isPending={isPending}
        onSubmit={handleTypeSubmit}
      />

      <LeaveBalanceControls
        open={openAddBalance || !!editingBalance}
        onOpenChange={handleBalanceOpenChange}
        editingData={editingBalance}
        allEmployees={allEmployees}
        leaveTypes={leaveTypes}
        isPending={isPending}
        onSubmit={handleBalanceSubmit}
        onBulkFinish={handleBulkFinish}
      />

      <DeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={confirmDelete}
        loading={isDeleting}
      />

      <StatusDialog
        open={statusOpen}
        success={statusSuccess}
        message={statusMessage}
        onClose={() => setStatusOpen(false)}
      />
    </div>
  )
}