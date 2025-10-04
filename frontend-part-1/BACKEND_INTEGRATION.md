# Backend Integration Guide

This document explains how to integrate the EcoToken frontend with your backend API.

## 🏗️ Project Structure

```
frontend-part-1/
├── types/api.ts          # TypeScript interfaces for API data
├── lib/api.ts            # API service functions
├── hooks/useApi.ts       # React hooks for API calls
├── app/page.tsx          # Main dashboard component
└── BACKEND_INTEGRATION.md # This file
```

## 📋 Required API Endpoints

### Authentication Endpoints

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| POST | `/api/auth/login` | User login | `{ email, password }` | `{ user, token, refreshToken }` |
| POST | `/api/auth/register` | User registration | `{ email, password, username }` | `{ user, token, refreshToken }` |
| GET | `/api/auth/me` | Get current user | Headers: `Authorization: Bearer <token>` | `{ user }` |

### Metrics Endpoints

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| GET | `/api/metrics` | Get environmental metrics | Headers: `Authorization: Bearer <token>` | `{ today, week, month }` |
| PUT | `/api/metrics/goals` | Update user goals | `{ water?, co2?, electricity? }` | `{}` |

### Activities Endpoints

| Method | Endpoint | Description | Query Params | Response |
|--------|----------|-------------|--------------|----------|
| GET | `/api/activities` | Get user activities | `page`, `limit`, `category`, `startDate`, `endDate` | `{ items, total, page, limit, hasNext, hasPrev }` |
| POST | `/api/activities` | Create new activity | `{ action, impact, category }` | `{ activity }` |

## 🔧 Data Models

### User Model
```typescript
interface User {
  id: string;
  username: string;
  email: string;
  ecoScore: number;
  streak: number;
  profileImage?: string;
  createdAt: string;
  updatedAt: string;
}
```

### Environmental Metrics Model
```typescript
interface EnvironmentalMetrics {
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

interface TimePeriodMetrics {
  today: EnvironmentalMetrics;
  week: EnvironmentalMetrics;
  month: EnvironmentalMetrics;
}
```

### Activity Model
```typescript
interface EcoActivity {
  id: string;
  userId: string;
  action: string; // e.g., "ChatGPT Prompt optimized"
  impact: {
    water?: number;
    co2?: number;
    electricity?: number;
  };
  timestamp: string; // ISO date string
  ecoScoreChange?: number;
  category: "ai" | "media" | "communication" | "general";
}
```

## 🚀 Getting Started

### 1. Update API Configuration

In `lib/api.ts`, update the base URL:
```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://your-backend-url.com/api';
```

### 2. Environment Variables

Create a `.env.local` file:
```bash
NEXT_PUBLIC_API_URL=http://your-backend-url.com/api
```

### 3. Enable API Hooks

In `app/page.tsx`, uncomment the API hook imports:
```typescript
import { useMetrics, useActivities, useCurrentUser } from '@/hooks/useApi';
```

### 4. Replace Mock Data

Replace the mock data sections in `app/page.tsx` with real API calls:

```typescript
// Replace this:
const metrics = { /* mock data */ }

// With this:
const { data: metrics, loading: metricsLoading, error: metricsError } = useMetrics();
```

## 🔄 Integration Steps

### Step 1: Authentication Flow
1. User logs in via `/api/auth/login`
2. Store JWT token in localStorage
3. Include token in all subsequent API calls

### Step 2: Data Fetching
1. Use `useMetrics()` hook to get environmental data
2. Use `useActivities()` hook to get user activities
3. Use `useCurrentUser()` hook to get user profile

### Step 3: Real-time Updates
1. Implement WebSocket connections for live data
2. Use `useRealtimeMetrics()` hook for automatic refresh
3. Update UI when new activities are created

## 🎯 Key Integration Points

### 1. Metrics Calculation
The backend should calculate:
- Daily, weekly, and monthly environmental savings
- Progress towards user-defined goals
- Eco score based on environmental impact

### 2. Activity Tracking
When users perform eco-friendly actions:
1. Frontend calls `POST /api/activities`
2. Backend calculates environmental impact
3. Backend updates user metrics
4. Backend updates eco score and streak

### 3. Goal Management
Users can set custom goals:
- Water usage goals (gallons per week)
- CO2 emission goals (kg per week)
- Electricity usage goals (kWh per week)

## 🔍 Testing the Integration

### 1. Start the Frontend
```bash
cd frontend-part-1
npm install --legacy-peer-deps
npm run dev
```

### 2. Test API Endpoints
Use tools like Postman or curl to test your backend endpoints:
```bash
curl -X GET http://your-backend-url.com/api/metrics \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 3. Check Browser Network Tab
Monitor API calls in the browser's developer tools to ensure proper communication.

## 🐛 Common Issues

### CORS Errors
Make sure your backend allows requests from `http://localhost:3000`:
```python
# Python Flask example
from flask_cors import CORS
CORS(app, origins=["http://localhost:3000"])
```

### Authentication Issues
- Ensure JWT tokens are properly formatted
- Check token expiration handling
- Verify token storage in localStorage

### Data Format Mismatches
- Ensure backend responses match TypeScript interfaces
- Check date formatting (use ISO strings)
- Verify number types and units

## 📞 Support

If you encounter issues:
1. Check the browser console for errors
2. Verify API endpoints are accessible
3. Ensure data formats match the TypeScript interfaces
4. Check CORS configuration on the backend

## 🔄 Next Steps

1. **Implement Authentication**: Set up login/register functionality
2. **Connect Metrics**: Replace mock data with real API calls
3. **Add Activity Creation**: Implement activity tracking
4. **Real-time Updates**: Add WebSocket support for live data
5. **Error Handling**: Implement proper error states and loading indicators
6. **Testing**: Add unit tests for API integration
