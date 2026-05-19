'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

interface UseDashboardRefreshResult {
  lastUpdated: Date | null;
  isRefreshing: boolean;
  refresh: () => void;
}

export function useDashboardRefresh(
  fetchFn: () => Promise<void>,
  intervalMs: number = 60000,
): UseDashboardRefreshResult {
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const fetchFnRef = useRef(fetchFn);

  // Keep ref up to date so the interval always calls the latest fetchFn
  useEffect(() => {
    fetchFnRef.current = fetchFn;
  }, [fetchFn]);

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await fetchFnRef.current();
      setLastUpdated(new Date());
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  // Call on mount and set up interval
  useEffect(() => {
    refresh();
    const id = setInterval(refresh, intervalMs);
    return () => clearInterval(id);
  }, [refresh, intervalMs]);

  return { lastUpdated, isRefreshing, refresh };
}
