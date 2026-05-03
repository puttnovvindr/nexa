"use client"

import React, { useState, useMemo } from "react"
import { Layers, Users } from "lucide-react"
import { Tabs, TabsContent, TabsList } from "@/components/ui/tabs"
import { StatusDialog } from "@/components/data-table/status-dialog"
import { DeleteDialog } from "@/components/data-table/delete-dialog"
import { TableSearch } from "@/components/data-table/table-search"
import { TableAddButton } from "@/components/data-table/table-add-button"

import { useCrudHandler } from "@/hooks/use-crud-handler"
import { useDuplicateValidator } from "@/hooks/use-duplicate-validator"

import { SettingTabCard } from "@/components/settings/employees/SettingTabCard"

import { MasterComponentStats } from "./master-component/MasterComponentStats"
import { MasterComponentTable } from "./master-component/MasterComponentTable"
import { MasterComponentControls } from "./master-component/MasterComponentControls"

import { SalaryConfigStats } from "@/components/settings/payroll/salary-config/SalaryConfigStats"
import { SalaryConfigTable } from "./salary-config/SalaryConfigTable"
import { SalaryConfigControls } from "@/components/settings/payroll/salary-config/SalaryConfigControls"

import {
  createComponentMaster,
  updateComponentMaster,
  deleteComponentMaster,
  updateSalaryConfigById,
  assignComponentToConfig,
  removeComponentFromConfig,
} from "@/actions/settings-actions"

import {
  SerializedComponentMaster,
  SerializedSalaryConfig,
} from "@/types/payroll"

interface Props {
  componentMasters: SerializedComponentMaster[]
  salaryConfigs: SerializedSalaryConfig[]
  allEmployees: { id: string; employeeId: string; fullName: string }[]
}

