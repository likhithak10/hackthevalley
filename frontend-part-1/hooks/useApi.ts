/**
 * Custom React Hooks for API Integration
 * 
 * These hooks provide easy-to-use React components for fetching data from the backend.
 * They handle loading states, errors, and caching automatically.
 */

import { useState, useEffect, useCallback } from 'react';
import { User, TimePeriodMetrics, EcoActivity, PaginatedResponse } from '@/types/api';
import { authApi, metricsApi, activitiesApi, getAuthToken } from '@/lib/api';

// =============================================================================
// GENERIC API HOOK
// =============================================================================

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

function useApi<T>(
  apiCall: () => Promise<T>,
  dependencies: any[] = []
): UseApiState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiCall();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('API call failed:', err);
    } finally {
      setLoading(false);
    }
  }, dependencies);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

// =============================================================================
// AUTHENTICATION HOOKS
// =============================================================================

/**
 * Hook to get current user data
 * Usage: const { user, loading, error } = useCurrentUser();
 */
export function useCurrentUser() {
  return useApi<User>(async () => {
    const token = getAuthToken();
    if (!token) throw new Error('No authentication token found');
    return authApi.getCurrentUser(token);
  }, []);
}

// =============================================================================
// METRICS HOOKS
// =============================================================================

/**
 * Hook to get environmental metrics
 * Usage: const { metrics, loading, error, refetch } = useMetrics();
 */
export function useMetrics() {
  return useApi<TimePeriodMetrics>(async () => {
    const token = getAuthToken();
    if (!token) throw new Error('No authentication token found');
    return metricsApi.getMetrics(token);
  }, []);
}

// =============================================================================
// ACTIVITIES HOOKS
// =============================================================================

/**
 * Hook to get user activities with pagination
 * Usage: const { activities, loading, error, refetch } = useActivities({ page: 1, limit: 10 });
 */
export function useActivities(params?: { page?: number; limit?: number; category?: string }) {
  return useApi<PaginatedResponse<EcoActivity>>(async () => {
    const token = getAuthToken();
    if (!token) throw new Error('No authentication token found');
    return activitiesApi.getActivities(token, params);
  }, [params?.page, params?.limit, params?.category]);
}

// =============================================================================
// REAL-TIME DATA HOOKS (for live updates)
// =============================================================================

/**
 * Hook for real-time metrics updates
 * Automatically refetches data every 30 seconds
 */
export function useRealtimeMetrics() {
  const metrics = useMetrics();

  useEffect(() => {
    const interval = setInterval(() => {
      metrics.refetch();
    }, 30000); // Refetch every 30 seconds

    return () => clearInterval(interval);
  }, [metrics.refetch]);

  return metrics;
}

// =============================================================================
// MUTATION HOOKS (for creating/updating data)
// =============================================================================

/**
 * Hook for creating new activities
 * Usage: const { createActivity, loading, error } = useCreateActivity();
 */
export function useCreateActivity() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createActivity = useCallback(async (activity: Omit<EcoActivity, 'id' | 'userId' | 'timestamp'>) => {
    try {
      setLoading(true);
      setError(null);
      const token = getAuthToken();
      if (!token) throw new Error('No authentication token found');
      
      const result = await activitiesApi.createActivity(token, activity);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create activity';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { createActivity, loading, error };
}

/**
 * Hook for updating user goals
 * Usage: const { updateGoals, loading, error } = useUpdateGoals();
 */
export function useUpdateGoals() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateGoals = useCallback(async (goals: { water?: number; co2?: number; electricity?: number }) => {
    try {
      setLoading(true);
      setError(null);
      const token = getAuthToken();
      if (!token) throw new Error('No authentication token found');
      
      await metricsApi.updateGoals(token, goals);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update goals';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { updateGoals, loading, error };
}
