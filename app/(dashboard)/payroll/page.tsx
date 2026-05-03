import { prisma } from "@/lib/prisma";
import PayrollClient from "@/components/payroll/PayrollClient";
import { Metadata } from "next";
import { SerializedPayroll } from "@/types/payroll";
import { EmploymentBasis } from "@prisma/client";

export const metadata: Metadata = {
  title: "Payroll | HRIS Portal",
  description: "Monitor and process employee monthly salaries.",
};

export default async function PayrollPage() {
  const [payrolls, jobs, jobLevels, employmentTypes] = await Promise.all([
    prisma.payroll.findMany({
      include: {
        components: true,
        employee: {
          select: {
            fullName: true,
            employeeId: true,
            email: true,
            bankName: true,
            bankAccount: true,
            taxId: true,
            job: {
              select: {
                jobTitle: true,
                orgUnit: { select: { name: true } },
              },
            },
            salaryConfig: {
              select: {
                basis: true,
                baseRate: true,
                ptkpStatus: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.job.findMany({
      include: { orgUnit: { select: { name: true } } },
    }),
    prisma.jobLevel.findMany(),
    prisma.employmentType.findMany(),
  ]);

  const serialized: SerializedPayroll[] = payrolls.map((p) => ({
    id: p.id,
    employeeId: p.employeeId,
    month: p.month,
    year: p.year,
    basisSnapshot: p.basisSnapshot as EmploymentBasis,
    baseRateSnapshot: Number(p.baseRateSnapshot),
    netSalary: Number(p.netSalary),
    status: p.status,
    createdAt: p.createdAt,
    payslipNumber: p.payslipNumber,
    paidAt: p.paidAt,
    components: p.components.map((c) => ({
      ...c,
      amount: Number(c.amount),
    })),
    employee: {
      fullName: p.employee.fullName,
      employeeId: p.employee.employeeId,
      email: p.employee.email,
      bankName: p.employee.bankName,
      bankAccount: p.employee.bankAccount,
      taxId: p.employee.taxId,
      job: p.employee.job ?? { jobTitle: "", orgUnit: { name: "" } },
      salaryConfig: p.employee.salaryConfig
        ? {
            basis: p.employee.salaryConfig.basis as EmploymentBasis,
            baseRate: Number(p.employee.salaryConfig.baseRate),
            ptkpStatus: p.employee.salaryConfig.ptkpStatus,
          }
        : null,
    },
  }));

  return (
    <div className="flex flex-col gap-6 font-poppins">
      <PayrollClient
        data={serialized}
        jobs={jobs}
        jobLevels={jobLevels}
        employmentTypes={employmentTypes}
      />
    </div>
  );
}