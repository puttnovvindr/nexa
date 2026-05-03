"use client"

import * as DialogPrimitive from "@radix-ui/react-dialog"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { SubmitButton } from "@/components/data-table/submit-button" 
import { ReactNode, FormEvent } from "react"
import { cn } from "@/lib/utils"
import { X } from "lucide-react"

interface EntryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: React.ReactNode;
  description?: string 
  onSubmit?: (e: FormEvent<HTMLFormElement>) => void
  isPending?: boolean
  children: ReactNode
  confirmText?: string
  showFooter?: boolean
  className?: string 
  showCloseButton?: boolean 
}

export function EntryDialog({
  open,
  onOpenChange,
  title,
  description,
  onSubmit,
  isPending = false,
  children,
  confirmText = "Save Changes",
  showFooter = true,
  className, 
  showCloseButton = true 
}: EntryDialogProps) {
  
  const handleFormSubmit = (e: FormEvent<HTMLFormElement>) => {
    if (onSubmit) {
      onSubmit(e)
    } else {
      e.preventDefault()
    }
  }

  const innerContent = (
    <div className="flex flex-col flex-1 min-h-0 px-1">
      <DialogHeader className="shrink-0 text-left mb-6"> 
        <div className="flex items-center justify-between w-full">
          <DialogTitle className="text-xl font-bold text-[#1E293B]">
            {title}
          </DialogTitle>
          
          {showCloseButton && (
            <DialogPrimitive.Close className="cursor-pointer rounded-sm p-1 text-slate-400 transition-all hover:bg-slate-50 hover:text-[#1E293B] outline-none">
              <X className="h-5 w-5" />
              <span className="sr-only">Close</span>
            </DialogPrimitive.Close>
          )}
        </div>

        {description && (
          <p className="text-[14px] text-slate-500 font-medium mt-1">
            {description}
          </p>
        )}
      </DialogHeader>

      <div className="flex-1 min-h-0 overflow-auto w-full">
        {children}
      </div>

      {showFooter && (
        <DialogFooter className="shrink-0 sm:justify-start mt-8">
          <SubmitButton 
            loading={isPending}
            label={confirmText}
            loadingLabel="Processing..."
            className="h-10 rounded-xl font-bold active:scale-[0.98] transition-all border-none" 
          />
        </DialogFooter>
      )}
    </div>
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className={cn(
          "bg-white rounded-[32px] border border-gray-100 font-poppins outline-none shadow-none",
          "flex flex-col",
          "[&>button]:hidden",
          className || "max-w-lg p-10" 
        )}
      >
        {onSubmit ? (
          <form onSubmit={handleFormSubmit} className="flex flex-col flex-1 min-h-0 w-full">
            {innerContent}
          </form>
        ) : (
          <div className="flex flex-col flex-1 min-h-0 w-full">
            {innerContent}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}