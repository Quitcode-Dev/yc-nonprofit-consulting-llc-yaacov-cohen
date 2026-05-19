'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const createOrgSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  contact_name: z.string().optional(),
  contact_email: z
    .string()
    .optional()
    .refine(
      (val) => !val || val === '' || z.string().email().safeParse(val).success,
      { message: 'Must be a valid email address' }
    ),
});

type CreateOrgFormValues = z.infer<typeof createOrgSchema>;

export default function CreateOrganizationPage() {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CreateOrgFormValues>({
    resolver: zodResolver(createOrgSchema),
    defaultValues: {
      name: '',
      contact_name: '',
      contact_email: '',
    },
  });

  async function onSubmit(data: CreateOrgFormValues) {
    setSubmitError(null);

    try {
      const res = await fetch('/api/organizations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        const newOrg = await res.json();
        router.push(`/organizations/${newOrg.id}`);
        return;
      }

      if (res.status === 409) {
        const body = await res.json();
        if (body?.error === 'duplicate_name') {
          setError('name', {
            type: 'manual',
            message: 'An organization with this name already exists',
          });
          return;
        }
      }

      if (res.status === 403) {
        setSubmitError('You do not have permission to create organizations.');
        return;
      }

      setSubmitError('Something went wrong. Please try again.');
    } catch {
      setSubmitError('Something went wrong. Please try again.');
    }
  }

  return (
    <div className="mx-auto max-w-lg py-8">
      <Card>
        <CardHeader>
          <CardTitle>Create Organization</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            {submitError && (
              <p className="text-sm text-destructive">{submitError}</p>
            )}

            <div className="space-y-1">
              <Label htmlFor="name">
                Organization Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                {...register('name')}
                placeholder="Acme Nonprofit"
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="contact_name">Contact Name</Label>
              <Input
                id="contact_name"
                {...register('contact_name')}
                placeholder="Jane Smith"
              />
              {errors.contact_name && (
                <p className="text-sm text-destructive">
                  {errors.contact_name.message}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="contact_email">Contact Email</Label>
              <Input
                id="contact_email"
                type="email"
                {...register('contact_email')}
                placeholder="jane@example.com"
              />
              {errors.contact_email && (
                <p className="text-sm text-destructive">
                  {errors.contact_email.message}
                </p>
              )}
            </div>
          </CardContent>

          <CardFooter className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/organizations')}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating…' : 'Create'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
