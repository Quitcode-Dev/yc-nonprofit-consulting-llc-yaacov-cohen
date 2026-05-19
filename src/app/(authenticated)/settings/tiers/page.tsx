'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

interface TierRow {
  id: string; // local uuid for React key
  tier_name: string;
  min_score: string;
  max_score: string;
  moves_needed: string;
}

function makeEmptyTier(): TierRow {
  return {
    id: crypto.randomUUID(),
    tier_name: '',
    min_score: '',
    max_score: '',
    moves_needed: '',
  };
}

export default function TierConfigPage() {
  const router = useRouter();
  const [orgId, setOrgId] = useState<string | null>(null);
  const [tiers, setTiers] = useState<TierRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Fetch the current user's org id from /api/me or profile
  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch('/api/me');
        if (!res.ok) {
          router.push('/login');
          return;
        }
        const data = await res.json();
        if (!data.profile?.organization_id) {
          toast.error('No organization associated with your account.');
          return;
        }
        setOrgId(data.profile.organization_id);
      } catch {
        toast.error('Failed to load profile.');
      }
    }
    fetchProfile();
  }, [router]);

  const fetchTiers = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/organizations/${id}/tier-config`);
      if (!res.ok) {
        toast.error('Failed to load tier configuration.');
        return;
      }
      const data = await res.json();
      const rows: TierRow[] = (data.tiers ?? []).map(
        (t: { tier_name: string; min_score: number; max_score: number; moves_needed: number }) => ({
          id: crypto.randomUUID(),
          tier_name: t.tier_name,
          min_score: String(t.min_score),
          max_score: String(t.max_score),
          moves_needed: String(t.moves_needed),
        })
      );
      setTiers(rows);
    } catch {
      toast.error('Failed to load tier configuration.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (orgId) fetchTiers(orgId);
  }, [orgId, fetchTiers]);

  function updateTier(id: string, field: keyof Omit<TierRow, 'id'>, value: string) {
    setTiers((prev) => prev.map((t) => (t.id === id ? { ...t, [field]: value } : t)));
  }

  function addTier() {
    setTiers((prev) => [...prev, makeEmptyTier()]);
  }

  function deleteTier(id: string) {
    setTiers((prev) => prev.filter((t) => t.id !== id));
  }

  function validate(): boolean {
    for (let i = 0; i < tiers.length; i++) {
      const t = tiers[i];
      if (!t.tier_name.trim()) {
        toast.error(`Row ${i + 1}: Tier name is required.`);
        return false;
      }
      const min = Number(t.min_score);
      const max = Number(t.max_score);
      const moves = Number(t.moves_needed);

      if (!Number.isInteger(min) || min < 0) {
        toast.error(`"${t.tier_name}": Min score must be a non-negative integer.`);
        return false;
      }
      if (!Number.isInteger(max) || max < 0) {
        toast.error(`"${t.tier_name}": Max score must be a non-negative integer.`);
        return false;
      }
      if (!Number.isInteger(moves) || moves <= 0) {
        toast.error(`"${t.tier_name}": Moves needed must be a positive integer.`);
        return false;
      }
      if (min >= max) {
        toast.error(`"${t.tier_name}": Min score must be less than max score.`);
        return false;
      }
      if (t.min_score === '' || t.max_score === '' || t.moves_needed === '') {
        toast.error(`Row ${i + 1}: All fields are required.`);
        return false;
      }
    }

    // Check for overlapping ranges
    for (let i = 0; i < tiers.length; i++) {
      for (let j = i + 1; j < tiers.length; j++) {
        const a = tiers[i];
        const b = tiers[j];
        const aMin = Number(a.min_score);
        const aMax = Number(a.max_score);
        const bMin = Number(b.min_score);
        const bMax = Number(b.max_score);
        // Overlap if aMin < bMax && bMin < aMax
        if (aMin < bMax && bMin < aMax) {
          toast.error(`Tier ranges overlap between "${a.tier_name}" and "${b.tier_name}".`);
          return false;
        }
      }
    }

    return true;
  }

  async function handleSave() {
    if (!orgId) return;
    if (!validate()) return;

    setSaving(true);
    try {
      const payload = tiers.map((t) => ({
        tier_name: t.tier_name.trim(),
        min_score: Number(t.min_score),
        max_score: Number(t.max_score),
        moves_needed: Number(t.moves_needed),
      }));

      const putRes = await fetch(`/api/organizations/${orgId}/tier-config`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tiers: payload }),
      });

      if (!putRes.ok) {
        const err = await putRes.json();
        toast.error(err.error ?? 'Failed to save tier configuration.');
        return;
      }

      // Trigger score recalculation
      const recalcRes = await fetch(`/api/organizations/${orgId}/recalculate-scores`, {
        method: 'POST',
      });

      if (!recalcRes.ok) {
        toast.warning('Tiers saved, but score recalculation failed. Please recalculate manually.');
      } else {
        toast.success('Tier configuration saved and scores recalculated.');
      }

      await fetchTiers(orgId);
    } catch {
      toast.error('An unexpected error occurred.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">Tier Configuration</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Define donor tiers by score range and moves-needed thresholds.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tiers</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : (
            <div className="space-y-2">
              {/* Header row */}
              <div className="grid grid-cols-5 gap-2 px-1">
                <span className="text-xs font-medium text-muted-foreground">Tier Name</span>
                <span className="text-xs font-medium text-muted-foreground">Min Score</span>
                <span className="text-xs font-medium text-muted-foreground">Max Score</span>
                <span className="text-xs font-medium text-muted-foreground">Moves Needed</span>
                <span />
              </div>

              {tiers.length === 0 && (
                <p className="text-sm text-muted-foreground py-2">
                  No tiers configured. Click &quot;Add Tier&quot; to get started.
                </p>
              )}

              {tiers.map((tier) => (
                <div key={tier.id} className="grid grid-cols-5 gap-2 items-center">
                  <Input
                    placeholder="e.g. Gold"
                    value={tier.tier_name}
                    onChange={(e) => updateTier(tier.id, 'tier_name', e.target.value)}
                  />
                  <Input
                    type="number"
                    placeholder="0"
                    min={0}
                    value={tier.min_score}
                    onChange={(e) => updateTier(tier.id, 'min_score', e.target.value)}
                  />
                  <Input
                    type="number"
                    placeholder="100"
                    min={0}
                    value={tier.max_score}
                    onChange={(e) => updateTier(tier.id, 'max_score', e.target.value)}
                  />
                  <Input
                    type="number"
                    placeholder="3"
                    min={1}
                    value={tier.moves_needed}
                    onChange={(e) => updateTier(tier.id, 'moves_needed', e.target.value)}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteTier(tier.id)}
                    aria-label="Delete tier"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}

              <div className="pt-2">
                <Button variant="outline" onClick={addTier}>
                  + Add Tier
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving || loading}>
          {saving ? 'Saving…' : 'Save'}
        </Button>
      </div>
    </div>
  );
}
