import { prisma } from "@/lib/prisma"
import { Metadata } from "next"
import { PayrollSettingsClient } from "@/components/settings/payroll/PayrollSettingsClient"
import { SerializedComponentMaster, SerializedSalaryConfig } from "@/types/payroll"

export const metadata: Metadata = {
  title: "Payroll Settings | HRIS Portal",
}

async function getData() {
  const [componentMasters, salaryConfigs, employees] = await Promise.all([
    prisma.payrollComponentMaster.findMany({
      select: {
        id: true,
        name: true,
        category: true,
        base: true,
        defaultAmount: true,
        isTaxable: true,
        deductionType: true,
        description: true,
        groupName: true,
        createdAt: true, 
        _count: { select: { configs: true } },
      },
      orderBy: { name: "asc" },
    }),
    prisma.salaryConfig.findMany({
      include: {
        employee: {
          select: { id: true, fullName: true, employeeId: true, email: true },
        },
        components: {
          include: {
            master: {
              select: {
                name: true,
                category: true,
                base: true,
                defaultAmount: true,
                groupName: true
              },
            },
          },
        },
        _count: { select: { components: true } },
      },
      orderBy: { employee: { fullName: "asc" } },
    }),
    prisma.employee.findMany({
      where: { isActive: true },
      select: { id: true, fullName: true, employeeId: true },
      orderBy: { fullName: "asc" },
    }),
  ])

  const serializedMasters: SerializedComponentMaster[] = componentMasters.map((m) => ({
    ...m,
    defaultAmount: Number(m.defaultAmount),
    groupName: m.groupName
  }))

  const serializedConfigs: SerializedSalaryConfig[] = salaryConfigs.map((c) => ({
    ...c,
    baseRate: Number(c.baseRate),
    components: c.components.map((comp) => ({
      ...comp,
      customAmount: comp.customAmount !== null ? Number(comp.customAmount) : null,
      master: {
        ...comp.master,
        defaultAmount: Number(comp.master.defaultAmount),
        groupName: comp.master.groupName
      },
    })),
  }))

  return {
    componentMasters: serializedMasters,
    salaryConfigs: serializedConfigs,
    allEmployees: employees,
  }
}

export default async function PayrollSettingsPage() {
  const data = await getData()

  return (
    <PayrollSettingsClient
      componentMasters={data.componentMasters}
      salaryConfigs={data.salaryConfigs}
      allEmployees={data.allEmployees}
    />
  )
}