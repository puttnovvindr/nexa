"use client"

import { Button } from "@/components/ui/button"
import { LucideIcon, Plus } from "lucide-react"
import { cn } from "@/lib/utils"

interface TableAddButtonProps {
  onClick?: () => void 
  label?: string
  className?: string
  icon?: LucideIcon 
}

export function TableAddButton({ 
  onClick, 
  label = "Add New", 
  className,
  icon: Icon = Plus 
}: TableAddButtonProps) {
  return (
    <Button 
      onClick={onClick}
      className={cn(
        "bg-[#7C3AED] text-white h-10 px-4 rounded-sm shadow-sm hover:bg-[#6D28D9] cursor-pointer transition-all font-poppins text-[12px] font-semibold",
        className
      )}
    >
      <Icon className="w-4 h-4" /> 
      {label}
    </Button>
  )
}