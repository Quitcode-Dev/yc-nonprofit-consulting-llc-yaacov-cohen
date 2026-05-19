'use client';

import { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';

interface SolicitorRow {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
  is_active: boolean;
  created_at: string;
  kind: 'solicitor';
}

interface InvitationRow {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
  created_at: string;
  kind: 'invitation';
}

type TableRow = SolicitorRow | InvitationRow;

function formatName(first: string | null, last: string | null): string {
  const parts = [first, last].filter(Boolean);
  return parts.length > 0 ? parts.join(' ') : '—';
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function UserManagementPage() {
  const [orgId, setOrgId] = useState<string | null>(null);
  const [rows, setRows] = useState<TableRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Invite dialog state
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteFirstName, setInviteFirstName] = useState('');
  const [inviteLastName, setInviteLastName] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);

  // Resolve orgId from the current user's profile
  useEffect(() => {
    async function resolveOrg() {
      try {
        const res = await fetch('/api/auth/me');
        if (!res.ok) throw new Error('Failed to load profile');
        const data = await res.json();
        setOrgId(data.organization_id ?? null);
      } catch {
        // Fallback: try to get org from the users list endpoint via profile
        setError('Could not determine your organization.');
        setLoading(false);
      }
    }
    resolveOrg();
  }, []);

  useEffect(() => {
    if (!orgId) return;

    async function fetchUsers() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/organizations/${orgId}/users`);
        if (!res.ok) {
          const body = await res.json();
          throw new Error(body.error ?? 'Failed to load users');
        }
        const data: {
          solicitors: Omit<SolicitorRow, 'kind'>[];
          invitations: Omit<InvitationRow, 'kind'>[];
        } = await res.json();

        const solicitorRows: SolicitorRow[] = (data.solicitors ?? []).map((s) => ({
          ...s,
          kind: 'solicitor',
        }));
        const invitationRows: InvitationRow[] = (data.invitations ?? []).map((i) => ({
          ...i,
          kind: 'invitation',
        }));

        // Sort by created_at descending
        const combined: TableRow[] = [...solicitorRows, ...invitationRows].sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        setRows(combined);
      } catch (err: unknown) {
        setError((err as Error).message ?? 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    fetchUsers();
  }, [orgId]);

  async function handleToggleActive(row: SolicitorRow) {
    if (!orgId) return;
    const newValue = !row.is_active;

    // Optimistic update
    setRows((prev) =>
      prev.map((r) =>
        r.kind === 'solicitor' && r.id === row.id ? { ...r, is_active: newValue } : r
      )
    );

    try {
      const res = await fetch(`/api/organizations/${orgId}/users/${row.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: newValue }),
      });
      if (!res.ok) {
        // Revert on failure
        setRows((prev) =>
          prev.map((r) =>
            r.kind === 'solicitor' && r.id === row.id ? { ...r, is_active: row.is_active } : r
          )
        );
      }
    } catch {
      // Revert on error
      setRows((prev) =>
        prev.map((r) =>
          r.kind === 'solicitor' && r.id === row.id ? { ...r, is_active: row.is_active } : r
        )
      );
    }
  }

  async function handleInviteSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!orgId) return;
    setInviteLoading(true);
    setInviteError(null);

    try {
      const res = await fetch('/api/invitations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: inviteEmail,
          first_name: inviteFirstName || undefined,
          last_name: inviteLastName || undefined,
          organization_id: orgId,
          role: 'solicitor',
        }),
      });

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error ?? 'Failed to send invitation');
      }

      const invitation = await res.json();

      // Add the new invitation row optimistically
      const newRow: InvitationRow = {
        id: invitation.id,
        email: inviteEmail,
        first_name: inviteFirstName || null,
        last_name: inviteLastName || null,
        created_at: invitation.created_at ?? new Date().toISOString(),
        kind: 'invitation',
      };
      setRows((prev) => [newRow, ...prev]);

      // Reset and close
      setInviteEmail('');
      setInviteFirstName('');
      setInviteLastName('');
      setInviteOpen(false);
    } catch (err: unknown) {
      setInviteError((err as Error).message ?? 'Unknown error');
    } finally {
      setInviteLoading(false);
    }
  }

  function getStatusBadge(row: TableRow) {
    if (row.kind === 'invitation') {
      return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Invited</Badge>;
    }
    if (row.is_active) {
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>;
    }
    return <Badge variant="destructive">Inactive</Badge>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">User Management</h1>
        <Button onClick={() => setInviteOpen(true)}>Invite Solicitor</Button>
      </div>

      {error && (
        <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">{error}</div>
      )}

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date Added</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  No solicitors yet.
                </TableCell>
              </TableRow>
            )}
            {rows.map((row) => (
              <TableRow key={row.id}>
                <TableCell>{formatName(row.first_name, row.last_name)}</TableCell>
                <TableCell>{row.email}</TableCell>
                <TableCell>{getStatusBadge(row)}</TableCell>
                <TableCell>{formatDate(row.created_at)}</TableCell>
                <TableCell>
                  {row.kind === 'solicitor' && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleToggleActive(row)}>
                          {row.is_active ? 'Deactivate' : 'Reactivate'}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Invite Dialog */}
      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Solicitor</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleInviteSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="invite-email">Email *</Label>
              <Input
                id="invite-email"
                type="email"
                required
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="solicitor@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="invite-first-name">First Name</Label>
              <Input
                id="invite-first-name"
                type="text"
                value={inviteFirstName}
                onChange={(e) => setInviteFirstName(e.target.value)}
                placeholder="Jane"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="invite-last-name">Last Name</Label>
              <Input
                id="invite-last-name"
                type="text"
                value={inviteLastName}
                onChange={(e) => setInviteLastName(e.target.value)}
                placeholder="Smith"
              />
            </div>
            {inviteError && (
              <p className="text-sm text-destructive">{inviteError}</p>
            )}
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setInviteOpen(false)}
                disabled={inviteLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={inviteLoading}>
                {inviteLoading ? 'Sending…' : 'Send Invitation'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
