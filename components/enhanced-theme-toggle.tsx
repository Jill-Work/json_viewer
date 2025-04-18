"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { Moon, Sun, SunMoon, MapPin, Loader2 } from "lucide-react"
import { useEnhancedTheme } from "./enhanced-theme-provider"
import { Badge } from "@/components/ui/badge"

export function EnhancedThemeToggle() {
  const [mounted, setMounted] = useState(false)
  const [hasEnhancedTheme, setHasEnhancedTheme] = useState(false)
  const { mode, setMode, actualTheme, location, isDay, isLocating, requestLocation, sunTimes } = useEnhancedTheme()

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
    try {
      useEnhancedTheme()
      setHasEnhancedTheme(true)
    } catch (error) {
      setHasEnhancedTheme(false)
    }
  }, [])

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="h-9 w-9">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="sr-only">Loading theme</span>
      </Button>
    )
  }

  if (!hasEnhancedTheme) {
    return (
      <Button variant="ghost" size="icon" className="h-9 w-9">
        <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9 relative">
          {mode === "auto" ? (
            <SunMoon className="h-4 w-4 rotate-0 scale-100 transition-all" />
          ) : actualTheme === "dark" ? (
            <Moon className="h-4 w-4 rotate-0 scale-100 transition-all" />
          ) : (
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all" />
          )}
          {mode === "auto" && (
            <Badge
              variant="outline"
              className="absolute -top-1 -right-1 h-3 w-3 p-0 rounded-full bg-primary border-background"
            />
          )}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Theme Preference</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => setMode("light")} className={mode === "light" ? "bg-accent" : ""}>
          <Sun className="mr-2 h-4 w-4" />
          <span>Light</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setMode("dark")} className={mode === "dark" ? "bg-accent" : ""}>
          <Moon className="mr-2 h-4 w-4" />
          <span>Dark</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setMode("auto")} className={mode === "auto" ? "bg-accent" : ""}>
          <SunMoon className="mr-2 h-4 w-4" />
          <span>Auto (Sunrise/Sunset)</span>
        </DropdownMenuItem>

        {mode === "auto" && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Location</DropdownMenuLabel>

            {location ? (
              <div className="px-2 py-1.5 text-sm">
                <div className="flex items-center">
                  <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>
                    {location.city && location.country
                      ? `${location.city}, ${location.country}`
                      : `${location.latitude.toFixed(2)}, ${location.longitude.toFixed(2)}`}
                  </span>
                </div>
                {sunTimes && (
                  <div className="mt-1 text-xs text-muted-foreground pl-6">
                    <div>
                      Sunrise: {sunTimes.sunrise.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </div>
                    <div>Sunset: {sunTimes.sunset.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
                    <div className="mt-1">
                      Currently: {isDay ? "Day" : "Night"} (Using {actualTheme} theme)
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <DropdownMenuItem onClick={requestLocation} disabled={isLocating}>
                {isLocating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    <span>Detecting location...</span>
                  </>
                ) : (
                  <>
                    <MapPin className="mr-2 h-4 w-4" />
                    <span>Detect my location</span>
                  </>
                )}
              </DropdownMenuItem>
            )}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// Export as default for dynamic import
export default { EnhancedThemeToggle }
