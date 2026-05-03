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
      <AlertDialogContent className="bg-white rounded-[28px] max-w-[320px] shadow-md border-none font-poppins">
        <AlertDialogHeader className="hidden">
          <AlertDialogTitle>{success ? "Success" : "Failed"}</AlertDialogTitle>
        </AlertDialogHeader>
        
        <div className="flex flex-col items-center text-center p-5">
          <div className={`h-20 w-20 rounded-full flex items-center justify-center mb-5 ${
            success 
              ? 'bg-emerald-50 text-emerald-500' 
              : 'bg-rose-50 text-rose-500'
          }`}>
            {success 
              ? <CheckCircle2 className="w-10 h-10 stroke-[1.5]" /> 
              : <XCircle className="w-10 h-10 stroke-[1.5]" />
            }
          </div>
          
          <h2 className="text-xl font-black mb-1 text-[#1E293B]">
            {success ? "Success!" : "Failed!"}
          </h2>
          
          <AlertDialogDescription 
            className="text-gray-400 text-[13px] mb-6 font-medium leading-relaxed max-h-[80px] overflow-y-auto w-full custom-scroll"
          >
            {message}
          </AlertDialogDescription>

          <AlertDialogAction 
            onClick={onClose} 
            className="bg-[#1E293B] hover:bg-[#2D3D57] text-white w-full h-10 rounded-xl text-sm font-bold transition-all border-none shadow-none cursor-pointer active:scale-[0.98]"
          >
            Continue
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  )
}