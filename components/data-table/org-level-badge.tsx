"use client"

interface OrgLevelBadgeProps {
  parentId?: string | null
  parentParentId?: string | null
}

export function OrgLevelBadge({ parentId, parentParentId }: OrgLevelBadgeProps) {
  const isHeadOffice = !parentId
  const isDivision = parentId && parentParentId
  const isDepartment = parentId && !parentParentId

  if (isHeadOffice) {
    return (
      <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border bg-purple-50 text-purple-700 border-purple-100 font-sans">
        Head Office
      </span>
    )
  }

  if (isDivision) {
    return (
      <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border bg-amber-50 text-amber-700 border-amber-100 font-sans">
        Division
      </span>
    )
  }

  return (
    <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border bg-blue-50 text-blue-700 border-blue-100 font-sans">
      Department
    </span>
  )
}