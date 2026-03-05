"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { ReactNode } from "react"

interface EntryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void
  isPending: boolean
  children: ReactNode
  confirmText?: string
}

export function EntryDialog({
  open,
  onOpenChange,
  title,
  onSubmit,
  isPending,
  children,
  confirmText = "Save Changes"
}: EntryDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white rounded-2xl border-none shadow-2xl font-sans max-w-md">
        <form onSubmit={onSubmit}>
          <DialogHeader>
            <DialogTitle className="text-xl font-bold tracking-tight text-left">
              {title}
            </DialogTitle>
          </DialogHeader>

          <div className="py-6 space-y-4 text-left">
            {children}
          </div>

          <DialogFooter>
            <Button 
              type="submit" 
              disabled={isPending} 
              className="cursor-pointer w-full bg-[#8B5CF6] hover:bg-[#7C3AED] text-white h-12 rounded-sm text-sm font-semibold shadow-lg active:scale-[0.98] transition-all font-sans"
            >
              {isPending ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Processing...</span>
                </div>
              ) : (
                confirmText
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}