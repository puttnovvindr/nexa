"use client"

import { Label } from "@/components/ui/label"
import { ReactNode } from "react"

export function FormField({ label, children, required }: { label: string, children: ReactNode, required?: boolean }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      {children}
    </div>
  )
}