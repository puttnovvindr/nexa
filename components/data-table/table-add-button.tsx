"use client"

import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

interface TableAddButtonProps {
  onClick: () => void
  label?: string
}

export function TableAddButton({ onClick, label = "Add New" }: TableAddButtonProps) {
  return (
    <Button 
      onClick={onClick}
      className="bg-black text-white h-10 px-4 rounded-sm shadow-sm hover:bg-gray-800 transition-all font-sans text-sm font-medium shrink-0"
    >
      <Plus className="w-4 h-4 mr-2" /> 
      {label}
    </Button>
  )
}