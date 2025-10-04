/**
 * API Service Layer
 * 
 * This file contains all API calls to the backend.
 * Update the base URL and endpoints when the backend is deployed.
 */

import { 
  User, 
  AuthResponse, 
  TimePeriodMetrics, 
  EcoActivity, 
  ApiResponse, 
  PaginatedResponse,
  UpdateGoalsRequest,
  GetActivitiesRequest 
} from '@/types/api';

// =============================================================================
// API CONFIGURATION
// =============================================================================

// TODO: Update this URL when your backend is deployed
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// =============================================================================
// AUTHENTICATION API
// =============================================================================

export const authApi = {
  /**
   * Login user with email/password
   * Backend endpoint: POST /auth/login
   */
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    
    if (!response.ok) {
      throw new Error(`Login failed: ${response.statusText}`);
    }
    
    return response.json();
  },

  /**
   * Register new user
   * Backend endpoint: POST /auth/register
   */
  register: async (userData: { email: string; password: string; username: string }): Promise<AuthResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    
    if (!response.ok) {
      throw new Error(`Registration failed: ${response.statusText}`);
    }
    
    return response.json();
  },

  /**
   * Get current user profile
   * Backend endpoint: GET /auth/me
   */
  getCurrentUser: async (token: string): Promise<User> => {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to get user: ${response.statusText}`);
    }
    
    return response.json();
  },
};

// =============================================================================
// METRICS API
// =============================================================================

export const metricsApi = {
  /**
   * Get environmental metrics for all time periods
   * Backend endpoint: GET /metrics
   */
  getMetrics: async (token: string): Promise<TimePeriodMetrics> => {
    const response = await fetch(`${API_BASE_URL}/metrics`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to get metrics: ${response.statusText}`);
    }
    
    return response.json();
  },

  /**
   * Update user's environmental goals
   * Backend endpoint: PUT /metrics/goals
   */
  updateGoals: async (token: string, goals: UpdateGoalsRequest): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/metrics/goals`, {
      method: 'PUT',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify(goals),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to update goals: ${response.statusText}`);
    }
  },
};

// =============================================================================
// ACTIVITIES API
// =============================================================================

export const activitiesApi = {
  /**
   * Get user's eco activities with pagination
   * Backend endpoint: GET /activities?page=1&limit=10&category=ai
   */
  getActivities: async (token: string, params?: GetActivitiesRequest): Promise<PaginatedResponse<EcoActivity>> => {
    const searchParams = new URLSearchParams();
    
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.category) searchParams.append('category', params.category);
    if (params?.startDate) searchParams.append('startDate', params.startDate);
    if (params?.endDate) searchParams.append('endDate', params.endDate);
    
    const response = await fetch(`${API_BASE_URL}/activities?${searchParams}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to get activities: ${response.statusText}`);
    }
    
    return response.json();
  },

  /**
   * Create a new eco activity (when user performs an eco-friendly action)
   * Backend endpoint: POST /activities
   */
  createActivity: async (token: string, activity: Omit<EcoActivity, 'id' | 'userId' | 'timestamp'>): Promise<EcoActivity> => {
    const response = await fetch(`${API_BASE_URL}/activities`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify(activity),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to create activity: ${response.statusText}`);
    }
    
    return response.json();
  },
};

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Generic API call wrapper with error handling
 */
export const apiCall = async <T>(
  url: string, 
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
};

/**
 * Get auth token from localStorage
 */
export const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_token');
};

/**
 * Set auth token in localStorage
 */
export const setAuthToken = (token: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('auth_token', token);
};

/**
 * Remove auth token from localStorage
 */
export const removeAuthToken = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('auth_token');
};
