"use client"

import { Button } from "@/components/ui/button"
import { Edit, Trash2, Eye } from "lucide-react"
import { cn } from "@/lib/utils"

interface TableRowActionsProps {
  onView?: () => void
  onEdit?: () => void
  onDelete?: () => void
  editDisabled?: boolean 
  deleteDisabled?: boolean 
}

export function TableRowActions({ 
  onView, 
  onEdit, 
  onDelete, 
  editDisabled, 
  deleteDisabled 
}: TableRowActionsProps) {
  return (
    <div className="flex justify-end items-center gap-1">
      {onView && (
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onView}
          className="h-9 w-9 text-slate-400 hover:text-[#7C3AED] hover:bg-violet-50 rounded-lg transition-all cursor-pointer"
          title="View Details"
        >
          <Eye className="h-[18px] w-[18px]" />
        </Button>
      )}

      {onEdit && (
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onEdit}
          disabled={editDisabled}
          className={cn(
            "h-9 w-9 rounded-lg transition-all cursor-pointer",
            editDisabled 
              ? "text-slate-200 cursor-not-allowed" 
              : "text-slate-400 hover:text-[#1E293B] hover:bg-slate-100"
          )}
          title={editDisabled ? "Cannot edit" : "Edit Data"}
        >
          <Edit className="h-[18px] w-[18px]" />
        </Button>
      )}

      {onDelete && (
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onDelete}
          disabled={deleteDisabled}
          className={cn(
            "h-9 w-9 rounded-lg transition-all cursor-pointer",
            deleteDisabled 
              ? "text-slate-200 cursor-not-allowed" 
              : "text-slate-400 hover:text-red-600 hover:bg-red-50"
          )}
          title={deleteDisabled ? "Cannot delete" : "Delete Data"}
        >
          <Trash2 className="h-[18px] w-[18px]" />
        </Button>
      )}
    </div>
  )
}