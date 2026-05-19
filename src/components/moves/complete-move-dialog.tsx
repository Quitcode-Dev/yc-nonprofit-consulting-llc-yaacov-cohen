'use client';

import { useEffect, useState, useCallback } from 'react';
import { format, isBefore, startOfDay } from 'date-fns';
import { CalendarIcon, ChevronsUpDown, Check } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import type { Move } from '@/lib/types';

interface MoveIdeaOption {
  id: string;
  title: string;
  category: string;
  is_global: boolean;
}

interface CompleteMoveDialogProps {
  move: Move;
  onComplete: () => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Step = 1 | 2;

export function CompleteMoveDialog({
  move,
  onComplete,
  open,
  onOpenChange,
}: CompleteMoveDialogProps) {
  const { toast } = useToast();

  // ── Step state ────────────────────────────────────────────────────────────
  const [step, setStep] = useState<Step>(1);

  // ── Step 1 ────────────────────────────────────────────────────────────────
  const [completionNotes, setCompletionNotes] = useState('');

  // ── Step 2 ────────────────────────────────────────────────────────────────
  const [wantsFollowUp, setWantsFollowUp] = useState<boolean | null>(null);
  const [moveIdeas, setMoveIdeas] = useState<MoveIdeaOption[]>([]);
  const [selectedMoveIdeaId, setSelectedMoveIdeaId] = useState('');
  const [followUpTitle, setFollowUpTitle] = useState('');
  const [followUpDueDate, setFollowUpDueDate] = useState<Date | undefined>(undefined);
  const [ideaOpen, setIdeaOpen] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);

  // ── UI state ──────────────────────────────────────────────────────────────
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [globalError, setGlobalError] = useState('');

  // ── Reset when dialog opens/closes ────────────────────────────────────────
  useEffect(() => {
    if (!open) {
      setStep(1);
      setCompletionNotes('');
      setWantsFollowUp(null);
      setSelectedMoveIdeaId('');
      setFollowUpTitle('');
      setFollowUpDueDate(undefined);
      setErrors({});
      setGlobalError('');
    }
  }, [open]);

  // ── Fetch move ideas when entering step 2 ─────────────────────────────────
  const fetchMoveIdeas = useCallback(async () => {
    try {
      const params = move.organization_id ? `?org_id=${move.organization_id}` : '';
      const res = await fetch(`/api/move-ideas${params}`);
      if (!res.ok) return;
      const data = await res.json();
      setMoveIdeas(data.move_ideas ?? data.moveIdeas ?? []);
    } catch {
      // silently fail
    }
  }, [move.organization_id]);

  useEffect(() => {
    if (open && step === 2) {
      fetchMoveIdeas();
    }
  }, [open, step, fetchMoveIdeas]);

  // ── Derived ───────────────────────────────────────────────────────────────
  const selectedIdea = moveIdeas.find((i) => i.id === selectedMoveIdeaId);
  const globalIdeas = moveIdeas.filter((i) => i.is_global);
  const orgIdeas = moveIdeas.filter((i) => !i.is_global);

  const handleSelectIdea = (idea: MoveIdeaOption) => {
    setSelectedMoveIdeaId(idea.id);
    setFollowUpTitle(idea.title);
    setIdeaOpen(false);
    setErrors((prev) => ({ ...prev, move_idea: '', follow_up_title: '' }));
  };

