"use client";

import { useMemo } from "react";

interface JsonSyntaxHighlighterProps {
  json: string;
  className?: string;
}

export function JsonSyntaxHighlighter({
  json,
  className = "",
}: JsonSyntaxHighlighterProps) {
  const highlightedJson = useMemo(() => {
    try {
      // Replace JSON syntax with highlighted spans
      let processedJson = json
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(
          /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g,
          (match) => {
            let cls = "text-teal-700 dark:text-teal-300 font-semibold"; // number - darker in light theme
            if (/^"/.test(match)) {
              if (/:$/.test(match)) {
                cls = "text-violet-700 dark:text-violet-300 font-semibold"; // key - darker in light theme
              } else {
                cls = "text-yellow-700 dark:text-yellow-300"; // string - darker in light theme
              }
            } else if (/true|false/.test(match)) {
              cls = "text-blue-700 dark:text-blue-300 font-semibold"; // boolean - darker in light theme
            } else if (/null/.test(match)) {
              cls = "text-red-700 dark:text-red-300 font-semibold"; // null - darker in light theme
            }
            return `<span class="${cls}">${match}</span>`;
          }
        );

      // Replace all spaces with non-breaking spaces for consistent indentation
      processedJson = processedJson
        .split("\n")
        .map((line) => {
          // Preserve leading spaces for indentation
          const match = line.match(/^(\s+)/);
          if (match) {
            const leadingSpaces = match[1];
            const nbspSpaces = leadingSpaces.replace(/ /g, "&nbsp;");
            return line.replace(/^\s+/, nbspSpaces);
          }
          return line;
        })
        .join("<br>");

      return processedJson;
    } catch (e) {
      return json;
    }
  }, [json]);

  return (
    <pre
      className={`font-mono text-sm overflow-auto whitespace-pre-wrap break-all ${className}`}
      dangerouslySetInnerHTML={{ __html: highlightedJson }}
    />
  );
}
