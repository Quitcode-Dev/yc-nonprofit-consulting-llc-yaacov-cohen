'use client';

import { useEffect, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

// ── Types ─────────────────────────────────────────────────────────────────────
interface MoveIdea {
  id: string;
  title: string;
  category: string;
  organization_id: string | null;
  is_global: boolean;
  created_at: string;
}

interface CurrentUser {
  role: 'super_admin' | 'org_admin' | 'solicitor';
  organization_id: string | null;
}

// ── Zod schema ────────────────────────────────────────────────────────────────
const moveIdeaSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(150, 'Title must be 150 characters or fewer'),
  category: z.string().min(1, 'Category is required'),
});

type MoveIdeaFormValues = z.infer<typeof moveIdeaSchema>;

// ── Page component ────────────────────────────────────────────────────────────
export default function MoveIdeasLibraryPage() {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [moveIdeas, setMoveIdeas] = useState<MoveIdea[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingIdea, setEditingIdea] = useState<MoveIdea | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Delete confirmation state
  const [deleteTarget, setDeleteTarget] = useState<MoveIdea | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<MoveIdeaFormValues>({
    resolver: zodResolver(moveIdeaSchema),
    defaultValues: { title: '', category: '' },
  });

  // ── Fetch current user profile ──────────────────────────────────────────────
  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch('/api/auth/profile');
        if (res.ok) {
          const data = await res.json();
          setCurrentUser({
            role: data.profile?.role,
            organization_id: data.profile?.organization_id ?? null,
          });
        }
      } catch {
        // non-fatal
      }
    }
    fetchProfile();
  }, []);

  // ── Fetch move ideas ────────────────────────────────────────────────────────
  const fetchMoveIdeas = useCallback(async (user: CurrentUser) => {
    setLoading(true);
    setFetchError(null);
    try {
      const params = new URLSearchParams();
      if (user.organization_id) {
        params.set('org_id', user.organization_id);
      }
      const res = await fetch(`/api/move-ideas?${params.toString()}`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setFetchError(data.error ?? 'Failed to load move ideas.');
        return;
      }
      const data = await res.json();
      setMoveIdeas(data.moveIdeas ?? []);
    } catch {
      setFetchError('Failed to load move ideas.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (currentUser) {
      fetchMoveIdeas(currentUser);
    }
  }, [currentUser, fetchMoveIdeas]);

  // ── Open create dialog ──────────────────────────────────────────────────────
  function openCreateDialog() {
    setEditingIdea(null);
    setSubmitError(null);
    reset({ title: '', category: '' });
    setDialogOpen(true);
  }

  // ── Open edit dialog ────────────────────────────────────────────────────────
  function openEditDialog(idea: MoveIdea) {
    setEditingIdea(idea);
    setSubmitError(null);
    reset({ title: idea.title, category: idea.category });
    setDialogOpen(true);
  }

  // ── Submit create / edit ────────────────────────────────────────────────────
  const onSubmit = async (values: MoveIdeaFormValues) => {
    setSubmitError(null);

    const url = editingIdea ? `/api/move-ideas/${editingIdea.id}` : '/api/move-ideas';
    const method = editingIdea ? 'PATCH' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setSubmitError(data.error ?? 'Something went wrong. Please try again.');
      return;
    }

    setDialogOpen(false);
    if (currentUser) {
      await fetchMoveIdeas(currentUser);
    }
  };

  // ── Delete ──────────────────────────────────────────────────────────────────
  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleteError(null);

    const res = await fetch(`/api/move-ideas/${deleteTarget.id}`, { method: 'DELETE' });

    if (!res.ok && res.status !== 204) {
      const data = await res.json().catch(() => ({}));
      setDeleteError(data.error ?? 'Failed to delete move idea.');
      return;
    }

    setDeleteTarget(null);
    if (currentUser) {
      await fetchMoveIdeas(currentUser);
    }
  }

  // ── Helpers ─────────────────────────────────────────────────────────────────
  function canEdit(idea: MoveIdea): boolean {
    if (!currentUser) return false;
    if (currentUser.role === 'super_admin') return true;
    if (currentUser.role === 'org_admin') return !idea.is_global;
    return false;
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Move Ideas Library</h1>
        {currentUser && (currentUser.role === 'super_admin' || currentUser.role === 'org_admin') && (
          <Button onClick={openCreateDialog}>+ Create Move Idea</Button>
        )}
      </div>

      {fetchError && (
        <p className="mb-4 text-sm text-destructive">{fetchError}</p>
      )}

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Source</TableHead>
                <TableHead className="w-[120px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {moveIdeas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    No move ideas found.
                  </TableCell>
                </TableRow>
              ) : (
                moveIdeas.map((idea) => (
                  <TableRow key={idea.id}>
                    <TableCell className="font-medium">{idea.title}</TableCell>
                    <TableCell>{idea.category}</TableCell>
                    <TableCell>
                      {idea.is_global ? (
                        <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">
                          Global
                        </Badge>
                      ) : (
                        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                          Custom
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {canEdit(idea) ? (
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog(idea)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              setDeleteError(null);
                              setDeleteTarget(idea);
                            }}
                          >
                            Delete
                          </Button>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* ── Create / Edit Dialog ─────────────────────────────────────────────── */}
      <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) setDialogOpen(false); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingIdea ? 'Edit Move Idea' : 'Create Move Idea'}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="space-y-4 py-2">
              {/* Title */}
              <div className="space-y-1">
                <Label htmlFor="title">
                  Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="title"
                  maxLength={150}
                  {...register('title')}
                />
                {errors.title && (
                  <p className="text-sm text-destructive">{errors.title.message}</p>
                )}
              </div>

              {/* Category */}
              <div className="space-y-1">
                <Label htmlFor="category">
                  Category <span className="text-destructive">*</span>
                </Label>
                <Input id="category" {...register('category')} />
                {errors.category && (
                  <p className="text-sm text-destructive">{errors.category.message}</p>
                )}
              </div>

              {submitError && (
                <p className="text-sm text-destructive">{submitError}</p>
              )}
            </div>

            <DialogFooter className="mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? editingIdea
                    ? 'Saving…'
                    : 'Creating…'
                  : editingIdea
                  ? 'Save Changes'
                  : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirmation AlertDialog ──────────────────────────────────── */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Move Idea</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{' '}
              <span className="font-semibold">&ldquo;{deleteTarget?.title}&rdquo;</span>?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {deleteError && (
            <p className="text-sm text-destructive px-1">{deleteError}</p>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
