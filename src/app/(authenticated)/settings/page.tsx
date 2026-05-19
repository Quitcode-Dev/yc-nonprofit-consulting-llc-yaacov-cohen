'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '@/lib/stores/auth-store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import type { Organization } from '@/lib/types';

const profileSchema = z.object({
  name: z.string().min(1, 'Organization name is required'),
  contact_name: z.string().optional(),
  contact_email: z
    .string()
    .optional()
    .refine((val) => !val || z.string().email().safeParse(val).success, {
      message: 'Must be a valid email address',
    }),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function OrganizationSettingsPage() {
  const { toast } = useToast();
  const getEffectiveOrgId = useAuthStore((s) => s.getEffectiveOrgId);
  const orgId = getEffectiveOrgId();

  const [org, setOrg] = useState<Organization | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: '',
      contact_name: '',
      contact_email: '',
    },
  });

  useEffect(() => {
    if (!orgId) {
      setLoadError('No organization found for your account.');
      setIsLoading(false);
      return;
    }

    async function fetchOrg() {
      try {
        const res = await fetch(`/api/organizations/${orgId}`);
        if (!res.ok) {
          const data = await res.json();
          setLoadError(data.error ?? 'Failed to load organization.');
          return;
        }
        const data: Organization = await res.json();
        setOrg(data);
        reset({
          name: data.name ?? '',
          contact_name: data.contact_name ?? '',
          contact_email: data.contact_email ?? '',
        });
      } catch {
        setLoadError('Failed to load organization.');
      } finally {
        setIsLoading(false);
      }
    }

    fetchOrg();
  }, [orgId, reset]);

  async function onSubmit(values: ProfileFormValues) {
    if (!orgId) return;

    try {
      const res = await fetch(`/api/organizations/${orgId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: values.name,
          contact_name: values.contact_name ?? '',
          contact_email: values.contact_email ?? '',
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast({
          title: 'Error',
          description: data.error ?? 'Failed to save settings.',
          variant: 'destructive',
        });
        return;
      }

      const updated: Organization = await res.json();
      setOrg(updated);
      reset({
        name: updated.name ?? '',
        contact_name: updated.contact_name ?? '',
        contact_email: updated.contact_email ?? '',
      });

      toast({
        title: 'Settings saved',
        description: 'Your organization profile has been updated.',
      });
    } catch {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred.',
        variant: 'destructive',
      });
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-muted-foreground">Loading settings…</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-destructive">{loadError}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your organization&apos;s settings and preferences.
        </p>
      </div>

      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="scoring">Scoring</TabsTrigger>
          <TabsTrigger value="tiers">Tiers</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Organization Profile</CardTitle>
              <CardDescription>
                Update your organization&apos;s name and contact information.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">
                    Organization Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    placeholder="Acme Nonprofit"
                    {...register('name')}
                    aria-invalid={!!errors.name}
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive">{errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact_name">Contact Name</Label>
                  <Input
                    id="contact_name"
                    placeholder="Jane Smith"
                    {...register('contact_name')}
                    aria-invalid={!!errors.contact_name}
                  />
                  {errors.contact_name && (
                    <p className="text-sm text-destructive">{errors.contact_name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact_email">Contact Email</Label>
                  <Input
                    id="contact_email"
                    type="email"
                    placeholder="jane@example.com"
                    {...register('contact_email')}
                    aria-invalid={!!errors.contact_email}
                  />
                  {errors.contact_email && (
                    <p className="text-sm text-destructive">{errors.contact_email.message}</p>
                  )}
                </div>

                <div className="flex justify-end">
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Saving…' : 'Save Changes'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scoring" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Scoring</CardTitle>
              <CardDescription>Configure scoring settings for your organization.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">Scoring configuration coming soon.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tiers" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Tiers</CardTitle>
              <CardDescription>Configure donor tier settings for your organization.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">Tier configuration coming soon.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Integrations</CardTitle>
              <CardDescription>Manage third-party integrations for your organization.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">Integrations coming soon.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
