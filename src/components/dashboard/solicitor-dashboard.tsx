'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isToday, isBefore, startOfDay, parseISO } from 'date-fns';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CompleteMoveDialog } from '@/components/moves/complete-move-dialog';
import type { Donor, Move } from '@/lib/types';

interface DashboardData {
  donors: Donor[];
  pending_moves: Move[];
  overdue_moves: Move[];
}

const TIER_VARIANT: Record<string, 'default' | 'secondary' | 'outline'> = {
  platinum: 'default',
  gold: 'default',
  silver: 'secondary',
  bronze: 'outline',
};

function tierVariant(tier: string | null): 'default' | 'secondary' | 'outline' {
  if (!tier) return 'outline';
  return TIER_VARIANT[tier.toLowerCase()] ?? 'outline';
}

export function SolicitorDashboard() {
  const router = useRouter();

  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // CompleteMoveDialog state
  const [selectedMove, setSelectedMove] = useState<Move | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/dashboard/solicitor');
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.error ?? 'Failed to load dashboard.');
        return;
      }
      const json: DashboardData = await res.json();
      setData(json);
    } catch {
      setError('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleMoveClick = (move: Move) => {
    setSelectedMove(move);
    setDialogOpen(true);
  };

  const handleMoveComplete = () => {
    setDialogOpen(false);
    setSelectedMove(null);
    fetchData();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-muted-foreground text-sm">
        Loading dashboard…
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md bg-destructive/10 border border-destructive/30 px-4 py-3 text-sm text-destructive">
        {error}
      </div>
    );
  }

  if (!data) return null;

  const allMoves = [...data.overdue_moves, ...data.pending_moves];
  const overdueCount = data.overdue_moves.length;

  return (
    <>
      {/* ── Stats row ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Assigned Donors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{data.donors.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending Moves
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{allMoves.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Overdue Moves
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p
              className={
                overdueCount > 0
                  ? 'text-3xl font-bold text-destructive'
                  : 'text-3xl font-bold'
              }
            >
              {overdueCount}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ── Main grid ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Left: My Donors (col-span-2) ─────────────────────────────── */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>My Donors</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {data.donors.length === 0 ? (
                <p className="px-6 py-8 text-sm text-muted-foreground text-center">
                  No donors assigned yet.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/40">
                        <th className="px-6 py-3 text-left font-medium text-muted-foreground">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left font-medium text-muted-foreground">
                          Score
                        </th>
                        <th className="px-6 py-3 text-left font-medium text-muted-foreground">
                          Tier
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.donors.map((donor) => (
                        <tr
                          key={donor.id}
                          className="border-b last:border-0 hover:bg-muted/30 cursor-pointer transition-colors"
                          onClick={() => router.push(`/donors/${donor.id}`)}
                        >
                          <td className="px-6 py-3 font-medium">
                            {donor.first_name} {donor.last_name}
                          </td>
                          <td className="px-6 py-3 text-muted-foreground">
                            {donor.score}
                          </td>
                          <td className="px-6 py-3">
                            {donor.tier ? (
                              <Badge variant={tierVariant(donor.tier)}>
                                {donor.tier}
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ── Right: Pending Moves (col-span-1) ────────────────────────── */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Pending Moves</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {allMoves.length === 0 ? (
                <p className="px-6 py-8 text-sm text-muted-foreground text-center">
                  No pending moves.
                </p>
              ) : (
                <ul className="divide-y">
                  {allMoves.map((move) => {
                    const dueDate = parseISO(move.due_date);
                    const overdue = isBefore(startOfDay(dueDate), startOfDay(new Date()));
                    const dueToday = isToday(dueDate);

                    return (
                      <li
                        key={move.id}
                        className="px-6 py-4 hover:bg-muted/30 cursor-pointer transition-colors"
                        onClick={() => handleMoveClick(move)}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p
                              className={
                                overdue
                                  ? 'font-medium text-destructive truncate'
                                  : 'font-medium truncate'
                              }
                            >
                              {move.title}
                            </p>
                            {move.donor_name && (
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {move.donor_name}
                              </p>
                            )}
                            <p
                              className={
                                overdue
                                  ? 'text-xs text-destructive mt-0.5'
                                  : 'text-xs text-muted-foreground mt-0.5'
                              }
                            >
                              Due {move.due_date}
                            </p>
                          </div>
                          <div className="shrink-0">
                            {overdue && (
                              <Badge variant="destructive" className="text-xs">
                                ⚠ Overdue
                              </Badge>
                            )}
                            {!overdue && dueToday && (
                              <Badge
                                variant="outline"
                                className="text-xs border-amber-400 text-amber-600 bg-amber-50"
                              >
                                Due Today
                              </Badge>
                            )}
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ── CompleteMoveDialog ────────────────────────────────────────────── */}
      {selectedMove && (
        <CompleteMoveDialog
          move={selectedMove}
          open={dialogOpen}
          onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) setSelectedMove(null);
          }}
          onComplete={handleMoveComplete}
        />
      )}
    </>
  );
}
