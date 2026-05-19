'use client';

import { useEffect, useState, useCallback } from 'react';
import { format } from 'date-fns';
import { ChevronDown, ChevronRight, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Skeleton } from '@/components/ui/skeleton';

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

function ImportLogRow({ log }: { log: ImportLog }) {
  const [open, setOpen] = useState(false);
  const hasErrors = log.error_count > 0 && log.errors && log.errors.length > 0;

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger asChild>
        <button
          className="w-full text-left px-4 py-3 hover:bg-muted/50 transition-colors flex items-center gap-3 group"
          aria-expanded={open}
        >
          {/* Expand icon */}
          <span className="text-muted-foreground shrink-0">
            {open ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </span>

          {/* Type badge */}
          <span className="shrink-0">
            <ImportTypeBadge type={log.import_type} />
          </span>

          {/* Timestamp */}
          <span className="text-sm text-muted-foreground shrink-0 w-40">
            {format(new Date(log.created_at), 'MMM d, yyyy h:mm a')}
          </span>

          {/* Counts */}
          <span className="flex gap-4 text-sm flex-1">
            <span>
              <span className="text-green-600 font-medium">{log.records_created.toLocaleString()}</span>
              <span className="text-muted-foreground ml-1">created</span>
            </span>
            <span>
              <span className="text-blue-600 font-medium">{log.records_updated.toLocaleString()}</span>
              <span className="text-muted-foreground ml-1">updated</span>
            </span>
            <span>
              <span className="text-muted-foreground font-medium">{log.records_skipped.toLocaleString()}</span>
              <span className="text-muted-foreground ml-1">skipped</span>
            </span>
          </span>

          {/* Error count */}
          {log.error_count > 0 && (
            <span className="flex items-center gap-1 text-sm text-destructive shrink-0">
              <AlertCircle className="h-3.5 w-3.5" />
              {log.error_count} {log.error_count === 1 ? 'error' : 'errors'}
            </span>
          )}
        </button>
      </CollapsibleTrigger>

      <CollapsibleContent>
        <div className="px-11 pb-4 pt-1">
          {hasErrors ? (
            <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 space-y-1.5">
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
          ) : (
            <p className="text-sm text-muted-foreground italic">No errors recorded.</p>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

export function ImportHistory({ orgId }: ImportHistoryProps) {
  const [logs, setLogs] = useState<ImportLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full rounded-md" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <p className="text-sm text-destructive flex items-center gap-1.5">
        <AlertCircle className="h-4 w-4" />
        {error}
      </p>
    );
  }

  if (logs.length === 0) {
    return (
      <p className="text-sm text-muted-foreground italic">No imports yet.</p>
    );
  }

  return (
    <div className="divide-y rounded-md border">
      {logs.map((log) => (
        <ImportLogRow key={log.id} log={log} />
      ))}
    </div>
  );
}
