'use client';

import { useEffect, useState } from 'react';
import { SolicitorDashboard } from '@/components/dashboard/solicitor-dashboard';
import { AdminDashboard } from '@/components/dashboard/admin-dashboard';

interface ProfileResponse {
  role: string;
}

export default function DashboardPage() {
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data: ProfileResponse = await res.json();
          setRole(data.role);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-muted-foreground text-sm">
        Loading…
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      {role === 'solicitor' && <SolicitorDashboard />}

      {(role === 'org_admin' || role === 'super_admin') && <AdminDashboard />}

      {!role && (
        <div className="text-muted-foreground text-sm">
          Unable to load dashboard.
        </div>
      )}
    </div>
  );
}
