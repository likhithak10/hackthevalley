import { useState, useEffect } from "react"
import { Droplet, Wind, Zap } from "lucide-react"

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
  
  const metrics = {
    today: { water: 2.7, co2: 14.5, electricity: 47 },
    week: { water: 18.9, co2: 101.5, electricity: 329 },
    month: { water: 81.2, co2: 436.8, electricity: 1410 },
  }

  const goalConfigs = {
    co2: {
      current: 34,
      target: 50,
      unit: "kg CO₂",
      progress: 68,
      icon: Wind,
      color: "emerald",
    },
    water: {
      current: 18.9,
      target: 30,
      unit: "Gallons",
      progress: 63,
      icon: Droplet,
      color: "blue",
    },
    electricity: {
      current: 329,
      target: 500,
      unit: "kWh",
      progress: 66,
      icon: Zap,
      color: "amber",
    },
  }

  // =============================================================================
  // AUTO-ROTATING GOAL DISPLAY (UI Enhancement)
  // =============================================================================
  
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
  // MOCK ACTIVITIES DATA
  // =============================================================================
  
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
  // RENDER COMPONENT
  // =============================================================================

  return (
    <div className="bg-gray-50 overflow-hidden" style={{ height: '600px' }}>
        <div className="w-full h-full bg-white overflow-hidden">
        
        {/* =====================================================================
            HEADER SECTION - User Profile & App Branding
            ===================================================================== */}
        <div className="bg-green-600 px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative w-12 h-12">
                <img
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-iE7hcoZ7P7JhAeqqfx8OlI40Gtpipy.png"
                  alt="EcoToken Logo"
                  width={48}
                  height={48}
                  className="rounded-full"
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">EcoToken</h1>
                <p className="text-white text-sm">your ecological footprint reducer</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Powered by Snowflake branding - moved to right side */}
              <div className="flex items-center bg-white/10 backdrop-blur-sm py-1 rounded-full w-fit" style={{ paddingLeft: '17px', paddingRight: '17px' }}>
                <span className="text-xs font-medium text-white/90">Powered by</span>
                <span className="text-xs font-bold text-white ml-1">Snowflake</span>
              </div>
            </div>
          </div>
        </div>

        {/* =====================================================================
            MAIN CONTENT SECTION
            ===================================================================== */}
        <div className="px-6 pb-6 space-y-3">
          
          {/* =================================================================
              TIME PERIOD SELECTOR - Today/Week/Month Tabs
              ================================================================= */}
          <div className="w-full mt-2">
            <div className="flex w-full bg-gray-200 rounded-full p-1 gap-1">
              <button
                onClick={() => setActiveTab("today")}
                className={`flex-1 py-2.5 px-4 text-sm font-semibold transition-all duration-300 rounded-full border-none ${
                  activeTab === "today"
                    ? "bg-white text-black shadow-sm"
                    : "bg-transparent text-black hover:text-gray-700"
                }`}
              >
                Today
              </button>
              <button
                onClick={() => setActiveTab("week")}
                className={`flex-1 py-2.5 px-4 text-sm font-semibold transition-all duration-300 rounded-full border-none ${
                  activeTab === "week"
                    ? "bg-white text-black shadow-sm"
                    : "bg-transparent text-black hover:text-gray-700"
                }`}
              >
                Week
              </button>
              <button
                onClick={() => setActiveTab("month")}
                className={`flex-1 py-2.5 px-4 text-sm font-semibold transition-all duration-300 rounded-full border-none ${
                  activeTab === "month"
                    ? "bg-white text-black shadow-sm"
                    : "bg-transparent text-black hover:text-gray-700"
                }`}
              >
                Month
              </button>
            </div>
          </div>

          {/* =================================================================
              ENVIRONMENTAL METRICS CARDS - Water, CO2, Electricity
              ================================================================= */}
          <div className="grid grid-cols-3 gap-3">
            
            {/* Water Savings Card */}
            <div className="bg-white p-4 rounded-2xl shadow-card">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Droplet className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-lg font-bold text-gray-900">
                    {currentMetrics.water} Cups
                  </div>
                  <div className="text-xs text-gray-500">Water Saved</div>
                </div>
              </div>
            </div>

            {/* CO2 Savings Card */}
            <div className="bg-white p-4 rounded-2xl shadow-card">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <Wind className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <div className="text-lg font-bold text-gray-900">
                    {currentMetrics.co2} kg
                  </div>
                  <div className="text-xs text-gray-500">CO₂ Saved</div>
                </div>
              </div>
            </div>

            {/* Electricity Savings Card */}
            <div className="bg-white p-4 rounded-2xl shadow-card">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <div className="text-lg font-bold text-gray-900">
                    {currentMetrics.electricity} kWh
                  </div>
                  <div className="text-xs text-gray-500">Energy Saved</div>
                </div>
              </div>
            </div>
          </div>

          {/* =================================================================
              GOALS PROGRESS SECTION - Rotating Goal Display
              ================================================================= */}
          <div className="bg-white py-6 px-6 rounded-2xl shadow-card">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 ml-4">
                <GoalIcon className={`w-4 h-4 text-${currentGoal.color}-600`} />
                <h3 className="font-semibold text-gray-900 text-sm">Weekly Savings Goal</h3>
              </div>
              <span className="text-sm font-bold text-green-600">
                {currentGoal.progress}%
              </span>
            </div>
            
            {/* Progress Bar - Using the working Progress component logic */}
            <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
              <div 
                className="bg-black h-2 rounded-full transition-all duration-300" 
                style={{ width: `${currentGoal.progress}%` }}
              />
            </div>
            
            {/* Goal Details */}
            <p className="text-xs text-gray-500 mb-3">
              {currentGoal.current} {currentGoal.unit} / {currentGoal.target} {currentGoal.unit} goal
            </p>
            
            {/* Goal Type Selector Dots */}
            <div className="flex items-center justify-center gap-1 mb-6">
              <button
                onClick={() => setGoalType("co2")}
                className={`h-1.5 rounded-full transition-all border-none ${
                  goalType === "co2" ? "w-6 bg-green-500" : "w-1.5 bg-gray-300"
                }`}
                aria-label="CO2 goal"
              />
              <button
                onClick={() => setGoalType("water")}
                className={`h-1.5 rounded-full transition-all border-none ${
                  goalType === "water" ? "w-6 bg-blue-500" : "w-1.5 bg-gray-300"
                }`}
                aria-label="Water goal"
              />
              <button
                onClick={() => setGoalType("electricity")}
                className={`h-1.5 rounded-full transition-all border-none ${
                  goalType === "electricity" ? "w-6 bg-yellow-500" : "w-1.5 bg-gray-300"
                }`}
                aria-label="Electricity goal"
              />
            </div>
          </div>

          {/* =================================================================
              RECENT ACTIVITIES FEED - User's Eco-Friendly Actions
              ================================================================= */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900">Recent Activity</h3>
              <button className="text-sm font-semibold text-gray-500 hover:text-gray-700 transition-colors border-none bg-transparent">
                Show all history
              </button>
            </div>
            <div className="space-y-2 custom-scrollbar" style={{ maxHeight: '80px', overflowY: 'auto' }}>
              {mockActivities.slice(0, 2).map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-2 hover:bg-gray-50 transition-colors rounded-lg">
                  <div className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0"></div>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm text-gray-700">{item.action}</span>
                  </div>
                  <span className="text-xs text-gray-500 flex-shrink-0">{item.time}</span>
                </div>
              ))}
            </div>
          </div>

          {/* =================================================================
              ENVIRONMENTAL FACT ROTATOR - Educational Information
              ================================================================= */}
          <div className="bg-pastel-blue p-4 rounded-2xl shadow-card">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-3">
                <Droplet className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-medium text-blue-700">Did you know?</span>
      </div>
              <p className="text-sm text-blue-900 font-medium transition-all duration-500 ease-in-out">
                {environmentalFacts[currentFact]}
              </p>
              <div className="flex justify-center gap-2 mt-4">
                {environmentalFacts.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index === currentFact 
                        ? 'bg-primary-blue w-6' 
                        : 'bg-gray-300'
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