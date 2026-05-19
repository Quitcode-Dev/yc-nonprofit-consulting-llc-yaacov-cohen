'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';
import { CompleteMoveDialog } from './CompleteMoveDialog';

// ── Types ────────────────────────────────────────────────────────────────────

interface DonorRef {
  id: string;
  first_name: string | null;
  last_name: string | null;
}

interface ProfileRef {
  id: string;
  first_name: string | null;
  last_name: string | null;
}

interface Move {
  id: string;
  title: string;
  due_date: string;
  status: 'pending' | 'completed';
  donor_id: string;
  solicitor_id: string;
  donors: DonorRef | null;
  profiles: ProfileRef | null;
}

type StatusFilter = 'all' | 'pending' | 'completed';
type SortDir = 'asc' | 'desc';

// ── Helpers ──────────────────────────────────────────────────────────────────

function isOverdue(move: Move): boolean {
  if (move.status !== 'pending') return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(move.due_date) < today;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function donorName(donor: DonorRef | null): string {
  if (!donor) return '—';
  return [donor.first_name, donor.last_name].filter(Boolean).join(' ') || '—';
}

function solicitorName(profile: ProfileRef | null): string {
  if (!profile) return '—';
  return [profile.first_name, profile.last_name].filter(Boolean).join(' ') || '—';
}

// ── Component ────────────────────────────────────────────────────────────────

export default function MovesListPage() {
  const [moves, setMoves] = useState<Move[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [solicitorFilter, setSolicitorFilter] = useState<string>('all');

  // Dialog state
  const [dialogMove, setDialogMove] = useState<Move | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Role / user info derived from first fetch
  const [isAdmin, setIsAdmin] = useState(false);
  const [solicitors, setSolicitors] = useState<ProfileRef[]>([]);

  const fetchMoves = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set('status', statusFilter);
      params.set('sort', `due_date_${sortDir}`);
      if (isAdmin && solicitorFilter !== 'all') {
        params.set('solicitor_id', solicitorFilter);
      }

      const res = await fetch(`/api/moves?${params.toString()}`);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? 'Failed to load moves');
      }
      const data = await res.json();
      const fetchedMoves: Move[] = data.moves ?? [];
      setMoves(fetchedMoves);

      // Derive admin status: if we see moves with different solicitor_ids we're admin.
      // More reliably, check if profiles are returned for others — but we'll use a
      // lightweight heuristic: if any move has a profiles object, we may be admin.
      // We'll rely on the presence of multiple distinct solicitor_ids.
      const uniqueSolicitors = new Map<string, ProfileRef>();
      fetchedMoves.forEach((m) => {
        if (m.profiles && !uniqueSolicitors.has(m.solicitor_id)) {
          uniqueSolicitors.set(m.solicitor_id, m.profiles);
        }
      });
      if (uniqueSolicitors.size > 1) {
        setIsAdmin(true);
        setSolicitors(Array.from(uniqueSolicitors.values()));
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, sortDir, solicitorFilter, isAdmin]);

  // Initial fetch to detect admin role
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/moves?status=all&sort=due_date_asc');
        if (!res.ok) return;
        const data = await res.json();
        const fetchedMoves: Move[] = data.moves ?? [];

        const uniqueSolicitors = new Map<string, ProfileRef>();
        fetchedMoves.forEach((m) => {
          if (m.profiles && !uniqueSolicitors.has(m.solicitor_id)) {
            uniqueSolicitors.set(m.solicitor_id, m.profiles);
          }
        });
        const adminDetected = uniqueSolicitors.size > 1;
        setIsAdmin(adminDetected);
        if (adminDetected) {
          setSolicitors(Array.from(uniqueSolicitors.values()));
        }
        setMoves(fetchedMoves);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Re-fetch when filters change (skip the very first render handled above)
  const [initialized, setInitialized] = useState(false);
  useEffect(() => {
    if (!initialized) {
      setInitialized(true);
      return;
    }
    fetchMoves();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, sortDir, solicitorFilter]);

  function toggleSort() {
    setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
  }

  function handleRowClick(move: Move) {
    if (move.status === 'pending') {
      setDialogMove(move);
      setDialogOpen(true);
    }
  }

  const emptyMessage =
    statusFilter === 'pending'
      ? 'No pending moves'
      : statusFilter === 'completed'
      ? 'No completed moves'
      : 'No moves found';

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Moves</h1>
        <Button asChild>
          <Link href="/moves/new">Create Move</Link>
        </Button>
      </div>

      {/* Filters row */}
      <div className="flex flex-wrap items-center gap-4">
        <Tabs
          value={statusFilter}
          onValueChange={(v) => setStatusFilter(v as StatusFilter)}
        >
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>
        </Tabs>

        {isAdmin && solicitors.length > 0 && (
          <Select value={solicitorFilter} onValueChange={setSolicitorFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All Solicitors" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Solicitors</SelectItem>
              {solicitors.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {solicitorName(s)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Error */}
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      {/* Table */}
      {loading ? (
        <p className="text-sm text-muted-foreground">Loading moves…</p>
      ) : moves.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <p className="text-muted-foreground">{emptyMessage}</p>
          {statusFilter !== 'completed' && (
            <Button asChild>
              <Link href="/moves/new">Create Move</Link>
            </Button>
          )}
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Donor</TableHead>
                {isAdmin && <TableHead>Solicitor</TableHead>}
                <TableHead>
                  <button
                    onClick={toggleSort}
                    className="flex items-center gap-1 hover:text-foreground transition-colors"
                  >
                    Due Date
                    {sortDir === 'asc' ? (
                      <ArrowUp className="h-3 w-3" />
                    ) : sortDir === 'desc' ? (
                      <ArrowDown className="h-3 w-3" />
                    ) : (
                      <ArrowUpDown className="h-3 w-3" />
                    )}
                  </button>
                </TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {moves.map((move) => {
                const overdue = isOverdue(move);
                return (
                  <TableRow
                    key={move.id}
                    className={`cursor-pointer hover:bg-muted/50 ${
                      overdue ? 'bg-red-50 hover:bg-red-100' : ''
                    }`}
                    onClick={() => handleRowClick(move)}
                  >
                    <TableCell className="font-medium">{move.title}</TableCell>
                    <TableCell>{donorName(move.donors)}</TableCell>
                    {isAdmin && (
                      <TableCell>{solicitorName(move.profiles)}</TableCell>
                    )}
                    <TableCell
                      className={overdue ? 'text-red-600 font-medium' : ''}
                    >
                      {formatDate(move.due_date)}
                    </TableCell>
                    <TableCell>
                      {overdue ? (
                        <Badge variant="destructive">Overdue</Badge>
                      ) : move.status === 'completed' ? (
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                          Completed
                        </Badge>
                      ) : (
                        <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                          Pending
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Complete Move Dialog */}
      <CompleteMoveDialog
        move={dialogMove}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onCompleted={fetchMoves}
      />
    </div>
  );
}