export function PayrollSettingsClient({
  componentMasters,
  salaryConfigs,
  allEmployees,
}: Props) {
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

  const [masterSearch, setMasterSearch] = useState("")
  const [openAddMaster, setOpenAddMaster] = useState(false)
  const [editingMaster, setEditingMaster] = useState<SerializedComponentMaster | null>(null)

  const [salarySearch, setSalarySearch] = useState("")
  const [openAddSalary, setOpenAddSalary] = useState(false)
  const [editingSalary, setEditingSalary] = useState<SerializedSalaryConfig | null>(null)

  const filteredMasters = useMemo(
    () =>
      componentMasters.filter((m) =>
        m.name.toLowerCase().includes(masterSearch.toLowerCase())
      ),
    [componentMasters, masterSearch]
  )

  const filteredSalaries = useMemo(
    () =>
      salaryConfigs.filter(
        (c) =>
          c.employee.fullName.toLowerCase().includes(salarySearch.toLowerCase()) ||
          c.employee.employeeId.toLowerCase().includes(salarySearch.toLowerCase())
      ),
    [salaryConfigs, salarySearch]
  )

  return (
    <div className="h-full w-full flex flex-col font-poppins overflow-hidden">
      <div className="flex-1 flex flex-col overflow-hidden gap-6">

        <div className="w-full bg-gradient-to-r from-[#7C3AED] to-[#A78BFA] py-5 px-7 rounded-2xl shrink-0 text-white">
          <h1 className="text-[16px] font-bold uppercase tracking-tight">Payroll Settings</h1>
          <p className="text-white/80 text-[12px] font-medium mt-0.5">
            Manage payroll components and salary configurations
          </p>
        </div>

        <Tabs defaultValue="masters" className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <TabsList className="bg-slate-100/60 p-1 rounded-full border border-slate-200/50 shrink-0 w-full">
            <SettingTabCard value="masters" label="Master Components" icon={Layers} />
            <SettingTabCard value="salary" label="Salary Config" icon={Users} />
          </TabsList>

          <div className="flex-1 flex min-h-0 overflow-hidden">
            <div className="flex-1 min-w-0 flex flex-col gap-6 overflow-hidden">

              <TabsContent value="masters" className="flex-1 flex flex-col gap-6 overflow-hidden">
                <MasterComponentStats data={componentMasters} />

                <div className="flex items-center justify-between shrink-0">
                  <TableSearch
                    value={masterSearch}
                    onChange={setMasterSearch}
                    placeholder="Search component..."
                  />
                  <TableAddButton
                    label="Add Component"
                    onClick={() => setOpenAddMaster(true)}
                    icon={Layers}
                  />
                </div>

                <MasterComponentTable
                  data={filteredMasters}
                  isPending={isPending}
                  onToggleSort={() => {}}
                  onEdit={setEditingMaster}
                  onDelete={(id) =>
                    openDelete(id, deleteComponentMaster, "Component deleted")
                  }
                />
              </TabsContent>

              <TabsContent value="salary" className="flex-1 flex flex-col gap-6 overflow-hidden">
                <SalaryConfigStats data={salaryConfigs} />

                <div className="flex items-center justify-between shrink-0">
                  <TableSearch
                    value={salarySearch}
                    onChange={setSalarySearch}
                    placeholder="Search employee..."
                  />
                  <TableAddButton
                    label="Add Config"
                    onClick={() => setOpenAddSalary(true)}
                    icon={Users}
                  />
                </div>

                <SalaryConfigTable
                  data={filteredSalaries}
                  isPending={isPending}
                  onToggleSort={() => {}}
                  onEdit={setEditingSalary}
                  onDelete={(id) =>
                    openDelete(id, (id) => Promise.resolve({ success: true, message: "Deleted" }), "Config deleted")
                  }
                  masters={componentMasters}
                  onAssign={(configId, masterId, amount) =>
                    handleAction(
                      assignComponentToConfig(configId, masterId, amount),
                      "Component assigned"
                    )
                  }
                  onRemoveComponent={(configId, masterId) =>
                    handleAction(
                      removeComponentFromConfig(configId, masterId),
                      "Component removed"
                    )
                  }
                />
              </TabsContent>

            </div>
          </div>
        </Tabs>
      </div>

      <MasterComponentControls
        open={openAddMaster || !!editingMaster}
        onOpenChange={(val: boolean) => {
          setOpenAddMaster(val)
          if (!val) setEditingMaster(null)
        }}
        editingData={editingMaster}
        isPending={isPending}
        onSubmit={(e: React.FormEvent<HTMLFormElement>) => {
          e.preventDefault()
          const formData = new FormData(e.currentTarget)
          const name = String(formData.get("name") || "").trim()

          if (!name) {
            return handleAction(
              Promise.resolve({ success: false, error: "Component name is required" }),
              ""
            )
          }

          if (!editingMaster && isDuplicate(componentMasters, name, "name")) {
            return handleAction(
              Promise.resolve({ success: false, error: "Component already exists" }),
              ""
            )
          }

          handleAction(
            editingMaster
              ? updateComponentMaster(formData)
              : createComponentMaster(formData),
            editingMaster ? "Component updated" : "Component created",
            () => {
              setOpenAddMaster(false)
              setEditingMaster(null)
            }
          )
        }}
        onBulkFinish={() => {
          setOpenAddMaster(false)
        }}
      />

      <SalaryConfigControls
        open={openAddSalary || !!editingSalary}
        onOpenChange={(val: boolean) => {
          setOpenAddSalary(val)
          if (!val) setEditingSalary(null)
        }}
        editingData={editingSalary}
        allEmployees={allEmployees}
        masters={componentMasters}
        salaryConfigs={salaryConfigs}
        isPending={isPending}
        onSubmit={(e: React.FormEvent<HTMLFormElement>) => {
          e.preventDefault()
          const formData = new FormData(e.currentTarget)

          handleAction(
            updateSalaryConfigById(formData),
            editingSalary ? "Config updated" : "Config created",
            () => {
              setOpenAddSalary(false)
              setEditingSalary(null)
            }
          )
        }}
        onBulkFinish={() => {
          setOpenAddSalary(false)
        }}
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