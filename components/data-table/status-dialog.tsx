"use client"

import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from "../ui/alert-dialog"
import { CheckCircle2, XCircle } from "lucide-react"

interface StatusDialogProps {
  open: boolean
  success: boolean
  message: string
  onClose: () => void
}

export function StatusDialog({ open, success, message, onClose }: StatusDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent className="bg-white rounded-3xl max-w-[340px] shadow-2xl border-none">
        <AlertDialogHeader className="hidden">
          <AlertDialogTitle>{success ? "Success" : "Failed"}</AlertDialogTitle>
        </AlertDialogHeader>
        
        <div className="flex flex-col items-center text-center p-4">
          <div className={`h-20 w-20 rounded-full flex items-center justify-center mb-4 ${success ? 'bg-green-50' : 'bg-red-50'}`}>
            {success ? <CheckCircle2 className="w-12 h-12 text-green-500" /> : <XCircle className="w-12 h-12 text-red-500" />}
          </div>
          
          <h2 className="text-2xl font-bold mb-1">{success ? "Success!" : "Failed!"}</h2>
          
          <AlertDialogDescription className="text-gray-500 text-sm mb-6">
            {message}
          </AlertDialogDescription>

          <AlertDialogAction 
            onClick={onClose} 
            className="bg-black text-white w-full h-12 rounded-2xl text-base font-semibold"
          >
            Continue
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  )
}