"use client";

import * as React from "react";
import { useTheme } from "@/components/theme-provider";
import type { Theme } from "@/components/theme-provider";

export function ThemeStatus() {
  const [mounted, setMounted] = React.useState(false);
  const { theme = "light", systemTheme = "light" } = useTheme();
  const currentTheme = theme === "system" ? systemTheme : theme;

  React.useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <div className="h-2 w-2 rounded-full bg-green-500" />
      {mounted
        ? `${
            currentTheme.charAt(0).toUpperCase() + currentTheme.slice(1)
          } Theme`
        : "Theme"}
    </div>
  );
}
