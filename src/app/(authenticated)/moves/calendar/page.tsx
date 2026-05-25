"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import FullCalendar from "@fullcalendar/react"
import dayGridPlugin from "@fullcalendar/daygrid"
import interactionPlugin from "@fullcalendar/interaction"
import { DatesSetArg, EventInput, EventClickArg } from "@fullcalendar/core"
import { Card, CardContent } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface DonorShape {
  id: string
  first_name: string
  last_name: string
}

interface ProfileShape {
  id: string
  first_name: string
  last_name: string
}

interface Move {
  id: string
  title: string
  due_date: string
  status: "pending" | "completed"
  donor_id: string
  solicitor_id: string
  donors: DonorShape | null
  profiles: ProfileShape | null
}

interface SolicitorOption {
  id: string
  label: string
}

export default function MovesCalendarPage() {
  const router = useRouter()
  const calendarRef = useRef<FullCalendar>(null)

  const [events, setEvents] = useState<EventInput[]>([])
  const [solicitors, setSolicitors] = useState<SolicitorOption[]>([])
  const [selectedSolicitor, setSelectedSolicitor] = useState<string>("all")
  const [isAdmin, setIsAdmin] = useState(false)
  const [dateRange, setDateRange] = useState<{ from: string; to: string } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function detectRole() {
      try {
        const res = await fetch("/api/organizations")
        setIsAdmin(res.ok)
      } catch {
        setIsAdmin(false)
      }
    }
    detectRole()
  }, [])

  const fetchMoves = useCallback(
    async (from: string, to: string, solicitorId: string) => {
      setLoading(true)
      setError(null)
      try {
        const params = new URLSearchParams({ from, to })
        if (solicitorId !== "all") {
          params.set("solicitor_id", solicitorId)
        }
        const res = await fetch(`/api/moves?${params.toString()}`)
        if (!res.ok) {
          const json = await res.json()
          throw new Error(json.error ?? "Failed to fetch moves")
        }
        const json = await res.json()
        const moves: Move[] = json.moves ?? []

        if (isAdmin) {
          const map = new Map<string, string>()
          for (const m of moves) {
            if (m.profiles) {
              map.set(
                m.profiles.id,
                `${m.profiles.first_name} ${m.profiles.last_name}`
              )
            }
          }
          setSolicitors(
            Array.from(map.entries()).map(([id, label]) => ({ id, label }))
          )
        }

        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const calEvents: EventInput[] = moves.map((m) => {
          const donorName = m.donors
            ? `${m.donors.first_name} ${m.donors.last_name}`
            : "Unknown Donor"
          const dueDate = new Date(m.due_date)
          const isOverdue = m.status === "pending" && dueDate < today
          const isCompleted = m.status === "completed"

          let backgroundColor = "#eab308"
          if (isOverdue) backgroundColor = "#ef4444"
          if (isCompleted) backgroundColor = "#22c55e"

          return {
            id: m.id,
            title: `${m.title} — ${donorName}`,
            date: m.due_date,
            backgroundColor,
            borderColor: backgroundColor,
            textColor: "#ffffff",
            extendedProps: { moveId: m.id },
          }
        })

        setEvents(calEvents)
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Unknown error")
      } finally {
        setLoading(false)
      }
    },
    [isAdmin]
  )

  useEffect(() => {
    if (dateRange) {
      fetchMoves(dateRange.from, dateRange.to, selectedSolicitor)
    }
  }, [dateRange, selectedSolicitor, fetchMoves])

  function handleDatesSet(arg: DatesSetArg) {
    const from = arg.startStr.slice(0, 10)
    const to = arg.endStr.slice(0, 10)
    setDateRange({ from, to })
  }

  function handleEventClick(arg: EventClickArg) {
    const moveId = arg.event.extendedProps.moveId as string
    router.push(`/moves/${moveId}`)
  }

  return (
    <div className="space-y-4 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Moves Calendar</h1>
        {isAdmin && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Filter by solicitor:</span>
            <Select
              value={selectedSolicitor}
              onValueChange={setSelectedSolicitor}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All solicitors" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All solicitors</SelectItem>
                {solicitors.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {error && (
        <div className="rounded-md bg-destructive/10 px-4 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      <Card>
        <CardContent className="p-4">
          <div className="min-h-[600px]">
            {loading && (
              <div className="mb-2 text-sm text-muted-foreground">Loading moves…</div>
            )}
            <FullCalendar
              ref={calendarRef}
              plugins={[dayGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              headerToolbar={{
                left: "prev,next today",
                center: "title",
                right: "dayGridMonth,dayGridWeek",
              }}
              events={events}
              datesSet={handleDatesSet}
              eventClick={handleEventClick}
              height="auto"
              eventDisplay="block"
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4 text-sm">
        <span className="flex items-center gap-1">
          <span className="inline-block h-3 w-3 rounded-sm bg-[#eab308]" />
          Pending
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-3 w-3 rounded-sm bg-[#ef4444]" />
          Overdue
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-3 w-3 rounded-sm bg-[#22c55e]" />
          Completed
        </span>
      </div>
    </div>
  )
}
