'use client';

import { useCallback, useState } from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDashboardRefresh } from '@/lib/hooks/use-dashboard-refresh';

interface LeaderboardEntry {
  id: string;
  solicitor_name: string;
  avg_score: number;
  donor_count: number;
}

interface RecentActivity {
  id: string;
  title: string;
  donor_name: string;
  solicitor_name: string;
  completed_at: string | null;
}

interface AdminDashboardData {
  total_donors: number;
  moves_needed: number;
  total_moves: number;
  moves_completed: number;
  pending_moves: number;
  leaderboard: LeaderboardEntry[];
  recent_activity: RecentActivity[];
}

interface MetricCardProps {
  label: string;
  value: number;
}

function MetricCard({ label, value }: MetricCardProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-3xl font-bold mt-1">{value.toLocaleString()}</p>
      </CardContent>
    </Card>
  );
}

export function AdminDashboard() {
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/dashboard/admin');
      if (!res.ok) {
        const body = await res.json();
        setError(body.error ?? 'Failed to load dashboard data');
        return;
      }
      const json: AdminDashboardData = await res.json();
      setData(json);
    } catch {
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  const { lastUpdated, isRefreshing } = useDashboardRefresh(fetchData);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-muted-foreground text-sm">
        Loading…
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-destructive text-sm py-8">
        {error ?? 'Unable to load dashboard.'}
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      {/* ── Metric cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
        <MetricCard label="Total Donors" value={data.total_donors} />
        <MetricCard label="Moves Needed" value={data.moves_needed} />
        <MetricCard label="Total Moves" value={data.total_moves} />
        <MetricCard label="Completed" value={data.moves_completed} />
        <MetricCard label="Pending" value={data.pending_moves} />
      </div>

      {/* ── Last updated ── */}
      <p className="text-xs text-muted-foreground text-right">
        {isRefreshing
          ? 'Refreshing…'
          : lastUpdated
          ? `Last updated: ${formatDistanceToNow(lastUpdated, { addSuffix: true })}`
          : null}
      </p>

      {/* ── Leaderboard + Recent Activity ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Solicitors */}
        <Card>
          <CardHeader>
            <CardTitle>Top Solicitors</CardTitle>
          </CardHeader>
          <CardContent>
            {data.leaderboard.length === 0 ? (
              <p className="text-sm text-muted-foreground">No solicitors found.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 pr-4 font-medium text-muted-foreground w-10">
                      #
                    </th>
                    <th className="text-left py-2 pr-4 font-medium text-muted-foreground">
                      Name
                    </th>
                    <th className="text-right py-2 font-medium text-muted-foreground">
                      Avg Donor Score
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.leaderboard.map((entry, index) => (
                    <tr key={entry.id} className="border-b last:border-0">
                      <td className="py-2 pr-4 text-muted-foreground">{index + 1}</td>
                      <td className="py-2 pr-4">
                        <Link
                          href={`/donors?solicitor_id=${entry.id}`}
                          className="text-primary hover:underline"
                        >
                          {entry.solicitor_name}
                        </Link>
                      </td>
                      <td className="py-2 text-right font-medium">{entry.avg_score}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {data.recent_activity.length === 0 ? (
              <p className="text-sm text-muted-foreground">No recent activity.</p>
            ) : (
              <ul className="space-y-3">
                {data.recent_activity.map((activity) => (
                  <li key={activity.id} className="border-b last:border-0 pb-3 last:pb-0">
                    <p className="font-medium text-sm">{activity.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {activity.donor_name} &middot; {activity.solicitor_name}
                    </p>
                    {activity.completed_at && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {new Date(activity.completed_at).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
