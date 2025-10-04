/**
 * API Types for Backend Integration
 * 
 * This file defines all the TypeScript interfaces that the backend should implement.
 * Update these types when the backend API structure changes.
 */

// =============================================================================
// USER & AUTHENTICATION TYPES
// =============================================================================

export interface User {
  id: string;
  username: string;
  email: string;
  ecoScore: number;
  streak: number;
  profileImage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

// =============================================================================
// ENVIRONMENTAL METRICS TYPES
// =============================================================================

export interface EnvironmentalMetrics {
  water: {
    saved: number; // gallons
    goal: number;
    unit: "gallons";
  };
  co2: {
    saved: number; // kg CO₂
    goal: number;
    unit: "kg";
  };
  electricity: {
    saved: number; // kWh
    goal: number;
    unit: "kWh";
  };
}

export interface TimePeriodMetrics {
  today: EnvironmentalMetrics;
  week: EnvironmentalMetrics;
  month: EnvironmentalMetrics;
}

// =============================================================================
// ACTIVITY & EVENTS TYPES
// =============================================================================

export interface EcoActivity {
  id: string;
  userId: string;
  action: string; // e.g., "ChatGPT Prompt optimized", "Image generation optimized"
  impact: {
    water?: number;
    co2?: number;
    electricity?: number;
  };
  timestamp: string; // ISO date string
  ecoScoreChange?: number;
  category: "ai" | "media" | "communication" | "general";
}

// =============================================================================
// API RESPONSE TYPES
// =============================================================================

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// =============================================================================
// REQUEST TYPES
// =============================================================================

export interface UpdateGoalsRequest {
  water?: number;
  co2?: number;
  electricity?: number;
}

export interface GetActivitiesRequest {
  page?: number;
  limit?: number;
  category?: string;
  startDate?: string;
  endDate?: string;
}

// =============================================================================
// CONFIGURATION TYPES
// =============================================================================

export interface AppConfig {
  defaultGoals: EnvironmentalMetrics;
  ecoScoreWeights: {
    water: number;
    co2: number;
    electricity: number;
  };
  timePeriods: ("today" | "week" | "month")[];
}
