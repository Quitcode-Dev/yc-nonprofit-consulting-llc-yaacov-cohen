'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { format } from 'date-fns';
import { ChevronDown, ChevronRight, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { DataTable, DataTableColumn } from '@/components/ui/data-table';

interface ImportLog {
  id: string;
  organization_id: string;
  import_type: 'CSV' | 'Bloomerang';
  created_at: string;
  records_created: number;
  records_updated: number;
  records_skipped: number;
  error_count: number;
  errors: unknown[] | null;
}

interface ImportHistoryProps {
  orgId: string;
}

function ImportTypeBadge({ type }: { type: ImportLog['import_type'] }) {
  if (type === 'CSV') {
    return (
      <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-200">
        CSV
      </Badge>
    );
  }
  return (
    <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100 border-purple-200">
      Bloomerang
    </Badge>
  );
}

function ErrorDetails({ log }: { log: ImportLog }) {
  const hasErrors = log.error_count > 0 && log.errors && log.errors.length > 0;

  if (!hasErrors) {
    return (
      <p className="text-sm text-muted-foreground italic py-2">No errors recorded.</p>
    );
  }

  return (
    <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 space-y-1.5 my-2">
      <p className="text-xs font-semibold text-destructive uppercase tracking-wide mb-2">
        Error Details
      </p>
      {(log.errors as Array<{ row?: number; message?: string } | string>).map(
        (err, i) => {
          const message =
            typeof err === 'string'
              ? err
              : err?.message ?? JSON.stringify(err);
          const row = typeof err === 'object' && err !== null && 'row' in err ? err.row : undefined;
          return (
            <p key={i} className="text-sm text-destructive">
              {row !== undefined && (
                <span className="font-medium">Row {row}: </span>
              )}
              {message}
            </p>
          );
        }
      )}
    </div>
  );
}

export function ImportHistory({ orgId }: ImportHistoryProps) {
  const [logs, setLogs] = useState<ImportLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/organizations/${orgId}/import-logs`);
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? 'Failed to load import history.');
        return;
      }
      const data: ImportLog[] = await res.json();
      setLogs(data);
    } catch {
      setError('Failed to load import history.');
    } finally {
      setLoading(false);
    }
  }, [orgId]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  function toggleExpanded(id: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  const columns: DataTableColumn<ImportLog>[] = useMemo(
    () => [
      {
        key: 'expand',
        header: '',
        headerClassName: 'w-8',
        cellClassName: 'text-muted-foreground',
        render: (log) =>
          expandedIds.has(log.id) ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          ),
      },
      {
        key: 'type',
        header: 'Type',
        render: (log) => <ImportTypeBadge type={log.import_type} />,
      },
      {
        key: 'date',
        header: 'Date',
        cellClassName: 'text-muted-foreground whitespace-nowrap',
        render: (log) => format(new Date(log.created_at), 'MMM d, yyyy h:mm a'),
      },
      {
        key: 'created',
        header: 'Created',
        render: (log) => (
          <span>
            <span className="text-green-600 font-medium">{log.records_created.toLocaleString()}</span>
          </span>
        ),
      },
      {
        key: 'updated',
        header: 'Updated',
        render: (log) => (
          <span>
            <span className="text-blue-600 font-medium">{log.records_updated.toLocaleString()}</span>
          </span>
        ),
      },
      {
        key: 'skipped',
        header: 'Skipped',
        cellClassName: 'text-muted-foreground',
        render: (log) => log.records_skipped.toLocaleString(),
      },
      {
        key: 'errors',
        header: 'Errors',
        render: (log) =>
          log.error_count > 0 ? (
            <span className="flex items-center gap-1 text-sm text-destructive">
              <AlertCircle className="h-3.5 w-3.5" />
              {log.error_count}
            </span>
          ) : (
            <span className="text-muted-foreground">0</span>
          ),
      },
    ],
    [expandedIds]
  );

  if (error) {
    return (
      <p className="text-sm text-destructive flex items-center gap-1.5">
        <AlertCircle className="h-4 w-4" />
        {error}
      </p>
    );
  }

  return (
    <DataTable<ImportLog>
      columns={columns}
      data={logs}
      loading={loading}
      loadingRowCount={3}
      emptyMessage="No imports yet."
      onRowClick={(log) => toggleExpanded(log.id)}
      rowKey={(log) => log.id}
      renderExpandedRow={(log) =>
        expandedIds.has(log.id) ? <ErrorDetails log={log} /> : null
      }
    />
  );
}
