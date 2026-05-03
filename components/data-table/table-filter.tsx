"use client"

import React, { useState } from "react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { ChevronDown, Search, RotateCcw } from "lucide-react"
import { cn } from "@/lib/utils"

interface FilterOption {
  id: string
  label: string
}

interface FilterCategory {
  id: string
  label: string
  options: FilterOption[]
  selectedValues: string[]
  onUpdate: (values: string[]) => void
  hideSearch?: boolean
  hideFooter?: boolean
  className?: string
}

interface UnifiedFilterProps {
  categories: FilterCategory[]
}

function FilterItem({ category }: { category: FilterCategory }) {
  const [searchQuery, setSearchQuery] = useState("")
  const activeCount = category.selectedValues.length
  
  const filteredOptions = category.options.filter((opt) =>
    opt.label.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const toggleOption = (optionId: string) => {
    const newValues = category.selectedValues.includes(optionId)
      ? category.selectedValues.filter((v) => v !== optionId)
      : [...category.selectedValues, optionId]
    category.onUpdate(newValues)
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "h-10 px-4 rounded-sm font-poppins border shadow-none flex gap-2 items-center transition-all cursor-pointer outline-none",
            activeCount > 0
              ? "bg-violet-600 border-violet-600 text-white hover:bg-violet-700 hover:text-white" 
              : "bg-white border-gray-200 text-slate-500 hover:text-[#7C3AED] hover:bg-purple-50"
          )}
        >
          <span className="text-[12px] font-semibold tracking-wider cursor-pointer">
            {category.label}
            {activeCount > 0 && (
              <span className="ml-1 font-semibold">({activeCount})</span>
            )}
          </span>
          <ChevronDown className={cn("w-3.5 h-3.5 transition-transform duration-200 opacity-50 cursor-pointer", activeCount > 0 && "opacity-100")} />
        </Button>
      </PopoverTrigger>

      <PopoverContent 
        align="start" 
        className={cn(
          "p-0 font-poppins rounded-xl border-slate-100 shadow-xl overflow-hidden bg-white z-[50]", 
          category.className || "w-[260px]"
        )}
      >
        {!category.hideSearch && (
          <div className="p-3 border-b border-slate-50 bg-white">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                placeholder={`Search ${category.label.toLowerCase()}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full border-none rounded-md py-2 pl-9 pr-3 text-[12px] focus:ring-1 focus:ring-violet-100 outline-none font-medium placeholder:text-slate-400 cursor-text"
              />
            </div>
          </div>
        )}

        <div className="max-h-[220px] overflow-y-auto p-1.5 bg-white static-scroll">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((opt) => (
              <div
                key={opt.id}
                className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-purple-50 transition-colors group cursor-pointer"
                onClick={() => toggleOption(opt.id)}
              >
                <Checkbox
                  checked={category.selectedValues.includes(opt.id)}
                  onCheckedChange={() => toggleOption(opt.id)}
                  className="h-4 w-4 rounded border-slate-300 data-[state=checked]:bg-violet-600 data-[state=checked]:border-violet-600 cursor-pointer"
                />
                <label className="text-[12px] font-medium text-slate-600 group-hover:text-slate-900 hover:text-[#7C3AED] hover:bg-purple-50 cursor-pointer select-none grow">
                  {opt.label}
                </label>
              </div>
            ))
          ) : (
            <div className="py-8 text-center">
              <p className="text-[11px] text-slate-400 italic font-medium">No results found</p>
            </div>
          )}
        </div>

        {!category.hideFooter && (
          <div className="p-2 border-t border-slate-50 flex items-center justify-between">
            <span className="text-[10px] font-semibold text-slate-400 uppercase pl-2">
              {activeCount} Selected
            </span>
            <Button
              variant="ghost"
              disabled={activeCount === 0}
              onClick={() => category.onUpdate([])}
              className="h-10 px-2 text-[10px] font-semibold text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all rounded-md uppercase cursor-pointer"
            >
              <RotateCcw className="w-3 h-3 mr-1.5" />
              Reset
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}

export function TableFilter({ categories }: UnifiedFilterProps) {
  const hasData = categories.some((cat) => cat.options.length > 0)
  if (!hasData) return null

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {categories.map((category) => (
        <FilterItem key={category.id} category={category} />
      ))}
    </div>
  )
}