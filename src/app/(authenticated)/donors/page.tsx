'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ChevronUp, ChevronDown, ChevronsUpDown, X } from 'lucide-react';
import { DataTable, DataTableColumn } from '@/components/ui/data-table';

interface Solicitor {
  id: string;
  first_name: string;
  last_name: string;
}

interface Donor {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  score: number;
  tier: string | null;
  assigned_solicitor_id: string | null;
  solicitor: Solicitor | null;
}

interface DonorsResponse {
  donors: Donor[];
  total: number;
  page: number;
  per_page: number;
}

type SortField = 'name' | 'score' | 'tier';
type SortOrder = 'asc' | 'desc';

const TIER_COLORS: Record<string, string> = {
  Platinum: 'bg-slate-200 text-slate-800',
  Gold: 'bg-yellow-100 text-yellow-800',
  Silver: 'bg-gray-100 text-gray-700',
  Bronze: 'bg-orange-100 text-orange-800',
};

function tierBadgeClass(tier: string | null): string {
  if (!tier) return 'bg-muted text-muted-foreground';
  return TIER_COLORS[tier] ?? 'bg-blue-100 text-blue-800';
}

function SortIcon({ field, sort, order }: { field: SortField; sort: SortField; order: SortOrder }) {
  if (sort !== field) return <ChevronsUpDown className="ml-1 inline h-3 w-3 opacity-40" />;
  return order === 'asc'
    ? <ChevronUp className="ml-1 inline h-3 w-3" />
    : <ChevronDown className="ml-1 inline h-3 w-3" />;
}

export default function DonorListPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [donors, setDonors] = useState<Donor[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState(searchParams.get('search') ?? '');
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [page, setPage] = useState(parseInt(searchParams.get('page') ?? '1', 10));
  const [perPage, setPerPage] = useState<25 | 50>(
    searchParams.get('per_page') === '50' ? 50 : 25
  );
  const [sort, setSort] = useState<SortField>(
    (searchParams.get('sort') as SortField) ?? 'name'
  );
  const [order, setOrder] = useState<SortOrder>(
    (searchParams.get('order') as SortOrder) ?? 'asc'
  );

  const solicitorIdFilter = searchParams.get('solicitor_id') ?? '';

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchDonors = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        per_page: String(perPage),
        sort,
        order,
      });
      if (debouncedSearch) params.set('search', debouncedSearch);
      if (solicitorIdFilter) params.set('solicitor_id', solicitorIdFilter);

      const res = await fetch(`/api/donors?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch donors');
      const data: DonorsResponse = await res.json();
      setDonors(data.donors);
      setTotal(data.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, perPage, sort, order, debouncedSearch, solicitorIdFilter]);

  useEffect(() => {
    fetchDonors();
  }, [fetchDonors]);

  function handleSort(field: SortField) {
    if (sort === field) {
      setOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSort(field);
      setOrder('asc');
    }
    setPage(1);
  }

  function clearSolicitorFilter() {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('solicitor_id');
    router.push(`/donors?${params.toString()}`);
  }

  const totalPages = Math.max(1, Math.ceil(total / perPage));

  const columns: DataTableColumn<Donor>[] = useMemo(
    () => [
      {
        key: 'name',
        header: (
          <>
            Name <SortIcon field="name" sort={sort} order={order} />
          </>
        ),
        onHeaderClick: () => handleSort('name'),
        cellClassName: 'font-medium',
        render: (donor) => `${donor.first_name} ${donor.last_name}`,
      },
      {
        key: 'email',
        header: 'Email',
        cellClassName: 'text-muted-foreground',
        render: (donor) => donor.email ?? '—',
      },
      {
        key: 'score',
        header: (
          <>
            Score <SortIcon field="score" sort={sort} order={order} />
          </>
        ),
        onHeaderClick: () => handleSort('score'),
        render: (donor) => donor.score,
      },
      {
        key: 'tier',
        header: (
          <>
            Tier <SortIcon field="tier" sort={sort} order={order} />
          </>
        ),
        onHeaderClick: () => handleSort('tier'),
        render: (donor) =>
          donor.tier ? (
            <Badge className={tierBadgeClass(donor.tier)}>{donor.tier}</Badge>
          ) : (
            <span className="text-muted-foreground text-sm">—</span>
          ),
      },
      {
        key: 'solicitor',
        header: 'Solicitor',
        render: (donor) =>
          donor.solicitor ? (
            `${donor.solicitor.first_name} ${donor.solicitor.last_name}`
          ) : (
            <span className="text-muted-foreground">Unassigned</span>
          ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sort, order]
  );

  return (
    <div className="container mx-auto py-6 space-y-4">
      <h1 className="text-2xl font-bold">Donors</h1>

      {/* Solicitor filter indicator */}
      {solicitorIdFilter && (
        <div className="flex items-center gap-2 rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-700">
          <span>Filtered by solicitor</span>
          <Button
            variant="ghost"
            size="sm"
            className="h-5 w-5 p-0 text-blue-700 hover:text-blue-900"
            onClick={clearSolicitorFilter}
          >
            <X className="h-3 w-3" />
            <span className="sr-only">Clear filter</span>
          </Button>
        </div>
      )}

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-base font-medium">
              {loading ? 'Loading…' : `${total} donor${total !== 1 ? 's' : ''}`}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Input
                placeholder="Search donors..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-64"
              />
              <Select
                value={String(perPage)}
                onValueChange={(v) => {
                  setPerPage(v === '50' ? 50 : 25);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="25">25 / page</SelectItem>
                  <SelectItem value="50">50 / page</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <DataTable<Donor>
            columns={columns}
            data={donors}
            loading={loading}
            loadingRowCount={5}
            emptyMessage="No donors found."
            onRowClick={(donor) => router.push(`/donors/${donor.id}`)}
            rowKey={(donor) => donor.id}
          />
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Page {page} of {totalPages}
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1 || loading}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages || loading}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
