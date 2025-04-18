"use client";

import { Button } from "@/components/ui/button";
import { Code, FileText, GitCompare } from "lucide-react";
import { usePopupContext } from "@/context/popup-context";

export default function Home() {
  const { openJsonFormatter, openJsonDiff, openTextDiff } = usePopupContext();

  const tools = [
    {
      title: "JSON Formatter",
      description:
        "Format, validate, and beautify your JSON data with customizable indentation.",
      icon: <Code className="h-10 w-10" />,
      action: openJsonFormatter,
    },
    {
      title: "JSON Diff Checker",
      description:
        "Compare two JSON objects and highlight the differences between them.",
      icon: <GitCompare className="h-10 w-10" />,
      action: openJsonDiff,
    },
    {
      title: "Text Diff Checker",
      description:
        "Compare two text blocks and see the differences highlighted line by line.",
      icon: <FileText className="h-10 w-10" />,
      action: openTextDiff,
    },
  ];

  return (
    <div className="container py-8 md:py-12 lg:py-24 space-y-12 md:space-y-24">
      <section className="mx-auto flex max-w-[980px] flex-col items-center gap-4 text-center">
        <h1 className="text-3xl font-bold leading-tight tracking-tighter md:text-5xl lg:text-6xl lg:leading-[1.1]">
          Developer Tools
        </h1>
        <p className="max-w-[750px] text-lg text-muted-foreground sm:text-xl">
          Fast, efficient, and free online tools for developers. No sign-up
          required.
        </p>
      </section>

      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool) => (
          <div
            key={tool.title}
            className="group relative overflow-hidden rounded-lg border bg-background p-6 text-left shadow-md transition-all hover:shadow-lg cursor-pointer"
          >
            <div className="flex h-full flex-col justify-between">
              <div className="space-y-2">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-md border bg-muted">
                  {tool.icon}
                </div>
                <h3 className="text-xl font-bold">{tool.title}</h3>
                <p className="text-muted-foreground">{tool.description}</p>
              </div>
              <Button className="mt-4 w-full" onClick={tool.action}>
                Try it now
              </Button>
            </div>
          </div>
        ))}
      </section>

      <section className="mx-auto max-w-[980px] text-center">
        <h2 className="text-2xl font-bold leading-tight tracking-tighter md:text-3xl">
          Why use our tools?
        </h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg border bg-card p-6">
            <h3 className="font-bold">Privacy First</h3>
            <p className="text-sm text-muted-foreground">
              All processing happens in your browser. Your data never leaves
              your device.
            </p>
          </div>
          <div className="rounded-lg border bg-card p-6">
            <h3 className="font-bold">Lightning Fast</h3>
            <p className="text-sm text-muted-foreground">
              Built with performance in mind. No waiting for server responses.
            </p>
          </div>
          <div className="rounded-lg border bg-card p-6">
            <h3 className="font-bold">No Sign-up</h3>
            <p className="text-sm text-muted-foreground">
              Use all tools without creating an account or providing any
              personal information.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
