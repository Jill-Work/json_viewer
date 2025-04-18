"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { usePopupContext } from "@/context/popup-context";

import { cn } from "../lib/utils";
import { MainNavItem } from "../config/site";

interface MainNavProps {
  items?: MainNavItem[];
}

export function MainNav({ items }: MainNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const {
    openJsonFormatter,
    openJsonDiff,
    openTextDiff,
    closeJsonFormatter,
    closeJsonDiff,
    closeTextDiff,
    isJsonFormatterOpen,
    isJsonDiffOpen,
    isTextDiffOpen,
  } = usePopupContext();

  const handleHomeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    closeJsonFormatter();
    closeJsonDiff();
    closeTextDiff();
    router.push("/");
  };

  const handleNavItemClick = (item: MainNavItem, e: React.MouseEvent) => {
    if (item.href === "/json-formatter") {
      e.preventDefault();
      openJsonFormatter();
    } else if (item.href === "/json-diff") {
      e.preventDefault();
      openJsonDiff();
    } else if (item.href === "/text-diff") {
      e.preventDefault();
      openTextDiff();
    }
  };

  return (
    <div className="flex gap-6 items-center">
      <Link
        href="/"
        onClick={handleHomeClick}
        className="flex items-center space-x-2 font-bold text-lg"
      >
        Dev Tools
      </Link>
      {items?.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          onClick={(e) => handleNavItemClick(item, e)}
          className={cn(
            "flex items-center text-sm font-medium transition-colors hover:text-foreground/80",
            pathname === item.href ? "text-foreground" : "text-foreground/60",
            item.disabled && "cursor-not-allowed opacity-80",
            // Add underline for active tool
            (item.href === "/json-formatter" && isJsonFormatterOpen) ||
              (item.href === "/json-diff" && isJsonDiffOpen) ||
              (item.href === "/text-diff" && isTextDiffOpen)
              ? "border-b-2 border-foreground pb-1"
              : ""
          )}
        >
          {item.title}
        </Link>
      ))}
    </div>
  );
}
