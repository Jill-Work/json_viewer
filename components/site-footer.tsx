"use client";

import dynamic from "next/dynamic";

const ThemeStatus = dynamic(() =>
  import("@/components/theme-status").then((mod) => mod.ThemeStatus)
);

export function SiteFooter() {
  return (
    <footer className="py-6 md:px-8 md:py-0">
      <div className="container flex flex-col items-center justify-end gap-4 md:h-24 md:flex-row">
        <ThemeStatus />
      </div>
    </footer>
  );
}
