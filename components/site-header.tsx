"use client";

import dynamic from "next/dynamic";
import { MainNav } from "./main-nav";
import { siteConfig } from "../config/site";

const ThemeToggle = dynamic(() =>
  import("./theme-toggle").then((mod) => mod.ThemeToggle)
);

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <MainNav items={siteConfig.mainNav} />
        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-2">
            <ThemeToggle />
          </nav>
        </div>
      </div>
    </header>
  );
}
