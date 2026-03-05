"use client"

import { Input } from "../ui/input" 
import { Search } from "lucide-react"

interface TableSearchProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function TableSearch({ value, onChange, placeholder = "Search..." }: TableSearchProps) {
  return (
    <div className="relative flex-1 max-w-sm">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
      <Input
        placeholder={placeholder}
        className="pl-9 bg-white h-10 border-gray-200 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  )
}