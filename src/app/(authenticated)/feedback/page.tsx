"use client"

import { useEffect, useState, useCallback, useMemo } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DataTable, DataTableColumn } from "@/components/ui/data-table"

// ── Types ────────────────────────────────────────────────────────────────────

type FeedbackCategory = "bug_report" | "feature_request" | "question"
type FeedbackStatus = "new" | "reviewed" | "resolved"

interface FeedbackRow {
  id: string
  category: FeedbackCategory
  title: string
  description: string
  status: FeedbackStatus
  attachment_url: string | null
  created_at: string
  updated_at: string
  user_id: string
  organization_id: string | null
  user_profiles: {
    first_name: string | null
    last_name: string | null
    email: string
  } | null
  organizations: {
    name: string
  } | null
}

interface OrgOption {
  id: string
  name: string
}

interface FeedbackResponse {
  feedback: FeedbackRow[]
  total: number
  page: number
  pageSize: number
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function categoryLabel(cat: FeedbackCategory): string {
  switch (cat) {
    case "bug_report":
      return "Bug"
    case "feature_request":
      return "Feature"
    case "question":
      return "Question"
  }
}

function CategoryBadge({ category }: { category: FeedbackCategory }) {
  const label = categoryLabel(category)
  if (category === "bug_report") {
    return (
      <Badge className="bg-red-100 text-red-700 border-red-200 hover:bg-red-100">
        {label}
      </Badge>
    )
  }
  if (category === "feature_request") {
    return (
      <Badge className="bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-100">
        {label}
      </Badge>
    )
  }
  return (
    <Badge className="bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-100">
      {label}
    </Badge>
  )
}

function StatusBadge({ status }: { status: FeedbackStatus }) {
  if (status === "new") {
    return (
      <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200 hover:bg-yellow-100">
        New
      </Badge>
    )
  }
  if (status === "reviewed") {
    return (
      <Badge className="bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-100">
        Reviewed
      </Badge>
    )
  }
  return (
    <Badge className="bg-green-100 text-green-700 border-green-200 hover:bg-green-100">
      Resolved
    </Badge>
  )
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

function submitterName(row: FeedbackRow): string {
  const p = row.user_profiles
  if (!p) return "Unknown"
  const name = [p.first_name, p.last_name].filter(Boolean).join(" ")
  return name || p.email
}

function isImageUrl(url: string): boolean {
  return /\.(png|jpe?g|gif|webp|svg)(\?.*)?$/i.test(url)
}

// ── Main Page ────────────────────────────────────────────────────────────────

export default function FeedbackInboxPage() {
  // Filter state
  const [category, setCategory] = useState<string>("all")
  const [orgId, setOrgId] = useState<string>("all")
  const [status, setStatus] = useState<string>("all")
  const [fromDate, setFromDate] = useState<string>("")
  const [toDate, setToDate] = useState<string>("")

  // Data state
  const [rows, setRows] = useState<FeedbackRow[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [orgs, setOrgs] = useState<OrgOption[]>([])

  // Detail dialog
  const [selected, setSelected] = useState<FeedbackRow | null>(null)
  const [detailStatus, setDetailStatus] = useState<FeedbackStatus>("new")
  const [statusUpdating, setStatusUpdating] = useState(false)

  const pageSize = 50
  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  // ── Fetch orgs for filter dropdown ────────────────────────────────────────
  useEffect(() => {
    async function fetchOrgs() {
      try {
        const res = await fetch("/api/organizations")
        if (res.ok) {
          const data = await res.json()
          // data may be an array or { organizations: [] }
          const list: { id: string; name: string }[] = Array.isArray(data)
            ? data
            : data.organizations ?? []
          setOrgs(list.map((o) => ({ id: o.id, name: o.name })))
        }
      } catch {
        // ignore
      }
    }
    fetchOrgs()
  }, [])

  // ── Fetch feedback ─────────────────────────────────────────────────────────
  const fetchFeedback = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (category !== "all") params.set("category", category)
      if (orgId !== "all") params.set("org_id", orgId)
      if (status !== "all") params.set("status", status)
      if (fromDate) params.set("from", fromDate)
      if (toDate) params.set("to", toDate)
      params.set("page", String(page))

      const res = await fetch(`/api/feedback?${params.toString()}`)
      if (!res.ok) {
        setRows([])
        setTotal(0)
        return
      }
      const data: FeedbackResponse = await res.json()
      setRows(data.feedback)
      setTotal(data.total)
    } catch {
      setRows([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }, [category, orgId, status, fromDate, toDate, page])

  useEffect(() => {
    fetchFeedback()
  }, [fetchFeedback])

  // ── Handlers ───────────────────────────────────────────────────────────────
  function handleClearFilters() {
    setCategory("all")
    setOrgId("all")
    setStatus("all")
    setFromDate("")
    setToDate("")
    setPage(1)
  }

  function handleRowClick(row: FeedbackRow) {
    setSelected(row)
    setDetailStatus(row.status)
  }

  function handleDialogClose(open: boolean) {
    if (!open) setSelected(null)
  }

  async function handleStatusChange(newStatus: string) {
    if (!selected) return
    setStatusUpdating(true)
    try {
      const res = await fetch(`/api/feedback/${selected.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })
      if (res.ok) {
        const updated = newStatus as FeedbackStatus
        setDetailStatus(updated)
        setSelected((prev) => (prev ? { ...prev, status: updated } : prev))
        setRows((prev) =>
          prev.map((r) => (r.id === selected.id ? { ...r, status: updated } : r))
        )
      }
    } finally {
      setStatusUpdating(false)
    }
  }

  // ── Filter change resets page ──────────────────────────────────────────────
  function handleCategoryChange(val: string) {
    setCategory(val)
    setPage(1)
  }
  function handleOrgChange(val: string) {
    setOrgId(val)
    setPage(1)
  }
  function handleStatusFilterChange(val: string) {
    setStatus(val)
    setPage(1)
  }
  function handleFromChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFromDate(e.target.value)
    setPage(1)
  }
  function handleToChange(e: React.ChangeEvent<HTMLInputElement>) {
    setToDate(e.target.value)
    setPage(1)
  }

  // ── Column definitions ─────────────────────────────────────────────────────
  const columns: DataTableColumn<FeedbackRow>[] = useMemo(
    () => [
      {
        key: "title",
        header: "Title",
        cellClassName: "font-medium max-w-[240px] truncate",
        render: (row) => row.title,
      },
      {
        key: "category",
        header: "Category",
        render: (row) => <CategoryBadge category={row.category} />,
      },
      {
        key: "submitter",
        header: "Submitted By",
        cellClassName: "text-muted-foreground",
        render: (row) => submitterName(row),
      },
      {
        key: "organization",
        header: "Organization",
        cellClassName: "text-muted-foreground",
        render: (row) => row.organizations?.name ?? "—",
      },
      {
        key: "date",
        header: "Date",
        cellClassName: "text-muted-foreground whitespace-nowrap",
        render: (row) => formatDate(row.created_at),
      },
      {
        key: "status",
        header: "Status",
        render: (row) => <StatusBadge status={row.status} />,
      },
    ],
    []
  )

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Feedback Inbox</h1>
        <p className="text-muted-foreground text-sm mt-1">
          All feedback submissions across organizations
        </p>
      </div>

      {/* Filter Bar */}
      <div className="rounded-lg border bg-card p-4">
        <div className="flex flex-wrap gap-3 items-end">
          {/* Category */}
          <div className="flex flex-col gap-1 min-w-[150px]">
            <label className="text-xs font-medium text-muted-foreground">
              Category
            </label>
            <Select value={category} onValueChange={handleCategoryChange}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="bug_report">Bug Report</SelectItem>
                <SelectItem value="feature_request">Feature Request</SelectItem>
                <SelectItem value="question">Question</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Organization */}
          <div className="flex flex-col gap-1 min-w-[180px]">
            <label className="text-xs font-medium text-muted-foreground">
              Organization
            </label>
            <Select value={orgId} onValueChange={handleOrgChange}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {orgs.map((o) => (
                  <SelectItem key={o.id} value={o.id}>
                    {o.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status */}
          <div className="flex flex-col gap-1 min-w-[140px]">
            <label className="text-xs font-medium text-muted-foreground">
              Status
            </label>
            <Select value={status} onValueChange={handleStatusFilterChange}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="reviewed">Reviewed</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* From date */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-muted-foreground">
              From
            </label>
            <Input
              type="date"
              value={fromDate}
              onChange={handleFromChange}
              className="h-9 w-[150px]"
            />
          </div>

          {/* To date */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-muted-foreground">
              To
            </label>
            <Input
              type="date"
              value={toDate}
              onChange={handleToChange}
              className="h-9 w-[150px]"
            />
          </div>

          {/* Clear */}
          <Button
            variant="outline"
            size="sm"
            className="h-9 self-end"
            onClick={handleClearFilters}
          >
            Clear Filters
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <DataTable<FeedbackRow>
            columns={columns}
            data={rows}
            loading={loading}
            loadingRowCount={8}
            emptyMessage="No feedback found."
            onRowClick={handleRowClick}
            rowKey={(row) => row.id}
          />
        </div>

        {/* Pagination */}
        {!loading && total > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t bg-muted/20">
            <p className="text-sm text-muted-foreground">
              Showing {(page - 1) * pageSize + 1}–
              {Math.min(page * pageSize, total)} of {total}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Dialog */}
      <Dialog open={!!selected} onOpenChange={handleDialogClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="text-lg">{selected.title}</DialogTitle>
              </DialogHeader>

              <div className="space-y-4 mt-2">
                {/* Meta row */}
                <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <span className="font-medium text-foreground">Category:</span>
                    <CategoryBadge category={selected.category} />
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="font-medium text-foreground">Submitted by:</span>
                    <span>{submitterName(selected)}</span>
                  </div>
                  {selected.user_profiles?.email && (
                    <div className="flex items-center gap-1">
                      <span className="font-medium text-foreground">Email:</span>
                      <span>{selected.user_profiles.email}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <span className="font-medium text-foreground">Organization:</span>
                    <span>{selected.organizations?.name ?? "—"}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="font-medium text-foreground">Date:</span>
                    <span>{formatDate(selected.created_at)}</span>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <p className="text-sm font-medium text-foreground mb-1">
                    Description
                  </p>
                  <div className="rounded-md border bg-muted/30 p-3 text-sm whitespace-pre-wrap">
                    {selected.description}
                  </div>
                </div>

                {/* Attachment */}
                {selected.attachment_url && (
                  <div>
                    <p className="text-sm font-medium text-foreground mb-2">
                      Attachment
                    </p>
                    {isImageUrl(selected.attachment_url) ? (
                      <div className="rounded-md border overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={selected.attachment_url}
                          alt="Feedback attachment"
                          className="max-w-full max-h-80 object-contain"
                        />
                      </div>
                    ) : null}
                    <a
                      href={selected.attachment_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline mt-2"
                    >
                      Download attachment ↗
                    </a>
                  </div>
                )}

                {/* Status update */}
                <div className="flex items-center gap-3 pt-2 border-t">
                  <p className="text-sm font-medium text-foreground">Status:</p>
                  <Select
                    value={detailStatus}
                    onValueChange={handleStatusChange}
                    disabled={statusUpdating}
                  >
                    <SelectTrigger className="h-9 w-[160px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="reviewed">Reviewed</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                    </SelectContent>
                  </Select>
                  {statusUpdating && (
                    <span className="text-xs text-muted-foreground">
                      Saving…
                    </span>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
