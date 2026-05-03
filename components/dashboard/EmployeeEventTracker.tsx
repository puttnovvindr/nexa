"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Cake, Award, ShieldAlert, ChevronRight, ChevronLeft } from "lucide-react"
import { EmployeeWithRelations } from "@/types/dashboard"
import {
  isSameDay, isSameMonth, format, addMonths, subMonths,
  startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, getDay,
} from "date-fns"
import { cn } from "@/lib/utils"

type EventType = "birthday" | "anniversary" | "probation"

interface CalendarEvent {
  date: Date
  type: EventType
  name: string
  jobTitle: string
  department: string
}

interface EventConfig {
  label: string
  dotClass: string
  bgClass: string
  textClass: string
  borderClass: string
  Icon: React.ElementType
}

const EVENT_CONFIG: Record<EventType, EventConfig> = {
  birthday: {
    label: "Birthday",
    dotClass: "bg-violet-500",
    bgClass: "bg-violet-50",
    textClass: "text-violet-700",
    borderClass: "border-violet-100",
    Icon: Cake,
  },
  anniversary: {
    label: "Work Anniversary",
    dotClass: "bg-emerald-500",
    bgClass: "bg-emerald-50",
    textClass: "text-emerald-700",
    borderClass: "border-emerald-100",
    Icon: Award,
  },
  probation: {
    label: "Probation End",
    dotClass: "bg-amber-400",
    bgClass: "bg-amber-50",
    textClass: "text-amber-700",
    borderClass: "border-amber-100",
    Icon: ShieldAlert,
  },
}

const DOW_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]
const POPOVER_TIMEOUT_MS = 8000

