import Link from 'next/link'
import { format } from 'date-fns'
import { getAuthenticatedUser, assertRole } from '@/lib/auth/authorize'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export default async function OrganizationsListPage() {
  const { profile } = await getAuthenticatedUser()
  assertRole(profile, ['super_admin'])

  const supabase = await createClient()
  const { data: organizations, error } = await supabase
    .from('organizations')
    .select('*')
    .order('name', { ascending: true })

  if (error) {
    throw new Error('Failed to fetch organizations')
  }

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Organizations</h1>
        <Button asChild variant="default">
          <Link href="/organizations/new">Create Organization</Link>
        </Button>
      </div>

      {organizations && organizations.length > 0 ? (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Contact Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {organizations.map((org) => (
                  <TableRow
                    key={org.id}
                    className="cursor-pointer hover:bg-muted/50"
                  >
                    <TableCell>
                      <Link
                        href={`/organizations/${org.id}`}
                        className="block w-full font-medium hover:underline"
                      >
                        {org.name}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/organizations/${org.id}`}
                        className="block w-full"
                      >
                        {org.contact_email ?? '—'}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/organizations/${org.id}`}
                        className="block w-full"
                      >
                        {org.is_active ? (
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                            Active
                          </Badge>
                        ) : (
                          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
                            Inactive
                          </Badge>
                        )}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/organizations/${org.id}`}
                        className="block w-full"
                      >
                        {format(new Date(org.created_at), 'MMM d, yyyy')}
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
          <p className="text-muted-foreground">No organizations yet</p>
          <Button asChild variant="default">
            <Link href="/organizations/new">Create your first organization</Link>
          </Button>
        </div>
      )}
    </div>
  )
}
