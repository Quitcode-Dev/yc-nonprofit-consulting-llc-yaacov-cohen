'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { DataTable, DataTableColumn } from '@/components/ui/data-table';
import type { Donor, Move, ScoringConfig, TierConfig } from '@/lib/types';

// ── Local types ──────────────────────────────────────────────────────────────

interface SolicitorRef {
  id: string;
  first_name: string;
  last_name: string;
}

interface DonorWithSolicitor extends Donor {
  solicitor: SolicitorRef | null;
}

interface MoveWithSolicitor extends Move {
  solicitor: SolicitorRef | null;
}

interface TierConfigWithMoves extends TierConfig {
  moves_needed: number;
}

interface Donation {
  id: string;
  date: string;
  amount: number;
}

interface PageData {
  donor: DonorWithSolicitor;
  scoringConfigs: ScoringConfig[];
  tierConfigs: TierConfigWithMoves[];
  moves: MoveWithSolicitor[];
  donations: Donation[];
}

// ── Helpers ──────────────────────────────────────────────────────────────────

const BOOLEAN_FIELDS: { key: keyof Donor; label: string }[] = [
  { key: 'is_parent', label: 'Parent' },
  { key: 'is_grandparent', label: 'Grandparent' },
  { key: 'is_alumni', label: 'Alumni' },
  { key: 'is_board_member', label: 'Board Member' },
  { key: 'is_community_builder', label: 'Community Builder' },
  { key: 'is_program_attendee', label: 'Program Attendee' },
  { key: 'is_volunteer', label: 'Volunteer' },
  { key: 'is_donor_advised_fund', label: 'Donor Advised Fund' },
  { key: 'is_foundation_trustee', label: 'Foundation Trustee' },
];

function getMoveStatus(move: Move): 'Completed' | 'Overdue' | 'Pending' {
  if (move.status === 'completed') return 'Completed';
  if (new Date(move.due_date) < new Date()) return 'Overdue';
  return 'Pending';
}

function MoveStatusBadge({ move }: { move: Move }) {
  const status = getMoveStatus(move);
  const variant =
    status === 'Completed'
      ? 'default'
      : status === 'Overdue'
      ? 'destructive'
      : 'secondary';
  const className =
    status === 'Completed'
      ? 'bg-green-100 text-green-800 hover:bg-green-100'
      : status === 'Overdue'
      ? ''
      : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100';
  return (
    <Badge variant={variant} className={className}>
      {status}
    </Badge>
  );
}

// ── Page component ────────────────────────────────────────────────────────────

