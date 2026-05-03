"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

type ActionResult = { success: boolean; error?: string }

export function useCrudHandler() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [statusOpen, setStatusOpen] = useState(false)
  const [statusSuccess, setStatusSuccess] = useState(false)
  const [statusMessage, setStatusMessage] = useState("")

  const [deleteOpen, setDeleteOpen] = useState(false)

  const [deleteContext, setDeleteContext] = useState<{
    id: string | string[]
    action: (id: string | string[]) => Promise<ActionResult>
    label?: string
    validate?: () => boolean
  } | null>(null)

  const [isDeleting, setIsDeleting] = useState(false)

  const handleAction = (
    promise: Promise<ActionResult>,
    successMsg: string,
    onSuccess?: () => void
  ) => {
    startTransition(async () => {
      const res = await promise

      if (res.success) {
        if (successMsg) toast.success(successMsg)
        setStatusSuccess(true)
        setStatusMessage(successMsg)
        setStatusOpen(true)
        onSuccess?.()
        router.refresh()
      } else {
        const err = res.error || "Something went wrong"
        toast.error(err)
        setStatusSuccess(false)
        setStatusMessage(err)
        setStatusOpen(true)
      }
    })
  }

  const openDelete = (
    id: string | string[],
    action: (id: string | string[]) => Promise<ActionResult>,
    label?: string,
    validate?: () => boolean
  ) => {
    setDeleteContext({ id, action, label, validate })
    setDeleteOpen(true)
  }

  const confirmDelete = async () => {
    if (!deleteContext) return

    if (deleteContext.validate && !deleteContext.validate()) {
      toast.error("Validation failed")
      return
    }

    setIsDeleting(true)

    const res = await deleteContext.action(deleteContext.id)

    setIsDeleting(false)
    setDeleteOpen(false)

    if (res.success) {
      const msg = deleteContext.label || "Deleted successfully"
      toast.success(msg)
      setStatusSuccess(true)
      setStatusMessage(msg)
      setStatusOpen(true)
      router.refresh()
    } else {
      const err = res.error || "Failed to delete"
      toast.error(err)
      setStatusSuccess(false)
      setStatusMessage(err)
      setStatusOpen(true)
    }
  }

  return {
    isPending,
    statusOpen,
    statusSuccess,
    statusMessage,
    setStatusOpen,
    deleteOpen,
    setDeleteOpen,
    isDeleting,
    handleAction,
    openDelete,
    confirmDelete,
  }
}