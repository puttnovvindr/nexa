"use client"

import { TableRow, TableCell } from "@/components/ui/table"
import { Inbox } from "lucide-react"

interface TableEmptyStateProps {
  colSpan: number
  message?: string
  description?: string
}

export function TableEmptyState({ 
  colSpan, 
  message = "No data found", 
  description = "Try adjusting your search or filter to find what you're looking for." 
}: TableEmptyStateProps) {
  return (
    <TableRow>
      <TableCell colSpan={colSpan} className="h-[400px] text-center">
        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="bg-gray-50 p-4 rounded-full">
            <Inbox className="h-8 w-8 text-gray-300" />
          </div>
          
          <div className="space-y-1">
            <p className="text-base font-semibold text-gray-900 font-sans">
              {message}
            </p>
            <p className="text-sm text-gray-500 font-sans max-w-[250px] mx-auto">
              {description}
            </p>
          </div>
        </div>
      </TableCell>
    </TableRow>
  )
}