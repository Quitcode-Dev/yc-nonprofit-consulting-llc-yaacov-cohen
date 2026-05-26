'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface Move {
  id: string;
  title: string;
}

interface CompleteMoveDialogProps {
  move: Move | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCompleted: () => void;
}

export function CompleteMoveDialog({
  move,
  open,
  onOpenChange,
  onCompleted,
}: CompleteMoveDialogProps) {
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (!move) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/moves/${move.id}/complete`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completion_notes: notes }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? 'Failed to complete move');
      }
      setNotes('');
      onOpenChange(false);
      onCompleted();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Complete Move</DialogTitle>
        </DialogHeader>
        {move && (
          <p className="text-sm text-muted-foreground mb-2">
            <span className="font-medium text-foreground">{move.title}</span>
          </p>
        )}
        <div className="space-y-2">
          <Label htmlFor="completion_notes">Completion Notes (optional)</Label>
          <Textarea
            id="completion_notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Describe what happened…"
            rows={4}
          />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Saving…' : 'Mark Complete'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
