'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// ── Zod schema ────────────────────────────────────────────────────────────────
const donorSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email: z
    .string()
    .email('Invalid email format')
    .optional()
    .or(z.literal('')),
  phone: z.string().optional(),
  capacity: z
    .union([z.number({ invalid_type_error: 'Must be a number' }).nonnegative(), z.nan()])
    .optional()
    .nullable(),
  assigned_solicitor_id: z.string().optional().nullable(),
  is_parent: z.boolean().default(false),
  is_grandparent: z.boolean().default(false),
  is_alumni: z.boolean().default(false),
  is_board_member: z.boolean().default(false),
  is_community_builder: z.boolean().default(false),
  is_program_attendee: z.boolean().default(false),
  is_volunteer: z.boolean().default(false),
  is_donor_advised_fund: z.boolean().default(false),
  is_foundation_trustee: z.boolean().default(false),
});

type DonorFormValues = z.infer<typeof donorSchema>;

// ── Checkbox field definitions ────────────────────────────────────────────────
const BOOLEAN_FIELDS: { name: keyof DonorFormValues; label: string }[] = [
  { name: 'is_parent', label: 'Parent' },
  { name: 'is_grandparent', label: 'Grandparent' },
  { name: 'is_alumni', label: 'Alumni' },
  { name: 'is_board_member', label: 'Board Member' },
  { name: 'is_community_builder', label: 'Community Builder' },
  { name: 'is_program_attendee', label: 'Program Attendee' },
  { name: 'is_volunteer', label: 'Volunteer' },
  { name: 'is_donor_advised_fund', label: 'Donor Advised Fund' },
  { name: 'is_foundation_trustee', label: 'Foundation / Trustee' },
];

// ── Solicitor type ────────────────────────────────────────────────────────────
interface Solicitor {
  id: string;
  first_name: string;
  last_name: string;
}

// ── Page component ────────────────────────────────────────────────────────────
export default function CreateDonorPage() {
  const router = useRouter();
  const [solicitors, setSolicitors] = useState<Solicitor[]>([]);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<DonorFormValues>({
    resolver: zodResolver(donorSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      capacity: undefined,
      assigned_solicitor_id: null,
      is_parent: false,
      is_grandparent: false,
      is_alumni: false,
      is_board_member: false,
      is_community_builder: false,
      is_program_attendee: false,
      is_volunteer: false,
      is_donor_advised_fund: false,
      is_foundation_trustee: false,
    },
  });

  // Fetch active solicitors for this org
  useEffect(() => {
    async function fetchSolicitors() {
      try {
        const res = await fetch('/api/users?role=solicitor&status=active');
        if (res.ok) {
          const data = await res.json();
          setSolicitors(data.users ?? []);
        }
      } catch {
        // non-fatal — dropdown will just be empty
      }
    }
    fetchSolicitors();
  }, []);

  const onSubmit = async (values: DonorFormValues) => {
    setSubmitError(null);

    const payload = {
      ...values,
      email: values.email || undefined,
      phone: values.phone || undefined,
      capacity:
        values.capacity != null && !Number.isNaN(values.capacity)
          ? values.capacity
          : undefined,
      assigned_solicitor_id: values.assigned_solicitor_id || undefined,
    };

    const res = await fetch('/api/donors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setSubmitError(data.error ?? 'Failed to create donor. Please try again.');
      return;
    }

    const { donor } = await res.json();
    router.push(`/donors/${donor.id}`);
  };

  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="mb-6 text-2xl font-bold">Add New Donor</h1>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <Card>
          <CardHeader>
            <CardTitle>Donor Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">

            {/* Read-only score / tier badges */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground">Score:</span>
                <Badge variant="secondary">0</Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground">Tier:</span>
                <Badge variant="outline">Unassigned</Badge>
              </div>
            </div>

            {/* Two-column grid for text fields */}
            <div className="grid grid-cols-2 gap-4">
              {/* First Name */}
              <div className="space-y-1">
                <Label htmlFor="first_name">
                  First Name <span className="text-destructive">*</span>
                </Label>
                <Input id="first_name" {...register('first_name')} />
                {errors.first_name && (
                  <p className="text-sm text-destructive">{errors.first_name.message}</p>
                )}
              </div>

              {/* Last Name */}
              <div className="space-y-1">
                <Label htmlFor="last_name">
                  Last Name <span className="text-destructive">*</span>
                </Label>
                <Input id="last_name" {...register('last_name')} />
                {errors.last_name && (
                  <p className="text-sm text-destructive">{errors.last_name.message}</p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-1">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" {...register('email')} />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                )}
              </div>

              {/* Phone */}
              <div className="space-y-1">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" type="tel" {...register('phone')} />
              </div>

              {/* Capacity */}
              <div className="space-y-1">
                <Label htmlFor="capacity">Capacity ($)</Label>
                <Input
                  id="capacity"
                  type="number"
                  min={0}
                  step="any"
                  {...register('capacity', {
                    setValueAs: (v) => (v === '' ? undefined : Number(v)),
                  })}
                />
                {errors.capacity && (
                  <p className="text-sm text-destructive">{errors.capacity.message}</p>
                )}
              </div>

              {/* Assigned Solicitor */}
              <div className="space-y-1">
                <Label htmlFor="assigned_solicitor_id">Assigned Solicitor</Label>
                <Controller
                  control={control}
                  name="assigned_solicitor_id"
                  render={({ field }) => (
                    <Select
                      value={field.value ?? ''}
                      onValueChange={(val) => field.onChange(val === 'none' ? null : val)}
                    >
                      <SelectTrigger id="assigned_solicitor_id">
                        <SelectValue placeholder="Select solicitor…" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {solicitors.map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.first_name} {s.last_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>

            {/* Characteristics checkboxes */}
            <div>
              <h2 className="mb-3 text-base font-semibold">Characteristics</h2>
              <div className="grid grid-cols-3 gap-3">
                {BOOLEAN_FIELDS.map(({ name, label }) => (
                  <Controller
                    key={name}
                    control={control}
                    name={name}
                    render={({ field }) => (
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id={name}
                          checked={field.value as boolean}
                          onCheckedChange={(checked) => field.onChange(checked === true)}
                        />
                        <Label htmlFor={name} className="cursor-pointer font-normal">
                          {label}
                        </Label>
                      </div>
                    )}
                  />
                ))}
              </div>
            </div>

            {/* Submit error */}
            {submitError && (
              <p className="text-sm text-destructive">{submitError}</p>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Creating…' : 'Create Donor'}
              </Button>
            </div>

          </CardContent>
        </Card>
      </form>
    </div>
  );
}
