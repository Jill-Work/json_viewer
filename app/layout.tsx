import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Toaster } from "@/components/ui/toaster";
import { PopupProvider } from "@/context/popup-context";
import { JsonFormatterPopup } from "@/components/json-formatter-popup";
import { JsonDiffPopup } from "@/components/json-diff-popup";
import { TextDiffPopup } from "@/components/text-diff-popup";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Dev Tools",
  description: "A collection of developer tools",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <PopupProvider>
            <div className="min-h-screen flex flex-col">
              <SiteHeader />
              <main className="flex-1" id="main-content">
                {children}
              </main>
              <SiteFooter />
            </div>
            {/* Popup components */}
            <JsonFormatterPopup />
            <JsonDiffPopup />
            <TextDiffPopup />
            <Toaster />
          </PopupProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
