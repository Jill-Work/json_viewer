"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

export interface ThemeProviderProps {
  children: React.ReactNode;
  attribute?: "class" | "data-theme"; // Restrict to valid theme attributes
  defaultTheme?: string;
  enableSystem?: boolean;
  disableTransitionOnChange?: boolean;
}

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}

// Re-export useTheme with correct types
export { useTheme } from "next-themes";

// Additional type exports for theme hooks
export type Theme = "dark" | "light" | "system";

export interface UseThemeProps {
  theme: Theme | undefined;
  setTheme: (theme: Theme) => void;
  themes: Theme[];
  systemTheme?: Theme;
  mode?: Theme;
  setMode?: (mode: Theme) => void;
}