export default function DonorProfilePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [data, setData] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Local checkbox state (mirrors donor boolean fields)
  const [characteristics, setCharacteristics] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/donors/${id}`);
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? 'Failed to load donor');
      }
      const json: PageData = await res.json();
      setData(json);
      // Seed checkbox state from donor
      const initial: Record<string, boolean> = {};
      for (const { key } of BOOLEAN_FIELDS) {
        initial[key as string] = Boolean(json.donor[key]);
      }
      setCharacteristics(initial);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSave = async () => {
    if (!data) return;
    setSaving(true);
    setSaveError(null);
    try {
      const res = await fetch(`/api/donors/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(characteristics),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? 'Failed to save');
      }
      // Re-fetch to get updated score/tier
      await fetchData();
    } catch (e: unknown) {
      setSaveError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setSaving(false);
    }
  };

  // ── Render states ──────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <p className="text-muted-foreground">Loading donor profile…</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24">
        <p className="text-destructive">{error ?? 'Donor not found'}</p>
        <Button variant="outline" onClick={() => router.back()}>
          Go back
        </Button>
      </div>
    );
  }

  const { donor, scoringConfigs, tierConfigs, moves, donations } = data;

  // Current tier config (for moves_needed)
  const currentTierConfig = tierConfigs.find((t) => t.tier_name === donor.tier) ?? null;

  // Score breakdown: enabled configs where the donor's field is true
  const scoreBreakdown = scoringConfigs.filter(
    (c) => c.is_enabled && Boolean(donor[c.field_name as keyof Donor])
  );

  // Donation table columns
  const donationColumns: DataTableColumn<Donation>[] = useMemo(
    () => [
      {
        key: 'date',
        header: 'Date',
        cellClassName: 'text-muted-foreground',
        render: (d) => new Date(d.date).toLocaleDateString(),
      },
      {
        key: 'amount',
        header: 'Amount',
        cellClassName: 'font-medium text-right',
        headerClassName: 'text-right',
        render: (d) => `$${d.amount.toLocaleString()}`,
      },
    ],
    []
  );

  // Build move tree: top-level moves (no parent) and children
  const topLevelMoves = moves.filter((m) => !m.parent_move_id);
  const childMoves = moves.filter((m) => !!m.parent_move_id);

  // ── Layout ─────────────────────────────────────────────────────────────────

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          ← Back
        </Button>
        <h1 className="text-2xl font-bold">
          {donor.first_name} {donor.last_name}
        </h1>
        {donor.tier && <Badge variant="secondary">{donor.tier}</Badge>}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* ── Left column (col-span-2) ──────────────────────────────────── */}
        <div className="col-span-2 flex flex-col gap-6">
          {/* Donor Info Card */}
          <Card>
            <CardHeader>
              <CardTitle>Donor Information</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                <div>
                  <dt className="font-medium text-muted-foreground">First Name</dt>
                  <dd>{donor.first_name}</dd>
                </div>
                <div>
                  <dt className="font-medium text-muted-foreground">Last Name</dt>
                  <dd>{donor.last_name}</dd>
                </div>
                <div>
                  <dt className="font-medium text-muted-foreground">Email</dt>
                  <dd>{donor.email ?? <span className="text-muted-foreground">—</span>}</dd>
                </div>
                <div>
                  <dt className="font-medium text-muted-foreground">Phone</dt>
                  <dd>{donor.phone ?? <span className="text-muted-foreground">—</span>}</dd>
                </div>
                <div>
                  <dt className="font-medium text-muted-foreground">Capacity</dt>
                  <dd>
                    {donor.capacity != null
                      ? `$${donor.capacity.toLocaleString()}`
                      : <span className="text-muted-foreground">—</span>}
                  </dd>
                </div>
                <div>
                  <dt className="font-medium text-muted-foreground">Assigned Solicitor</dt>
                  <dd>
                    {donor.solicitor
                      ? `${donor.solicitor.first_name} ${donor.solicitor.last_name}`
                      : <span className="text-muted-foreground">Unassigned</span>}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          {/* Characteristics Card */}
          <Card>
            <CardHeader>
              <CardTitle>Characteristics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {BOOLEAN_FIELDS.map(({ key, label }) => (
                  <div key={key as string} className="flex items-center gap-2">
                    <Checkbox
                      id={key as string}
                      checked={!!characteristics[key as string]}
                      onCheckedChange={(checked) =>
                        setCharacteristics((prev) => ({
                          ...prev,
                          [key as string]: checked === true,
                        }))
                      }
                    />
                    <Label htmlFor={key as string} className="cursor-pointer text-sm">
                      {label}
                    </Label>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-center gap-3">
                <Button onClick={handleSave} disabled={saving} size="sm">
                  {saving ? 'Saving…' : 'Save Changes'}
                </Button>
                {saveError && (
                  <p className="text-sm text-destructive">{saveError}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Move History */}
          <Card>
            <CardHeader>
              <CardTitle>Move History</CardTitle>
            </CardHeader>
            <CardContent>
              {topLevelMoves.length === 0 ? (
                <p className="text-sm text-muted-foreground">No moves yet</p>
              ) : (
                <ul className="space-y-3">
                  {topLevelMoves.map((move) => {
                    const children = childMoves.filter(
                      (c) => c.parent_move_id === move.id
                    );
                    return (
                      <li key={move.id}>
                        <MoveRow move={move} />
                        {children.length > 0 && (
                          <ul className="ml-6 mt-2 space-y-2 border-l pl-4">
                            {children.map((child) => (
                              <li key={child.id}>
                                <MoveRow move={child} />
                              </li>
                            ))}
                          </ul>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ── Right column (col-span-1) ─────────────────────────────────── */}
        <div className="flex flex-col gap-6">
          {/* Score Card */}
          <Card>
            <CardHeader>
              <CardTitle>Score</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-3 py-4">
              <span className="text-6xl font-bold">{donor.score}</span>
              {donor.tier ? (
                <Badge variant="secondary" className="text-base px-3 py-1">
                  {donor.tier}
                </Badge>
              ) : (
                <span className="text-sm text-muted-foreground">No tier assigned</span>
              )}
              {currentTierConfig && (
                <p className="text-sm text-muted-foreground">
                  Moves needed:{' '}
                  <span className="font-medium text-foreground">
                    {currentTierConfig.moves_needed}
                  </span>
                </p>
              )}
            </CardContent>
          </Card>

          {/* Score Breakdown Card */}
          <Card>
            <CardHeader>
              <CardTitle>Score Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              {scoreBreakdown.length === 0 ? (
                <p className="text-sm text-muted-foreground">No scored characteristics</p>
              ) : (
                <ul className="space-y-2">
                  {scoreBreakdown.map((c) => (
                    <li
                      key={c.field_name}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="capitalize">
                        {c.field_name.replace(/^is_/, '').replace(/_/g, ' ')}
                      </span>
                      <span className="font-medium text-green-600">
                        +{c.point_value} pts
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          {/* Donation History */}
          <Card>
            <CardHeader>
              <CardTitle>Donation History</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <DataTable<Donation>
                columns={donationColumns}
                data={donations}
                loading={false}
                emptyMessage="No donations recorded"
                rowKey={(d) => d.id}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ── Sub-component ─────────────────────────────────────────────────────────────

function MoveRow({ move }: { move: MoveWithSolicitor }) {
  return (
    <div className="flex flex-col gap-1 rounded-md border p-3 text-sm">
      <div className="flex items-center justify-between gap-2">
        <span className="font-medium">{move.title}</span>
        <MoveStatusBadge move={move} />
      </div>
      <div className="flex gap-4 text-muted-foreground">
        {move.solicitor && (
          <span>
            {move.solicitor.first_name} {move.solicitor.last_name}
          </span>
        )}
        <span>Due {new Date(move.due_date).toLocaleDateString()}</span>
      </div>
    </div>
  );
}
