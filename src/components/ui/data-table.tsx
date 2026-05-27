"use client"

import React from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"

export interface DataTableColumn<T> {
  /** Unique key for the column */
  key: string
  /** Header label */
  header: React.ReactNode
  /** Optional header className (merged with defaults) */
  headerClassName?: string
  /** Optional cell className (merged with defaults) */
  cellClassName?: string
  /** Render function for the cell content */
  render: (row: T, rowIndex: number) => React.ReactNode
  /** Optional click handler on the header (e.g. for sorting) */
  onHeaderClick?: () => void
}

export interface DataTableProps<T> {
  /** Column definitions */
  columns: DataTableColumn<T>[]
  /** Row data */
  data: T[]
  /** Whether data is currently loading */
  loading?: boolean
  /** Number of skeleton rows to show while loading (default: 8) */
  loadingRowCount?: number
  /** Message to display when data is empty and not loading */
  emptyMessage?: string
  /** Optional row click handler */
  onRowClick?: (row: T, rowIndex: number) => void
  /** Extract a unique key for each row. Falls back to index. */
  rowKey?: (row: T, rowIndex: number) => string | number
  /** Optional additional className for the row */
  rowClassName?: (row: T, rowIndex: number) => string
  /** Optional render function for an expanded detail row beneath each data row */
  renderExpandedRow?: (row: T, rowIndex: number) => React.ReactNode | null
}

export function DataTable<T>({
  columns,
  data,
  loading = false,
  loadingRowCount = 8,
  emptyMessage = "No results found.",
  onRowClick,
  rowKey,
  rowClassName,
  renderExpandedRow,
}: DataTableProps<T>) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="border-b bg-muted/50">
          {columns.map((col) => (
            <TableHead
              key={col.key}
              className={[
                "px-4 py-3 font-medium text-muted-foreground",
                col.onHeaderClick ? "cursor-pointer select-none" : "",
                col.headerClassName ?? "",
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={col.onHeaderClick}
            >
              {col.header}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {loading ? (
          Array.from({ length: loadingRowCount }).map((_, i) => (
            <TableRow key={`skeleton-${i}`} className="border-b">
              {columns.map((col) => (
                <TableCell key={col.key} className="px-4 py-3">
                  <Skeleton className="h-4 w-full" />
                </TableCell>
              ))}
            </TableRow>
          ))
        ) : data.length === 0 ? (
          <TableRow>
            <TableCell
              colSpan={columns.length}
              className="px-4 py-12 text-center text-muted-foreground"
            >
              {emptyMessage}
            </TableCell>
          </TableRow>
        ) : (
          data.map((row, rowIndex) => {
            const key = rowKey ? rowKey(row, rowIndex) : rowIndex
            const extraClass = rowClassName ? rowClassName(row, rowIndex) : ""
            return (
              <React.Fragment key={key}>
                <TableRow
                  className={[
                    "border-b hover:bg-muted/50 transition-colors",
                    onRowClick ? "cursor-pointer" : "",
                    extraClass,
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={onRowClick ? () => onRowClick(row, rowIndex) : undefined}
                >
                  {columns.map((col) => (
                    <TableCell
                      key={col.key}
                      className={["px-4 py-3", col.cellClassName ?? ""]
                        .filter(Boolean)
                        .join(" ")}
                    >
                      {col.render(row, rowIndex)}
                    </TableCell>
                  ))}
                </TableRow>
                {renderExpandedRow && (() => {
                  const expanded = renderExpandedRow(row, rowIndex)
                  if (!expanded) return null
                  return (
                    <TableRow className="border-b">
                      <TableCell colSpan={columns.length} className="px-4 py-0">
                        {expanded}
                      </TableCell>
                    </TableRow>
                  )
                })()}
              </React.Fragment>
            )
          })
        )}
      </TableBody>
    </Table>
  )
}
