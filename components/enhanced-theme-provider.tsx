"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import SunCalc from "suncalc"

type ThemeMode = "light" | "dark" | "auto"

interface LocationData {
  latitude: number
  longitude: number
  city?: string
  country?: string
}

interface ThemeContextType {
  mode: ThemeMode
  setMode: (mode: ThemeMode) => void
  actualTheme: "light" | "dark"
  location: LocationData | null
  setLocation: (location: LocationData | null) => void
  isDay: boolean | null
  isLocating: boolean
  requestLocation: () => void
  sunTimes: { sunrise: Date; sunset: Date } | null
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function EnhancedThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>("auto")
  const [actualTheme, setActualTheme] = useState<"light" | "dark">("light")
  const [location, setLocation] = useState<LocationData | null>(null)
  const [isDay, setIsDay] = useState<boolean | null>(null)
  const [isLocating, setIsLocating] = useState(false)
  const [sunTimes, setSunTimes] = useState<{ sunrise: Date; sunset: Date } | null>(null)
  const [mounted, setMounted] = useState(false)

  // Handle mounting to avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  // Load saved preferences
  useEffect(() => {
    if (!mounted) return

    const savedMode = localStorage.getItem("theme-mode") as ThemeMode
    if (savedMode) {
      setMode(savedMode)
    }

    const savedLocation = localStorage.getItem("theme-location")
    if (savedLocation) {
      try {
        setLocation(JSON.parse(savedLocation))
      } catch (e) {
        console.error("Failed to parse saved location", e)
      }
    }
  }, [mounted])

  // Save preferences
  useEffect(() => {
    if (!mounted) return

    localStorage.setItem("theme-mode", mode)
    if (location) {
      localStorage.setItem("theme-location", JSON.stringify(location))
    }
  }, [mode, location, mounted])

  // Request location
  const requestLocation = () => {
    if (!navigator.geolocation) {
      console.error("Geolocation is not supported by this browser")
      return
    }

    setIsLocating(true)
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords

          // Try to get city and country from reverse geocoding
          let city, country
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`,
              { headers: { "Accept-Language": "en" } },
            )
            const data = await response.json()
            city = data.address?.city || data.address?.town || data.address?.village
            country = data.address?.country
          } catch (e) {
            console.error("Failed to get location name", e)
          }

          setLocation({ latitude, longitude, city, country })
        } catch (e) {
          console.error("Failed to get location", e)
        } finally {
          setIsLocating(false)
        }
      },
      (error) => {
        console.error("Error getting location", error)
        setIsLocating(false)
      },
      { timeout: 10000, enableHighAccuracy: false },
    )
  }

  // Calculate sun times and determine if it's day or night
  useEffect(() => {
    if (!mounted || !location) return

    const { latitude, longitude } = location
    const now = new Date()
    const times = SunCalc.getTimes(now, latitude, longitude)

    setSunTimes({
      sunrise: times.sunrise,
      sunset: times.sunset,
    })

    const isDayTime = now > times.sunrise && now < times.sunset
    setIsDay(isDayTime)

    if (mode === "auto") {
      setActualTheme(isDayTime ? "light" : "dark")
    }
  }, [location, mode, mounted])

  // Update actual theme based on mode
  useEffect(() => {
    if (!mounted) return

    if (mode === "light") {
      setActualTheme("light")
    } else if (mode === "dark") {
      setActualTheme("dark")
    } else if (mode === "auto" && isDay !== null) {
      setActualTheme(isDay ? "light" : "dark")
    }
  }, [mode, isDay, mounted])

  // Check time periodically to update theme if in auto mode
  useEffect(() => {
    if (!mounted || mode !== "auto" || !location || !sunTimes) return

    const checkTime = () => {
      const now = new Date()
      const isDayTime = now > sunTimes.sunrise && now < sunTimes.sunset
      if (isDayTime !== isDay) {
        setIsDay(isDayTime)
      }
    }

    const interval = setInterval(checkTime, 60000) // Check every minute
    return () => clearInterval(interval)
  }, [mode, location, sunTimes, isDay, mounted])

  // If not mounted yet, render children without theme provider to avoid hydration mismatch
  if (!mounted) {
    return <>{children}</>
  }

  return (
    <ThemeContext.Provider
      value={{
        mode,
        setMode,
        actualTheme,
        location,
        setLocation,
        isDay,
        isLocating,
        requestLocation,
        sunTimes,
      }}
    >
      <NextThemesProvider
        attribute="class"
        defaultTheme={actualTheme}
        enableSystem={false}
        value={{
          light: "light",
          dark: "dark",
        }}
      >
        {children}
      </NextThemesProvider>
    </ThemeContext.Provider>
  )
}

export function useEnhancedTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useEnhancedTheme must be used within an EnhancedThemeProvider")
  }
  return context
}
