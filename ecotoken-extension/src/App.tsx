"use client"

/**
 * EcoToken Dashboard - Chrome Extension Main App
 * 
 * This is the main dashboard component for the Chrome extension that displays:
 * - Environmental metrics (water, CO2, electricity savings)
 * - User goals and progress tracking
 * - Recent eco-friendly activities
 * - Environmental facts rotation
 * 
 * BACKEND INTEGRATION POINTS:
 * - Line 25-30: Mock data - replace with real API calls
 * - Line 32-60: Mock goals - replace with user-specific goals from backend
 * - Line 178-196: Mock activities - replace with real activity feed
 */

import { useState, useEffect } from "react"
import { Droplet, Wind, Zap, User } from "lucide-react"

export default function App() {
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

  const mockMetrics = {
    today: { water: 2.7, co2: 14.5, electricity: 47 },
    week: { water: 18.9, co2: 101.5, electricity: 329 },
    month: { water: 81.2, co2: 436.8, electricity: 1410 }
  }

  const mockGoals = {
    co2: { current: 34, target: 50, unit: "kg CO₂", progress: 68 },
    water: { current: 18.9, target: 30, unit: "Gallons", progress: 63 },
    electricity: { current: 329, target: 500, unit: "kWh", progress: 66 }
  }

  const mockActivities = [
    { action: "ChatGPT Prompt optimized", time: "12:30" },
    { action: "Image generation optimized", time: "12:30" },
    { action: "Text shortened", time: "12:30" },
    { action: "Code refactored for efficiency", time: "11:45" },
    { action: "Email draft compressed", time: "11:20" },
    { action: "Video quality adjusted", time: "10:55" },
    { action: "API calls batched", time: "10:30" }
  ]

  // =============================================================================
  // COMPUTED VALUES
  // =============================================================================

  const currentMetrics = mockMetrics[activeTab as keyof typeof mockMetrics]
  const currentGoal = mockGoals[goalType]

  // Goal icons mapping
  const goalIcons = {
    co2: Wind,
    water: Droplet,
    electricity: Zap
  }

  const GoalIcon = goalIcons[goalType]

  // =============================================================================
  // EFFECTS
  // =============================================================================

  /**
   * Rotate environmental facts every 4 seconds
   */
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFact((prev) => (prev + 1) % environmentalFacts.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [environmentalFacts.length])

  /**
   * Rotate goals every 5 seconds
   */
  useEffect(() => {
    const interval = setInterval(() => {
      setGoalType((prev) => {
        if (prev === "co2") return "water"
        if (prev === "water") return "electricity"
        return "co2"
      })
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  // =============================================================================
  // RENDER COMPONENT
  // =============================================================================
  
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-card border border-border rounded-xl shadow-2xl overflow-hidden">
        
        {/* =====================================================================
            HEADER SECTION - User Profile & App Branding
            ===================================================================== */}
        <div className="bg-gradient-to-br from-emerald-600 to-teal-700 p-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative w-12 h-12">
                <img
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
            <button className="text-white hover:bg-white/20 p-2 rounded-full transition-colors" aria-label="My Profile">
              <User className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* =================================================================
            MAIN CONTENT AREA - All Dashboard Components
            ================================================================= */}
        <div className="p-4 space-y-3">
          
          {/* =================================================================
              TIME PERIOD SELECTOR - Today/Week/Month Tabs
              ================================================================= */}
          <div className="flex bg-muted rounded-lg p-1">
            {Object.keys(mockMetrics).map((period) => (
              <button
                key={period}
                onClick={() => setActiveTab(period)}
                className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
                  activeTab === period
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </button>
            ))}
          </div>

          {/* =================================================================
              ENVIRONMENTAL METRICS CARDS - Water, CO2, Electricity
              ================================================================= */}
          <div className="grid grid-cols-3 gap-2">
            
            {/* Water Savings Card */}
            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <div className="flex flex-col items-center text-center gap-1">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <Droplet className="w-4 h-4 text-blue-500" />
                </div>
                <div className="text-xl font-bold text-foreground">
                  {currentMetrics.water}
                </div>
                <div className="text-xs text-muted-foreground">Gallons</div>
                <div className="text-xs font-medium text-foreground">Water Saved</div>
              </div>
            </div>

            {/* CO2 Savings Card */}
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
              <div className="flex flex-col items-center text-center gap-1">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                  <Wind className="w-4 h-4 text-emerald-500" />
                </div>
                <div className="text-xl font-bold text-foreground">
                  {currentMetrics.co2}
                </div>
                <div className="text-xs text-muted-foreground">kg</div>
                <div className="text-xs font-medium text-foreground">CO₂ Saved</div>
              </div>
            </div>

            {/* Electricity Savings Card */}
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
              <div className="flex flex-col items-center text-center gap-1">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-amber-500" />
                </div>
                <div className="text-xl font-bold text-foreground">
                  {currentMetrics.electricity}
                </div>
                <div className="text-xs text-muted-foreground">kWh</div>
                <div className="text-xs font-medium text-foreground">Energy Saved</div>
              </div>
            </div>
          </div>

          {/* =================================================================
              GOALS PROGRESS SECTION - Rotating Goal Display
              ================================================================= */}
          <div className="p-3 bg-card border border-border rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <GoalIcon className={`w-4 h-4 text-${goalType === 'co2' ? 'emerald' : goalType === 'water' ? 'blue' : 'amber'}-500`} />
                <h3 className="font-semibold text-foreground">Weekly Savings Goal</h3>
              </div>
              <div className="text-sm text-muted-foreground">
                {currentGoal.progress}%
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {goalType.toUpperCase()} Reduction
                </span>
                <span className="font-medium text-foreground">
                  {currentGoal.current} / {currentGoal.target} {currentGoal.unit}
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${
                    goalType === 'co2' ? 'bg-emerald-500' : 
                    goalType === 'water' ? 'bg-blue-500' : 'bg-amber-500'
                  }`}
                  style={{ width: `${currentGoal.progress}%` }}
                />
              </div>
            </div>
          </div>

          {/* =================================================================
              RECENT ACTIVITIES FEED - User's Eco-Friendly Actions
              ================================================================= */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-foreground">Recent Activity</h3>
              <button className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground transition-colors">
                Show all history
              </button>
            </div>
            <div className="space-y-1 max-h-24 overflow-y-auto scrollbar-no-arrows">
              {mockActivities.slice(0, 3).map((item, i) => (
                <div key={i} className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/20 transition-colors">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0"></div>
                  <div className="flex-1 min-w-0">
                    <span className="text-xs text-foreground">{item.action}</span>
                  </div>
                  <span className="text-xs text-muted-foreground flex-shrink-0">{item.time}</span>
                </div>
              ))}
            </div>
          </div>

          {/* =================================================================
              ENVIRONMENTAL FACT ROTATOR - Educational Information
              ================================================================= */}
          <div className="p-3 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 border border-blue-500/10 rounded-lg">
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
          </div>
        </div>
      </div>
    </div>
  )
}