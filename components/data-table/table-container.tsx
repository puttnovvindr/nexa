"use client"

import { ReactNode } from "react"

export function TableContainer({ children }: { children: ReactNode }) {
  return (
    <div className="border-gray-100 rounded-2xl bg-white shadow-sm overflow-hidden mt-6">
      {children}
    </div>
  )
}