export function EmployeeEventTracker({ data }: { data: EmployeeWithRelations[] }) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [viewMonth, setViewMonth] = useState<Date>(startOfMonth(today))
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [popoverDate, setPopoverDate] = useState<Date | undefined>(undefined)

  const containerRef = useRef<HTMLDivElement>(null)
  const autoCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  /** Close popover and clear selection */
  const closePopover = useCallback(() => {
    setPopoverDate(undefined)
    setSelectedDate(undefined)
    if (autoCloseTimer.current) clearTimeout(autoCloseTimer.current)
  }, [])

  /** Open popover and start 8-second auto-close timer */
  const openPopover = useCallback((day: Date) => {
    setSelectedDate(day)
    setPopoverDate(day)
    if (autoCloseTimer.current) clearTimeout(autoCloseTimer.current)
    autoCloseTimer.current = setTimeout(() => {
      closePopover()
    }, POPOVER_TIMEOUT_MS)
  }, [closePopover])

  useEffect(() => () => {
    if (autoCloseTimer.current) clearTimeout(autoCloseTimer.current)
  }, [])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        closePopover()
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [closePopover])


  const buildEventMap = useCallback((): Record<string, CalendarEvent[]> => {
    const year = viewMonth.getFullYear()
    const month = viewMonth.getMonth()
    const map: Record<string, CalendarEvent[]> = {}

    const add = (day: number, type: EventType, emp: EmployeeWithRelations) => {
      const key = `${year}-${month}-${day}`
      if (!map[key]) map[key] = []
      map[key].push({
        date: new Date(year, month, day),
        type,
        name: emp.fullName,
        jobTitle: emp.job?.jobTitle ?? "—",
        department: emp.job?.orgUnit?.name ?? "—",
      })
    }

    data.forEach((e) => {
      if (e.birthDate) {
        const bd = new Date(e.birthDate)
        if (bd.getMonth() === month) add(bd.getDate(), "birthday", e)
      }
      if (e.joinDate) {
        const jd = new Date(e.joinDate)
        if (jd.getMonth() === month) add(jd.getDate(), "anniversary", e)
      }
      if (e.probationEndDate) {
        const pd = new Date(e.probationEndDate)
        if (pd.getFullYear() === year && pd.getMonth() === month)
          add(pd.getDate(), "probation", e)
      }
    })
    return map
  }, [data, viewMonth])

  const eventMap = buildEventMap()

  const getEventsForDate = (date: Date): CalendarEvent[] => {
    const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
    return eventMap[key] ?? []
  }

  const calDays = eachDayOfInterval({
    start: startOfWeek(startOfMonth(viewMonth)),
    end: endOfWeek(endOfMonth(viewMonth)),
  })

  const selectedEvents = popoverDate ? getEventsForDate(popoverDate) : []

  return (
    <Card className="p-5 gap-2 rounded-2xl border border-gray-200 bg-white shadow-none h-[280px] font-poppins flex flex-col overflow-visible">
      <div className="flex items-center justify-between mb-2 shrink-0">
        <div className="flex justify-between items-start shrink-0">
          <div>
            <h4 className="text-[14px] font-bold text-slate-800">Event Tracker</h4>
            <p className="text-[11px] text-slate-400 font-medium">Active Schedule</p>
          </div>
        </div>

        <div className="flex items-center">
          <button
            onClick={() => { setViewMonth((m) => subMonths(m, 1)); closePopover() }}
            className="w-6 h-6 flex items-center justify-center rounded-lg bg-white border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5 text-slate-500" />
          </button>
          <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider min-w-[110px] text-center">
            {format(viewMonth, "MMMM yyyy")}
          </span>
          <button
            onClick={() => { setViewMonth((m) => addMonths(m, 1)); closePopover() }}
            className="w-6 h-6 flex items-center justify-center rounded-lg bg-white border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 shrink-0 mb-0.5">
        {DOW_LABELS.map((d) => (
          <div key={d} className="text-center text-[9px] font-bold text-slate-400 uppercase tracking-widest py-0.5">
            {d}
          </div>
        ))}
      </div>

      <div
        className="grid grid-cols-7 flex-1 min-h-0 overflow-visible"
        ref={containerRef}
      >
        {calDays.map((day, idx) => {
          const isCurrentMonth = isSameMonth(day, viewMonth)
          const isToday = isSameDay(day, today)
          const isSelected = selectedDate ? isSameDay(day, selectedDate) : false
          const isPopoverOpen = popoverDate ? isSameDay(day, popoverDate) : false
          const dayEvents = isCurrentMonth ? getEventsForDate(day) : []
          const dotTypes = [...new Set(dayEvents.map((e) => e.type))]
          const hasEvents = dayEvents.length > 0
          const col = getDay(day)

          const popoverHAlign = col >= 5 ? "right-0" : "left-0"

          return (
            <div
              key={day.toISOString()}
              className="relative flex items-center justify-center"
            >
              <button
                disabled={!isCurrentMonth}
                onClick={() => {
                  if (!isCurrentMonth) return
                  if (isPopoverOpen) { closePopover(); return }
                  if (hasEvents) openPopover(day)
                  else { setSelectedDate(day); setPopoverDate(undefined) }
                }}
                className={cn(
                  "relative w-7 h-7 rounded-full flex flex-col items-center justify-center transition-all duration-100 select-none",
                  !isCurrentMonth && "opacity-25 pointer-events-none",
                  isCurrentMonth && !isSelected && !isToday && "hover:bg-slate-50",
                  isToday && !isSelected && "ring-2 ring-violet-400",
                  isSelected && "bg-violet-600",
                )}
              >
                <span className={cn(
                  "text-[11px] leading-none",
                  isSelected ? "text-white font-semibold"
                    : isToday ? "text-violet-700 font-bold"
                      : "text-slate-700 font-medium",
                  hasEvents && !isSelected && "font-semibold",
                )}>
                  {day.getDate()}
                </span>

                {dotTypes.length > 0 && (
                  <span className="absolute bottom-[2px] flex gap-[2px]">
                    {dotTypes.slice(0, 3).map((type) => (
                      <span
                        key={type}
                        className={cn(
                          "w-[3px] h-[3px] rounded-full",
                          isSelected ? "bg-white/70" : EVENT_CONFIG[type].dotClass,
                        )}
                      />
                    ))}
                  </span>
                )}
              </button>

              {isPopoverOpen && selectedEvents.length > 0 && (
                <div
                  className={cn(
                    "absolute z-50 w-56 bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden",
                    "bottom-[calc(100%+4px)]",
                    popoverHAlign,
                  )}
                >
                  <div className="p-2 space-y-1.5">
                    {selectedEvents.map((ev, i) => {
                      const cfg = EVENT_CONFIG[ev.type]
                      return (
                        <div
                          key={i}
                          className={cn(
                            "flex items-start gap-2.5 px-2.5 py-2 rounded-lg border",
                            cfg.bgClass,
                            cfg.borderClass,
                          )}
                        >
                          <div className={cn("mt-0.5 p-1 rounded-md shrink-0", cfg.bgClass)}>
                            <cfg.Icon className={cn("w-3 h-3", cfg.textClass)} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className={cn("text-[9px] font-bold uppercase tracking-widest leading-none mb-1", cfg.textClass)}>
                              {cfg.label}
                            </p>
                            <p className="text-[12px] font-bold text-slate-900 leading-tight truncate">
                              {ev.name}
                            </p>
                            <p className="text-[10px] font-medium text-slate-500 leading-tight truncate mt-0.5">
                              {ev.jobTitle}
                            </p>
                            <p className={cn("text-[10px] font-semibold leading-tight truncate mt-0.5", cfg.textClass)}>
                              {ev.department}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </Card>
  )
}