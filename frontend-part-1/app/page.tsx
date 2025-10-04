"use client"

/**
 * EcoToken Dashboard - Main Application Page
 * 
 * This is the main dashboard component that displays:
 * - Environmental metrics (water, CO2, electricity savings)
 * - User goals and progress tracking
 * - Recent eco-friendly activities
 * - Eco score and streak
 * 
 * BACKEND INTEGRATION POINTS:
 * - Line 25-30: Mock data - replace with real API calls
 * - Line 32-60: Mock goals - replace with user-specific goals from backend
 * - Line 178-196: Mock activities - replace with real activity feed
 * - Line 201-217: Mock eco score - replace with calculated score from backend
 */

import { useState, useEffect } from "react"
import Image from "next/image"
import { Card } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Droplet, Wind, Zap, Clock, Award, User } from "lucide-react"
import { Button } from "@/components/ui/button"

// Import API hooks (uncomment when backend is ready)
// import { useMetrics, useActivities, useCurrentUser } from '@/hooks/useApi';

export default function EcoTokenDashboard() {
  const [activeTab, setActiveTab] = useState("today")
  const [goalType, setGoalType] = useState<"co2" | "water" | "electricity">("co2")
  const [currentFact, setCurrentFact] = useState(0)

  // =============================================================================
  // ENVIRONMENTAL FACTS FOR ROTATION
  // =============================================================================
  
  const environmentalFacts = [
    "Google used 4.3B gallons water in 2021",
    "U.S. data centers: 163B gallons yearly", 
    "~2 liters water per 1 kWh energy",
    "Data centers = 3% global CO₂ emissions",
    "One GPT-4 query ≈ 0.43 Wh energy",
    "Training models: 493 tons CO₂ released",
    "AI may use 6.6B cubic meters water"
  ]

  // =============================================================================
  // MOCK DATA - REPLACE WITH REAL API CALLS
  // =============================================================================
  
  /**
   * TODO: Replace this mock data with real API calls using useMetrics() hook
   * Example:
   * const { data: metrics, loading: metricsLoading, error: metricsError } = useMetrics();
   */
  const metrics = {
    today: { water: 2.7, co2: 14.5, electricity: 47 },
    week: { water: 18.9, co2: 101.5, electricity: 329 },
    month: { water: 81.2, co2: 436.8, electricity: 1410 },
  }

  /**
   * TODO: Replace this mock data with real user goals from backend
   * The backend should provide user-specific goals that can be customized
   */
  const goalConfigs = {
    co2: {
      current: 34, // This should come from backend: metrics.week.co2.saved
      target: 50,  // This should come from backend: user.co2Goal
      unit: "kg CO₂",
      progress: 68, // This should be calculated: (current / target) * 100
      icon: Wind,
      color: "emerald",
    },
    water: {
      current: 18.9, // This should come from backend: metrics.week.water.saved
      target: 30,    // This should come from backend: user.waterGoal
      unit: "Gallons",
      progress: 63,  // This should be calculated: (current / target) * 100
      icon: Droplet,
      color: "blue",
    },
    electricity: {
      current: 329,  // This should come from backend: metrics.week.electricity.saved
      target: 500,   // This should come from backend: user.electricityGoal
      unit: "kWh",
      progress: 66,  // This should be calculated: (current / target) * 100
      icon: Zap,
      color: "amber",
    },
  }

  // =============================================================================
  // AUTO-ROTATING GOAL DISPLAY (UI Enhancement)
  // =============================================================================
  
  /**
   * This creates a rotating display of different goal types
   * This is purely a UI feature and doesn't need backend integration
   */
  useEffect(() => {
    const interval = setInterval(() => {
      setGoalType((prev) => {
        if (prev === "co2") return "water"
        if (prev === "water") return "electricity"
        return "co2"
      })
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  /**
   * Rotate environmental facts every 4 seconds
   */
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFact((prev) => (prev + 1) % environmentalFacts.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [environmentalFacts.length])

  // =============================================================================
  // DATA PREPARATION
  // =============================================================================
  
  const currentMetrics = metrics[activeTab as keyof typeof metrics]
  const currentGoal = goalConfigs[goalType]
  const GoalIcon = currentGoal.icon

  // =============================================================================
  // MOCK ACTIVITIES DATA - REPLACE WITH REAL API CALLS
  // =============================================================================
  
  /**
   * TODO: Replace this mock data with real API calls using useActivities() hook
   * Example:
   * const { data: activitiesData, loading: activitiesLoading } = useActivities({ 
   *   limit: 10, 
   *   page: 1 
   * });
   * 
   * The backend should provide:
   * - Real user activities with timestamps
   * - Activity impact calculations
   * - Proper pagination
   */
  const mockActivities = [
    { action: "ChatGPT Prompt optimized", time: "12:30" },
    { action: "Image generation optimized", time: "12:30" },
    { action: "Text shortened", time: "12:30" },
    { action: "Code refactored for efficiency", time: "11:45" },
    { action: "Email draft compressed", time: "11:20" },
    { action: "Video quality adjusted", time: "10:55" },
    { action: "API calls batched", time: "10:30" },
  ]

  // =============================================================================
  // MOCK USER DATA - REPLACE WITH REAL API CALLS
  // =============================================================================
  
  /**
   * TODO: Replace this mock data with real API calls using useCurrentUser() hook
   * Example:
   * const { data: user, loading: userLoading } = useCurrentUser();
   * 
   * The backend should provide:
   * - Real eco score calculation based on user's environmental impact
   * - Real streak calculation based on consecutive days of eco-friendly actions
   */
  const mockUserData = {
    ecoScore: 8.5,
    streak: 12,
  }

  // =============================================================================
  // RENDER COMPONENT
  // =============================================================================
  
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-card border border-border rounded-xl shadow-2xl overflow-hidden">
        
        {/* =====================================================================
            HEADER SECTION - User Profile & App Branding
            ===================================================================== */}
        <div className="bg-gradient-to-br from-emerald-600 to-teal-700 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative w-12 h-12">
                <Image
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-iE7hcoZ7P7JhAeqqfx8OlI40Gtpipy.png"
                  alt="EcoToken Logo"
                  width={48}
                  height={48}
                  className="rounded-full"
                />
              </div>
              <div className="mt-2">
                <h1 className="text-2xl font-bold">EcoToken</h1>
                <p className="text-emerald-100 text-sm">your digital footprint reducer</p>
                {/* Powered by Snowflake branding */}
                <div className="flex items-center bg-white/10 backdrop-blur-sm px-2 py-1 rounded-full mt-1 w-fit">
                  <span className="text-xs font-medium text-white/90">Powered by</span>
                  <span className="text-xs font-bold text-white ml-1">Snowflake</span>
                </div>
              </div>
            </div>
            {/* TODO: Make this button functional - should open user profile/settings */}
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" aria-label="My Profile">
              <User className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* =====================================================================
            MAIN CONTENT SECTION
            ===================================================================== */}
        <div className="p-6 space-y-6">
          
          {/* =================================================================
              TIME PERIOD SELECTOR - Today/Week/Month Tabs
              ================================================================= */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="today">Today</TabsTrigger>
              <TabsTrigger value="week">Week</TabsTrigger>
              <TabsTrigger value="month">Month</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* =================================================================
              ENVIRONMENTAL METRICS CARDS - Water, CO2, Electricity
              ================================================================= */}
          <div className="grid grid-cols-3 gap-3">
            
            {/* Water Savings Card */}
            <Card className="p-4 bg-blue-500/10 border-blue-500/20">
              <div className="flex flex-col items-center text-center gap-2">
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <Droplet className="w-5 h-5 text-blue-500" />
                </div>
                <div className="text-2xl font-bold text-foreground">
                  {currentMetrics.water}
                </div>
                <div className="text-xs text-muted-foreground">Gallons</div>
                <div className="text-xs font-medium text-foreground">Water Saved</div>
              </div>
            </Card>

            {/* CO2 Savings Card */}
            <Card className="p-4 bg-emerald-500/10 border-emerald-500/20">
              <div className="flex flex-col items-center text-center gap-2">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                  <Wind className="w-5 h-5 text-emerald-500" />
                </div>
                <div className="text-2xl font-bold text-foreground">
                  {currentMetrics.co2}
                </div>
                <div className="text-xs text-muted-foreground">kg</div>
                <div className="text-xs font-medium text-foreground">CO₂ Saved</div>
              </div>
            </Card>

            {/* Electricity Savings Card */}
            <Card className="p-4 bg-amber-500/10 border-amber-500/20">
              <div className="flex flex-col items-center text-center gap-2">
                <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-amber-500" />
                </div>
                <div className="text-2xl font-bold text-foreground">
                  {currentMetrics.electricity}
                </div>
                <div className="text-xs text-muted-foreground">kWh</div>
                <div className="text-xs font-medium text-foreground">Energy Saved</div>
              </div>
            </Card>
          </div>

          {/* =================================================================
              GOALS PROGRESS SECTION - Rotating Goal Display
              ================================================================= */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <GoalIcon className={`w-4 h-4 text-${currentGoal.color}-500`} />
                <h3 className="font-semibold text-foreground">Weekly Savings Goal</h3>
              </div>
              <span className="text-sm font-bold text-emerald-500">
                {currentGoal.progress}%
              </span>
            </div>
            
            {/* Progress Bar */}
            <Progress value={currentGoal.progress} className="h-2 bg-muted" />
            
            {/* Goal Details */}
            <p className="text-xs text-muted-foreground mt-2">
              {currentGoal.current} {currentGoal.unit} / {currentGoal.target} {currentGoal.unit} goal
            </p>
            
            {/* Goal Type Selector Dots */}
            <div className="flex items-center justify-center gap-1.5 mt-3">
              <button
                onClick={() => setGoalType("co2")}
                className={`h-1.5 rounded-full transition-all ${
                  goalType === "co2" ? "w-6 bg-emerald-500" : "w-1.5 bg-muted-foreground/30"
                }`}
                aria-label="CO2 goal"
              />
              <button
                onClick={() => setGoalType("water")}
                className={`h-1.5 rounded-full transition-all ${
                  goalType === "water" ? "w-6 bg-blue-500" : "w-1.5 bg-muted-foreground/30"
                }`}
                aria-label="Water goal"
              />
              <button
                onClick={() => setGoalType("electricity")}
                className={`h-1.5 rounded-full transition-all ${
                  goalType === "electricity" ? "w-6 bg-amber-500" : "w-1.5 bg-muted-foreground/30"
                }`}
                aria-label="Electricity goal"
              />
            </div>
          </Card>

          {/* =================================================================
              RECENT ACTIVITIES FEED - User's Eco-Friendly Actions
              ================================================================= */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-foreground">Recent Activity</h3>
              <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground">
                Show all history
              </Button>
            </div>
            <div className="space-y-1 max-h-48 overflow-y-auto scrollbar-no-arrows">
              {mockActivities.map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/20 transition-colors">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0"></div>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm text-foreground">{item.action}</span>
                  </div>
                  <span className="text-xs text-muted-foreground flex-shrink-0">{item.time}</span>
                </div>
              ))}
            </div>
          </div>


          {/* =================================================================
              ENVIRONMENTAL FACT ROTATOR - Educational Information
              ================================================================= */}
          <Card className="p-4 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 border-blue-500/10">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Droplet className="w-4 h-4 text-blue-500" />
                <span className="text-xs font-medium text-muted-foreground">Did you know?</span>
              </div>
              <p className="text-sm text-foreground font-medium transition-all duration-500 ease-in-out">
                {environmentalFacts[currentFact]}
              </p>
              <div className="flex justify-center gap-1 mt-3">
                {environmentalFacts.map((_, index) => (
                  <div
                    key={index}
                    className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                      index === currentFact 
                        ? 'bg-blue-500 w-4' 
                        : 'bg-muted-foreground/30'
                    }`}
                  />
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}