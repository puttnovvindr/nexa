"use client"

import { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface TableContainerProps {
  children: ReactNode
  className?: string
  scrollable?: boolean 
  maxHeight?: string  
}

export function TableContainer({ 
  children, 
  className, 
  scrollable = false, 
  maxHeight 
}: TableContainerProps) {
  return (
    <div 
      className={cn(
        "w-full bg-white border border-gray-200 rounded-[12px]",
        !scrollable && "overflow-hidden",
        className 
      )}
    >
      <div className={cn(
        scrollable && [
          "overflow-auto w-full custom-scroll",
          "[&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar]:h-1.5",
          "[&::-webkit-scrollbar-track]:bg-transparent",
          "[&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-gray-300"
        ]
      )}
      style={maxHeight ? { maxHeight } : {}}
      >
        {children}
      </div>
    </div>
  )
}