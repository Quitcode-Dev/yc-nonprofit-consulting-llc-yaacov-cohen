'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { format, isToday, isBefore, startOfDay } from 'date-fns';
import { CalendarIcon, ChevronsUpDown, Check } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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

interface DonorOption {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
}

interface MoveIdeaOption {
  id: string;
  title: string;
  category: string;
  is_global: boolean;
}

export default function CreateMovePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedDonorId = searchParams.get('donor_id') ?? '';

  // ── Form state ────────────────────────────────────────────────────────────
  const [selectedDonorId, setSelectedDonorId] = useState<string>(preselectedDonorId);
  const [selectedMoveIdeaId, setSelectedMoveIdeaId] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);

  // ── Data ──────────────────────────────────────────────────────────────────
  const [donors, setDonors] = useState<DonorOption[]>([]);
  const [moveIdeas, setMoveIdeas] = useState<MoveIdeaOption[]>([]);
  const [orgId, setOrgId] = useState<string>('');

  // ── UI state ──────────────────────────────────────────────────────────────
  const [donorOpen, setDonorOpen] = useState(false);
  const [ideaOpen, setIdeaOpen] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [globalError, setGlobalError] = useState<string>('');

  // ── Fetch donors ──────────────────────────────────────────────────────────
  const fetchDonors = useCallback(async () => {
    try {
      const res = await fetch('/api/donors?per_page=50&page=1');
      if (!res.ok) return;
      const data = await res.json();
      setDonors(data.donors ?? []);
      // Derive orgId from first donor if available (fallback: profile endpoint)
    } catch {
      // silently fail; user will see empty list
    }
  }, []);

  // ── Fetch org profile to get orgId ────────────────────────────────────────
  const fetchProfile = useCallback(async () => {
    try {
      const res = await fetch('/api/profile');
      if (!res.ok) return;
      const data = await res.json();
      setOrgId(data.profile?.organization_id ?? '');
    } catch {
      // silently fail
    }
  }, []);

  // ── Fetch move ideas ──────────────────────────────────────────────────────
  const fetchMoveIdeas = useCallback(async (organizationId: string) => {
    try {
      const params = organizationId ? `?org_id=${organizationId}` : '';
      const res = await fetch(`/api/move-ideas${params}`);
      if (!res.ok) return;
      const data = await res.json();
      setMoveIdeas(data.move_ideas ?? data.moveIdeas ?? []);
    } catch {
      // silently fail
    }
  }, []);

  useEffect(() => {
    fetchDonors();
    fetchProfile();
  }, [fetchDonors, fetchProfile]);

  useEffect(() => {
    if (orgId) {
      fetchMoveIdeas(orgId);
    }
  }, [orgId, fetchMoveIdeas]);

  // ── Derived helpers ───────────────────────────────────────────────────────
  const selectedDonor = donors.find((d) => d.id === selectedDonorId);
  const selectedIdea = moveIdeas.find((i) => i.id === selectedMoveIdeaId);

  const globalIdeas = moveIdeas.filter((i) => i.is_global);
  const orgIdeas = moveIdeas.filter((i) => !i.is_global);

  // Auto-fill title when idea is selected
  const handleSelectIdea = (idea: MoveIdeaOption) => {
    setSelectedMoveIdeaId(idea.id);
    setTitle(idea.title);
    setIdeaOpen(false);
    setErrors((prev) => ({ ...prev, move_idea: '', title: '' }));
  };

  // ── Validation ────────────────────────────────────────────────────────────
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!selectedDonorId) newErrors.donor = 'Please select a donor.';
    if (!selectedMoveIdeaId) newErrors.move_idea = 'Please select a move idea.';
    if (!title.trim()) newErrors.title = 'Title is required.';
    if (!dueDate) newErrors.due_date = 'Please select a due date.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGlobalError('');
    if (!validate()) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/moves', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          donor_id: selectedDonorId,
          move_idea_id: selectedMoveIdeaId || null,
          due_date: dueDate ? format(dueDate, 'yyyy-MM-dd') : null,
          title: title.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setGlobalError(data.error ?? 'Failed to create move.');
        return;
      }

      router.push('/moves');
    } catch {
      setGlobalError('An unexpected error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-semibold mb-6">Create Move</h1>

      {globalError && (
        <div className="mb-4 rounded-md bg-destructive/10 border border-destructive/30 px-4 py-3 text-sm text-destructive">
          {globalError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ── Donor picker ── */}
        <div className="space-y-1.5">
          <Label htmlFor="donor-trigger">Donor</Label>
          <Popover open={donorOpen} onOpenChange={setDonorOpen}>
            <PopoverTrigger asChild>
              <Button
                id="donor-trigger"
                variant="outline"
                role="combobox"
                aria-expanded={donorOpen}
                className={cn(
                  'w-full justify-between font-normal',
                  !selectedDonor && 'text-muted-foreground'
                )}
              >
                {selectedDonor
                  ? `${selectedDonor.first_name} ${selectedDonor.last_name}`
                  : 'Select donor…'}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0" align="start">
              <Command>
                <CommandInput placeholder="Search donors…" />
                <CommandList>
                  <CommandEmpty>No donors found.</CommandEmpty>
                  <CommandGroup>
                    {donors.map((donor) => (
                      <CommandItem
                        key={donor.id}
                        value={`${donor.first_name} ${donor.last_name} ${donor.email ?? ''}`}
                        onSelect={() => {
                          setSelectedDonorId(donor.id);
                          setDonorOpen(false);
                          setErrors((prev) => ({ ...prev, donor: '' }));
                        }}
                      >
                        <Check
                          className={cn(
                            'mr-2 h-4 w-4',
                            selectedDonorId === donor.id ? 'opacity-100' : 'opacity-0'
                          )}
                        />
                        <span>
                          {donor.first_name} {donor.last_name}
                        </span>
                        {donor.email && (
                          <span className="ml-2 text-xs text-muted-foreground">
                            {donor.email}
                          </span>
                        )}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          {errors.donor && (
            <p className="text-xs text-destructive">{errors.donor}</p>
          )}
        </div>

        {/* ── Move Idea selector ── */}
        <div className="space-y-1.5">
          <Label htmlFor="idea-trigger">Move Idea</Label>
          <Popover open={ideaOpen} onOpenChange={setIdeaOpen}>
            <PopoverTrigger asChild>
              <Button
                id="idea-trigger"
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
                              selectedMoveIdeaId === idea.id ? 'opacity-100' : 'opacity-0'
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
                              selectedMoveIdeaId === idea.id ? 'opacity-100' : 'opacity-0'
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

        {/* ── Title ── */}
        <div className="space-y-1.5">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setErrors((prev) => ({ ...prev, title: '' }));
            }}
            placeholder="Move title…"
          />
          {errors.title && (
            <p className="text-xs text-destructive">{errors.title}</p>
          )}
        </div>

        {/* ── Due date ── */}
        <div className="space-y-1.5">
          <Label htmlFor="due-date-trigger">Due Date</Label>
          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger asChild>
              <Button
                id="due-date-trigger"
                variant="outline"
                className={cn(
                  'w-full justify-start text-left font-normal',
                  !dueDate && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dueDate ? format(dueDate, 'PPP') : 'Pick a date…'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={dueDate}
                onSelect={(date) => {
                  setDueDate(date);
                  setCalendarOpen(false);
                  setErrors((prev) => ({ ...prev, due_date: '' }));
                }}
                disabled={(date) =>
                  isBefore(startOfDay(date), startOfDay(new Date())) &&
                  !isToday(date)
                }
                initialFocus
              />
            </PopoverContent>
          </Popover>
          {errors.due_date && (
            <p className="text-xs text-destructive">{errors.due_date}</p>
          )}
        </div>

        {/* ── Actions ── */}
        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={submitting} className="flex-1">
            {submitting ? 'Creating…' : 'Create Move'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/moves')}
            disabled={submitting}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