  // ── Step 2 validation ─────────────────────────────────────────────────────
  const validateStep2 = (): boolean => {
    if (!wantsFollowUp) return true; // No follow-up selected — nothing to validate
    const newErrors: Record<string, string> = {};
    if (!selectedMoveIdeaId) newErrors.move_idea = 'Please select a move idea.';
    if (!followUpTitle.trim()) newErrors.follow_up_title = 'Title is required.';
    if (!followUpDueDate) newErrors.follow_up_due_date = 'Please select a due date.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    setGlobalError('');
    if (!validateStep2()) return;

    setSubmitting(true);
    try {
      const payload: {
        completion_notes: string;
        follow_up?: { move_idea_id?: string; title: string; due_date: string };
      } = { completion_notes: completionNotes.trim() };

      if (wantsFollowUp && followUpDueDate) {
        payload.follow_up = {
          move_idea_id: selectedMoveIdeaId || undefined,
          title: followUpTitle.trim(),
          due_date: format(followUpDueDate, 'yyyy-MM-dd'),
        };
      }

      const res = await fetch(`/api/moves/${move.id}/complete`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok && res.status !== 207) {
        setGlobalError(data.error ?? 'Failed to complete move.');
        return;
      }

      toast({ title: 'Move completed' });
      onOpenChange(false);
      onComplete();
    } catch {
      setGlobalError('An unexpected error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {step === 1 ? 'Complete Move' : 'Follow-Up Move'}
          </DialogTitle>
        </DialogHeader>

        {globalError && (
          <div className="rounded-md bg-destructive/10 border border-destructive/30 px-4 py-3 text-sm text-destructive">
            {globalError}
          </div>
        )}

        {/* ── Step 1: Completion notes ── */}
        {step === 1 && (
          <div className="space-y-4 py-2">
            <p className="text-sm text-muted-foreground">
              Add notes about how this move was completed.
            </p>
            <div className="space-y-1.5">
              <Label htmlFor="completion-notes">Completion Notes</Label>
              <Textarea
                id="completion-notes"
                value={completionNotes}
                onChange={(e) => setCompletionNotes(e.target.value)}
                placeholder="Describe what happened…"
                rows={4}
              />
            </div>
          </div>
        )}

        {/* ── Step 2: Follow-up ── */}
        {step === 2 && (
          <div className="space-y-5 py-2">
            {/* Read-only context */}
            <div className="rounded-md border bg-muted/40 px-4 py-3 space-y-1 text-sm">
              <p>
                <span className="font-medium">Move: </span>
                {move.title}
              </p>
              {move.donor_name && (
                <p>
                  <span className="font-medium">Donor: </span>
                  {move.donor_name}
                </p>
              )}
              {move.solicitor_name && (
                <p>
                  <span className="font-medium">Solicitor: </span>
                  {move.solicitor_name}
                </p>
              )}
            </div>

            {/* Yes / No toggle */}
            <div className="space-y-2">
              <Label>Create a follow-up move?</Label>
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant={wantsFollowUp === true ? 'default' : 'outline'}
                  onClick={() => setWantsFollowUp(true)}
                  className="flex-1"
                >
                  Yes
                </Button>
                <Button
                  type="button"
                  variant={wantsFollowUp === false ? 'default' : 'outline'}
                  onClick={() => {
                    setWantsFollowUp(false);
                    setErrors({});
                  }}
                  className="flex-1"
                >
                  No
                </Button>
              </div>
            </div>

            {/* Follow-up fields */}
            {wantsFollowUp && (
              <div className="space-y-4">
                {/* Move Idea selector */}
                <div className="space-y-1.5">
                  <Label>Move Idea</Label>
                  <Popover open={ideaOpen} onOpenChange={setIdeaOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={ideaOpen}
                        className={cn(
                          'w-full justify-between font-normal',
                          !selectedIdea && 'text-muted-foreground'
                        )}
                      >
                        {selectedIdea ? selectedIdea.title : 'Select move idea…'}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0" align="start">
                      <Command>
                        <CommandInput placeholder="Search by title or category…" />
                        <CommandList>
                          <CommandEmpty>No move ideas found.</CommandEmpty>
                          {globalIdeas.length > 0 && (
                            <CommandGroup heading="Global">
                              {globalIdeas.map((idea) => (
                                <CommandItem
                                  key={idea.id}
                                  value={`${idea.title} ${idea.category}`}
                                  onSelect={() => handleSelectIdea(idea)}
                                >
                                  <Check
                                    className={cn(
                                      'mr-2 h-4 w-4',
                                      selectedMoveIdeaId === idea.id
                                        ? 'opacity-100'
                                        : 'opacity-0'
                                    )}
                                  />
                                  <span>{idea.title}</span>
                                  <span className="ml-2 text-xs text-muted-foreground">
                                    {idea.category}
                                  </span>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          )}
                          {orgIdeas.length > 0 && (
                            <CommandGroup heading="Organization">
                              {orgIdeas.map((idea) => (
                                <CommandItem
                                  key={idea.id}
                                  value={`${idea.title} ${idea.category}`}
                                  onSelect={() => handleSelectIdea(idea)}
                                >
                                  <Check
                                    className={cn(
                                      'mr-2 h-4 w-4',
                                      selectedMoveIdeaId === idea.id
                                        ? 'opacity-100'
                                        : 'opacity-0'
                                    )}
                                  />
                                  <span>{idea.title}</span>
                                  <span className="ml-2 text-xs text-muted-foreground">
                                    {idea.category}
                                  </span>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          )}
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  {errors.move_idea && (
                    <p className="text-xs text-destructive">{errors.move_idea}</p>
                  )}
                </div>

                {/* Title (auto-filled from idea, editable) */}
                <div className="space-y-1.5">
                  <Label htmlFor="follow-up-title">Title</Label>
                  <input
                    id="follow-up-title"
                    className={cn(
                      'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors',
                      'placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring'
                    )}
                    value={followUpTitle}
                    onChange={(e) => {
                      setFollowUpTitle(e.target.value);
                      setErrors((prev) => ({ ...prev, follow_up_title: '' }));
                    }}
                    placeholder="Follow-up move title…"
                  />
                  {errors.follow_up_title && (
                    <p className="text-xs text-destructive">{errors.follow_up_title}</p>
                  )}
                </div>

                {/* Due date */}
                <div className="space-y-1.5">
                  <Label>Due Date</Label>
                  <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full justify-start text-left font-normal',
                          !followUpDueDate && 'text-muted-foreground'
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {followUpDueDate ? format(followUpDueDate, 'PPP') : 'Pick a date…'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={followUpDueDate}
                        onSelect={(date) => {
                          setFollowUpDueDate(date);
                          setCalendarOpen(false);
                          setErrors((prev) => ({ ...prev, follow_up_due_date: '' }));
                        }}
                        disabled={(date) =>
                          isBefore(startOfDay(date), startOfDay(new Date()))
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  {errors.follow_up_due_date && (
                    <p className="text-xs text-destructive">{errors.follow_up_due_date}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          {step === 1 && (
            <>
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                onClick={() => setStep(2)}
                disabled={completionNotes.trim().length === 0}
              >
                Next
              </Button>
            </>
          )}
          {step === 2 && (
            <>
              <Button
                variant="outline"
                onClick={() => setStep(1)}
                disabled={submitting}
              >
                Back
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={submitting || wantsFollowUp === null}
              >
                {submitting ? 'Completing…' : 'Complete Move'}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
