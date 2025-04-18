export type NavItem = {
  title: string;
  href: string;
  disabled?: boolean;
};

export type MainNavItem = NavItem;

export type SiteConfig = {
  name: string;
  description: string;
  mainNav: MainNavItem[];
};

export const siteConfig: SiteConfig = {
  name: "Dev Tools",
  description: "A collection of developer tools",
  mainNav: [
    {
      title: "JSON Formatter",
      href: "/json-formatter",
    },
    {
      title: "JSON Diff Checker",
      href: "/json-diff",
    },
    {
      title: "Text Diff Checker",
      href: "/text-diff",
    },
  ],
};
