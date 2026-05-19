'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, XCircle, Loader2, FileUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

type ConnectionStatus = 'connected' | 'invalid_key' | 'connection_failed' | 'unknown' | 'loading';

interface BloomerangStatus {
  has_key: boolean;
  last_synced_at: string | null;
  last_sync_status: 'success' | 'failed' | null;
  synced_record_count: number;
  key_suffix: string | null;
}

function formatDate(iso: string | null): string {
  if (!iso) return 'Never';
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(iso));
}

function ConnectionBadge({ status }: { status: ConnectionStatus }) {
  if (status === 'loading') {
    return (
      <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Checking…
      </span>
    );
  }
  if (status === 'connected') {
    return (
      <span className="flex items-center gap-1.5 text-sm text-green-600 font-medium">
        <CheckCircle2 className="h-4 w-4" />
        Connected
      </span>
    );
  }
  if (status === 'invalid_key') {
    return (
      <span className="flex items-center gap-1.5 text-sm text-destructive font-medium">
        <XCircle className="h-4 w-4" />
        Invalid API key
      </span>
    );
  }
  if (status === 'connection_failed') {
    return (
      <span className="flex items-center gap-1.5 text-sm text-destructive font-medium">
        <XCircle className="h-4 w-4" />
        Connection failed
      </span>
    );
  }
  return null;
}

export default function IntegrationsSettingsPage() {
  const router = useRouter();
  const [orgId, setOrgId] = useState<string | null>(null);

  // Bloomerang state
  const [apiKey, setApiKey] = useState('');
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('unknown');
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [bloomerangStatus, setBloomerangStatus] = useState<BloomerangStatus | null>(null);
  const [statusLoading, setStatusLoading] = useState(true);

  // ── Fetch profile ──────────────────────────────────────────────────────────
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

  // ── Fetch Bloomerang status ────────────────────────────────────────────────
  const fetchStatus = useCallback(async (id: string) => {
    setStatusLoading(true);
    try {
      const res = await fetch(`/api/organizations/${id}/bloomerang`);
      if (!res.ok) {
        setStatusLoading(false);
        return;
      }
      const data: BloomerangStatus = await res.json();
      setBloomerangStatus(data);
      if (data.has_key) {
        setConnectionStatus('connected');
      }
    } catch {
      // silently ignore — status stays 'unknown'
    } finally {
      setStatusLoading(false);
    }
  }, []);

  useEffect(() => {
    if (orgId) fetchStatus(orgId);
  }, [orgId, fetchStatus]);

  // ── Save / validate key ────────────────────────────────────────────────────
  async function handleSave() {
    if (!orgId || !apiKey.trim()) return;
    setSaving(true);
    setConnectionStatus('loading');
    try {
      const res = await fetch(`/api/organizations/${orgId}/bloomerang`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ api_key: apiKey }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? 'Failed to save API key.');
        setConnectionStatus('unknown');
        return;
      }

      const status: ConnectionStatus = data.status ?? 'unknown';
      setConnectionStatus(status);

      if (status === 'connected') {
        toast.success('Bloomerang API key validated and saved.');
        setApiKey(''); // clear input; masked value shown from status
        await fetchStatus(orgId);
      } else if (status === 'invalid_key') {
        toast.error('Invalid API key. Please check and try again.');
      } else {
        toast.error('Could not reach Bloomerang. Please try again later.');
      }
    } catch {
      toast.error('An unexpected error occurred.');
      setConnectionStatus('unknown');
    } finally {
      setSaving(false);
    }
  }

  // ── Sync Now ───────────────────────────────────────────────────────────────
  async function handleSyncNow() {
    if (!orgId) return;
    setSyncing(true);
    try {
      const res = await fetch(`/api/organizations/${orgId}/bloomerang/sync`, {
        method: 'POST',
      });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error ?? 'Sync failed.');
      } else {
        toast.success('Sync started successfully.');
        await fetchStatus(orgId);
      }
    } catch {
      toast.error('An unexpected error occurred during sync.');
    } finally {
      setSyncing(false);
    }
  }

  // ── Derived display values ─────────────────────────────────────────────────
  const maskedKey =
    bloomerangStatus?.has_key && bloomerangStatus.key_suffix
      ? `••••••••${bloomerangStatus.key_suffix}`
      : null;

  const canSync = connectionStatus === 'connected' && !syncing;

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">Integrations</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Connect third-party services and manage data imports.
        </p>
      </div>

      {/* ── Bloomerang ─────────────────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle>Bloomerang CRM</CardTitle>
          <CardDescription>
            Connect your Bloomerang account to sync constituent data automatically.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* API Key input */}
          <div className="space-y-2">
            <Label htmlFor="api-key">API Key</Label>
            <div className="flex gap-2">
              <Input
                id="api-key"
                type="password"
                placeholder={maskedKey ?? 'Enter your Bloomerang API key'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="max-w-sm font-mono"
                autoComplete="off"
              />
              <Button
                onClick={handleSave}
                disabled={saving || !apiKey.trim()}
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Validating…
                  </>
                ) : (
                  'Save & Validate'
                )}
              </Button>
            </div>

            {/* Connection status badge */}
            {!statusLoading && connectionStatus !== 'unknown' && (
              <div className="pt-1">
                <ConnectionBadge status={connectionStatus} />
              </div>
            )}
            {statusLoading && (
              <div className="pt-1">
                <ConnectionBadge status="loading" />
              </div>
            )}
          </div>

          <Separator />

          {/* Sync status */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium">Sync Status</p>
                <p className="text-sm text-muted-foreground">
                  Last synced:{' '}
                  <span className="font-medium text-foreground">
                    {statusLoading ? '…' : formatDate(bloomerangStatus?.last_synced_at ?? null)}
                  </span>
                </p>
                <p className="text-sm text-muted-foreground">
                  Records synced:{' '}
                  <span className="font-medium text-foreground">
                    {statusLoading ? '…' : (bloomerangStatus?.synced_record_count ?? 0).toLocaleString()}
                  </span>
                </p>
                {bloomerangStatus?.last_sync_status === 'failed' && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <XCircle className="h-3.5 w-3.5" />
                    Last sync failed
                  </p>
                )}
              </div>

              <Button
                variant="outline"
                onClick={handleSyncNow}
                disabled={!canSync}
              >
                {syncing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Syncing…
                  </>
                ) : (
                  'Sync Now'
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── CSV Import ─────────────────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle>CSV Import</CardTitle>
          <CardDescription>
            Manually import donor records from a CSV file.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <FileUp className="h-8 w-8 text-muted-foreground" />
            <div className="space-y-1">
              <p className="text-sm font-medium">Upload a CSV file</p>
              <p className="text-sm text-muted-foreground">
                CSV import is available from the Donors section. Navigate to{' '}
                <span className="font-medium">Donors → Import</span> to upload a file.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
