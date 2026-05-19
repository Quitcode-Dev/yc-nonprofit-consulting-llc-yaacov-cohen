'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ScoringConfigRow {
  field_name: string;
  is_enabled: boolean;
  point_value: number;
}

interface FieldState extends ScoringConfigRow {
  error: string | null;
}

const FIELD_LABELS: { field_name: string; label: string }[] = [
  { field_name: 'is_parent', label: 'Parent' },
  { field_name: 'is_grandparent', label: 'Grandparent' },
  { field_name: 'is_alumni', label: 'Alumni' },
  { field_name: 'is_board_member', label: 'Board Member' },
  { field_name: 'is_community_builder', label: 'Community Builder' },
  { field_name: 'is_program_attendee', label: 'Program Attendee' },
  { field_name: 'is_volunteer', label: 'Volunteer' },
  { field_name: 'is_donor_advised_fund', label: 'Donor Advised Fund' },
  { field_name: 'is_foundation_trustee', label: 'Foundation/Trustee' },
];

const DEFAULT_POINT_VALUE = 1;

function buildDefaultFields(serverRows: ScoringConfigRow[]): FieldState[] {
  return FIELD_LABELS.map(({ field_name }) => {
    const existing = serverRows.find((r) => r.field_name === field_name);
    return {
      field_name,
      is_enabled: existing?.is_enabled ?? false,
      point_value: existing?.point_value ?? DEFAULT_POINT_VALUE,
      error: null,
    };
  });
}

export default function ScoringConfigPage() {
  const [orgId, setOrgId] = useState<string | null>(null);
  const [fields, setFields] = useState<FieldState[]>(
    buildDefaultFields([])
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Resolve orgId from current user profile
  useEffect(() => {
    async function resolveOrg() {
      try {
        const res = await fetch('/api/auth/me');
        if (!res.ok) throw new Error('Failed to load profile');
        const data = await res.json();
        setOrgId(data.organization_id ?? null);
      } catch {
        setFetchError('Could not determine your organization.');
        setLoading(false);
      }
    }
    resolveOrg();
  }, []);

  // Fetch scoring config once orgId is known
  useEffect(() => {
    if (!orgId) return;

    async function fetchConfig() {
      setLoading(true);
      setFetchError(null);
      try {
        const res = await fetch(`/api/organizations/${orgId}/scoring-config`);
        if (!res.ok) {
          const body = await res.json();
          throw new Error(body.error ?? 'Failed to load scoring config');
        }
        const data: ScoringConfigRow[] = await res.json();
        setFields(buildDefaultFields(data));
      } catch (err: unknown) {
        setFetchError((err as Error).message ?? 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    fetchConfig();
  }, [orgId]);

  function handleToggle(fieldName: string, enabled: boolean) {
    setFields((prev) =>
      prev.map((f) =>
        f.field_name === fieldName ? { ...f, is_enabled: enabled, error: null } : f
      )
    );
    setSaveSuccess(false);
  }

  function handlePointValueChange(fieldName: string, raw: string) {
    const parsed = parseInt(raw, 10);
    const isValid = !isNaN(parsed) && parsed >= 1 && Number.isInteger(parsed);
    setFields((prev) =>
      prev.map((f) =>
        f.field_name === fieldName
          ? {
              ...f,
              point_value: isValid ? parsed : (isNaN(parsed) ? f.point_value : parsed),
              error: isValid ? null : 'Must be a positive integer',
            }
          : f
      )
    );
    setSaveSuccess(false);
  }

  function validate(): boolean {
    let valid = true;
    setFields((prev) =>
      prev.map((f) => {
        if (!Number.isInteger(f.point_value) || f.point_value < 1) {
          valid = false;
          return { ...f, error: 'Must be a positive integer' };
        }
        return { ...f, error: null };
      })
    );
    return valid;
  }

  async function handleSave() {
    if (!orgId) return;
    if (!validate()) return;

    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      const payload = fields.map(({ field_name, is_enabled, point_value }) => ({
        field_name,
        is_enabled,
        point_value,
      }));

      const saveRes = await fetch(`/api/organizations/${orgId}/scoring-config`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!saveRes.ok) {
        const body = await saveRes.json();
        throw new Error(body.error ?? 'Failed to save scoring config');
      }

      // Trigger score recalculation
      const recalcRes = await fetch(`/api/organizations/${orgId}/recalculate-scores`, {
        method: 'POST',
      });

      if (!recalcRes.ok) {
        const body = await recalcRes.json();
        throw new Error(body.error ?? 'Failed to recalculate scores');
      }

      setSaveSuccess(true);
    } catch (err: unknown) {
      setSaveError((err as Error).message ?? 'Unknown error');
    } finally {
      setSaving(false);
    }
  }

  const hasErrors = fields.some((f) => f.error !== null);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Scoring Configuration</h1>
      </div>

      {fetchError && (
        <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
          {fetchError}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">Donor Attribute Points</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="px-6">
              {fields.map(({ field_name, is_enabled, point_value, error }, index) => {
                const label =
                  FIELD_LABELS.find((f) => f.field_name === field_name)?.label ?? field_name;
                const isLast = index === fields.length - 1;

                return (
                  <div
                    key={field_name}
                    className={`flex items-center justify-between gap-4 py-3 ${
                      !isLast ? 'border-b' : ''
                    }`}
                  >
                    {/* Label + toggle */}
                    <div className="flex items-center gap-3 min-w-0">
                      <Switch
                        id={`switch-${field_name}`}
                        checked={is_enabled}
                        onCheckedChange={(checked) => handleToggle(field_name, checked)}
                      />
                      <Label
                        htmlFor={`switch-${field_name}`}
                        className="cursor-pointer select-none"
                      >
                        {label}
                      </Label>
                    </div>

                    {/* Point value input */}
                    <div className="flex flex-col items-end gap-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground whitespace-nowrap">
                          Points:
                        </span>
                        <Input
                          type="number"
                          min={1}
                          value={point_value}
                          onChange={(e) => handlePointValueChange(field_name, e.target.value)}
                          disabled={!is_enabled}
                          className={`w-20 text-right ${!is_enabled ? 'opacity-50' : ''}`}
                          aria-label={`Point value for ${label}`}
                        />
                      </div>
                      {error && (
                        <p className="text-xs text-destructive">{error}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="px-6 py-4 border-t flex items-center justify-between gap-4">
              <div>
                {saveError && (
                  <p className="text-sm text-destructive">{saveError}</p>
                )}
                {saveSuccess && (
                  <p className="text-sm text-green-600">
                    Configuration saved and scores recalculated.
                  </p>
                )}
              </div>
              <Button onClick={handleSave} disabled={saving || hasErrors}>
                {saving ? 'Saving…' : 'Save Configuration'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
