import { UploadCloud } from "lucide-react"
import { cn } from "@/lib/utils"

interface FileUploadZoneProps {
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  accept?: string
}

export function FileUploadZone({ onFileChange, accept = ".xlsx, .xls" }: FileUploadZoneProps) {
  return (
    <label className={cn(
      "flex flex-col items-center justify-center w-full h-52 shrink-0",
      "border-1 border-dashed border-gray-300 rounded-2xl cursor-pointer",
      "bg-gray-50 hover:bg-gray-100 transition-colors shadow-none"
    )}>
      <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
        <div className="p-4 bg-white rounded-full mb-3 border border-gray-100">
          <UploadCloud className="w-8 h-8 text-[#1E293B]" />
        </div>
        <p className="mb-1 text-sm text-gray-600 font-semibold font-poppins">
          Upload your employee list
        </p>
        <p className="text-xs text-gray-400 font-poppins">
          Click to browse ({accept})
        </p>
      </div>
      <input 
        type="file" 
        className="hidden" 
        accept={accept} 
        onChange={onFileChange} 
      />
    </label>
  )
}