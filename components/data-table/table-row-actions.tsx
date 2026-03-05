"use client"

import { Button } from "@/components/ui/button"
import { Edit, Trash2 } from "lucide-react"

interface TableRowActionsProps {
  onEdit: () => void
  onDelete: () => void
}

export function TableRowActions({ onEdit, onDelete }: TableRowActionsProps) {
  return (
    <div className="flex justify-end items-center gap-1">
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={onEdit}
        className="cursor-pointer h-9 w-9 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
      >
        <Edit className="h-[18px] w-[18px]" />
      </Button>
      <Button 
        variant="ghost" 
        size="icon" 
        className="cursor-pointer h-9 w-9 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
        onClick={onDelete}
      >
        <Trash2 className="h-[18px] w-[18px]" />
      </Button>
    </div>
  )
}