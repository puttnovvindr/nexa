"use client"

import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"
import { Checkbox } from "../ui/checkbox"
import { Button } from "../ui/button"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface TableFilterProps {
  label: string
  options: { id: string; label: string }[]
  selectedValues: string[]
  onUpdate: (values: string[]) => void
}

export function TableFilter({ label, options, selectedValues, onUpdate }: TableFilterProps) {
  const toggleOption = (id: string) => {
    const newValues = selectedValues.includes(id)
      ? selectedValues.filter((v) => v !== id)
      : [...selectedValues, id]
    onUpdate(newValues)
  }

  const displayLabel = selectedValues.length > 0 
    ? `${label} (${selectedValues.length})` 
    : `All ${label}`

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          className={cn(
            "cursor-pointer w-auto min-w-[140px] justify-between h-11 px-5 rounded-sm font-sans transition-colors border shadow-xs",
            selectedValues.length > 0 
              ? "bg-[#8B5CF6] border-[#8B5CF6] text-white hover:bg-[#7C3AED] hover:text-white" 
              : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-600"
          )}
        >
          <span className="text-sm font-medium">{displayLabel}</span>
          <ChevronDown className={cn(
            "w-4 h-4 ml-2 transition-transform duration-200",
            selectedValues.length > 0 ? "text-white" : "text-gray-400"
          )} />
        </Button>
      </PopoverTrigger>
      
      <PopoverContent 
        className="w-[220px] p-0 bg-white rounded-sm border border-gray-100 shadow-none font-sans mt-2 overflow-hidden" 
        align="start"
      >
        <div className="p-4 space-y-4">
          <p className="text-[12px] font-bold text-gray-400 px-1">Filter List</p>
          
          <div className="space-y-1 max-h-[240px] overflow-y-auto custom-scrollbar">
            {options.map((opt) => (
              <div 
                key={opt.id} 
                className="flex items-center gap-3 px-2 py-2 rounded-sm group cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => toggleOption(opt.id)}
              >
                <Checkbox 
                  id={`filter-${opt.id}`} 
                  checked={selectedValues.includes(opt.id)} 
                  onCheckedChange={() => toggleOption(opt.id)}
                  className="w-4 h-4 rounded-sm border-gray-300 shadow-none data-[state=checked]:bg-[#8B5CF6] data-[state=checked]:border-[#8B5CF6]"
                />
                <label 
                  htmlFor={`filter-${opt.id}`} 
                  className="text-[14px] font-medium text-gray-600 group-hover:text-black cursor-pointer select-none"
                  onClick={(e) => e.stopPropagation()} 
                >
                  {opt.label}
                </label>
              </div>
            ))}
          </div>
        </div>

        {selectedValues.length > 0 && (
          <div className="p-2 border-t border-gray-50">
            <Button 
              variant="ghost" 
              className="w-full h-9 text-[11px] font-bold uppercase tracking-widest text-red-500 hover:text-red-600 hover:bg-red-50 rounded-sm shadow-none cursor-pointer"
              onClick={() => onUpdate([])}
            >
              Clear {label}
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}