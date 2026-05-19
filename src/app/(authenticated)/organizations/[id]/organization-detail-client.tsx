'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import { Organization } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';

interface OrganizationDetailClientProps {
  org: Organization;
}

export function OrganizationDetailClient({ org }: OrganizationDetailClientProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  async function handleToggleActive(newIsActive: boolean) {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/organizations/${org.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: newIsActive }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast({
          title: 'Error',
          description: data.error ?? 'Something went wrong.',
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: newIsActive ? 'Organization reactivated' : 'Organization deactivated',
      });

      router.refresh();
    } catch {
      toast({
        title: 'Error',
        description: 'Something went wrong.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="container mx-auto max-w-3xl py-8 px-4">
      <div className="mb-6">
        <Link
          href="/organizations"
          className="text-sm text-muted-foreground hover:underline"
        >
          ← Back to Organizations
        </Link>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-start justify-between space-y-0">
          <div>
            <CardTitle className="text-2xl">{org.name}</CardTitle>
          </div>
          <Badge variant={org.is_active ? 'default' : 'secondary'}>
            {org.is_active ? 'Active' : 'Inactive'}
          </Badge>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Contact Name</p>
              <p className="mt-1 text-sm">
                {org.contact_name ?? <span className="text-muted-foreground">—</span>}
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground">Contact Email</p>
              <p className="mt-1 text-sm">
                {org.contact_email ?? <span className="text-muted-foreground">—</span>}
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground">Status</p>
              <p className="mt-1 text-sm">{org.is_active ? 'Active' : 'Inactive'}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground">Created</p>
              <p className="mt-1 text-sm">
                {format(new Date(org.created_at), 'PPP')}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <Button asChild>
              <Link href={`/dashboard?org=${org.id}`}>Access as Admin</Link>
            </Button>

            {org.is_active ? (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" disabled={isLoading}>
                    Deactivate
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Deactivate Organization</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure? All users in this organization will lose access.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleToggleActive(false)}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Deactivate
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            ) : (
              <Button
                variant="outline"
                disabled={isLoading}
                onClick={() => handleToggleActive(true)}
              >
                Reactivate
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
