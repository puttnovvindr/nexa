"use client"

import { Badge } from "@/components/ui/badge"
import { Check, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Mapping } from "@/types/employee"

interface MappingStepperProps {
  mapping: Mapping[]
  currentStep: number
  onUnmap?: (index: number) => void
}

export function MappingStepper({ mapping, currentStep, onUnmap }: MappingStepperProps) {
  const isAllMapped = currentStep === mapping.length

  return (
    <div className="p-4 bg-violet-50/50 border border-violet-100 rounded-xl shrink-0">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-[12px] font-poppins font-semibold text-[#7C3AED] flex items-center gap-2">
          {isAllMapped 
            ? "Ready to process" 
            : `Step ${currentStep + 1}: Select Column for ${mapping[currentStep].field}`}
        </h4>
        {isAllMapped && (
          <Badge className="bg-emerald-500 text-white shadow-none rounded-xl border-none py-1 px-2">
            <Check className="w-4 h-4 mr-1" /> Validated
          </Badge>
        )}
      </div>
      
      <div className="flex flex-wrap gap-2">
        {mapping.map((m, i) => {
          const isMapped = m.index !== null
          const isActive = i === currentStep

          let badgeClass = "bg-slate-100 text-slate-400 border-transparent" 
          
          if (isMapped) {
            badgeClass = "bg-[#7C3AED] text-white border-transparent" 
          } else if (isActive) {
            badgeClass = "bg-white text-[#7C3AED] border-[#7C3AED] border" 
          }

          return (
            <Badge 
              key={i} 
              className={cn(
                "font-poppins text-[10px] px-2.5 py-1 font-semibold transition-all duration-200 shadow-none border-none",
                badgeClass,
                isMapped && "cursor-pointer group hover:bg-red-500 hover:text-white"
              )}
              onClick={() => {
                if (isMapped && onUnmap) onUnmap(i)
              }}
            >
              {m.field}
              {isMapped && (
                <span className="relative ml-1 inline-flex items-center">
                  <span className="transition-opacity duration-200 group-hover:opacity-0">
                    (Col {m.index! + 1})
                  </span>
                  <X className="w-3 h-3 absolute right-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
                </span>
              )}
            </Badge>
          )
        })}
      </div>

      {mapping.some(m => m.index !== null) && (
        <p className="text-[10px] text-violet-400 mt-2 font-medium">
          Click a mapped field to remove its column assignment
        </p>
      )}
    </div>
  )
}