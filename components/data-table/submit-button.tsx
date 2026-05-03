"use client"

import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface SubmitButtonProps {
  loading?: boolean
  label: React.ReactNode 
  loadingLabel?: string
  className?: string
  disabled?: boolean
  onClick?: () => void
  type?: "submit" | "button"
}

export function SubmitButton({ 
  loading, 
  label, 
  loadingLabel = "Processing...", 
  className,
  disabled,
  onClick,
  type = "submit"
}: SubmitButtonProps) {
  return (
    <Button 
      type={type} 
      disabled={loading || disabled} 
      onClick={onClick}
      className={cn(
        "w-full h-10 px-4 rounded-sm shadow-none transition-all",
        "bg-[#7C3AED] text-white hover:bg-[#6D28D9] active:scale-[0.98]",
        "font-poppins text-[12px] font-bold cursor-pointer",
        className
      )}
    >
      {loading ? (
        <div className="flex items-center justify-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="font-medium">{loadingLabel}</span>
        </div>
      ) : (
        label
      )}
    </Button>
  )
}