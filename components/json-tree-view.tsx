"use client";

import { useState } from "react";
import { ChevronRight, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

interface JsonTreeViewProps {
  data: any;
  level?: number;
  expanded?: boolean;
}

export function JsonTreeView({
  data,
  level = 0,
  expanded = true,
}: JsonTreeViewProps) {
  const [isExpanded, setIsExpanded] = useState(expanded);
  const type = Array.isArray(data) ? "array" : typeof data;
  const indent = level * 20;

  if (type !== "object" && type !== "array") {
    return (
      <div style={{ paddingLeft: indent }} className="text-sm font-mono py-1">
        <span
          className={type === "string" ? "text-green-500" : "text-blue-500"}
        >
          {JSON.stringify(data)}
        </span>
      </div>
    );
  }

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const isEmpty = Object.keys(data).length === 0;

  return (
    <div style={{ paddingLeft: indent }}>
      <div className="flex items-center gap-1 text-sm font-mono">
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 hover:bg-transparent"
          onClick={toggleExpand}
        >
          {isEmpty ? null : isExpanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </Button>
        <span>
          {type === "array" ? "[" : "{"}
          {!isExpanded && "..."}
          {!isExpanded && (type === "array" ? "]" : "}")}
        </span>
      </div>
      {isExpanded && !isEmpty && (
        <div>
          {Object.entries(data).map(([key, value], index) => (
            <div key={key} className="flex">
              <div className="text-sm font-mono py-1">
                <span className="text-purple-500">
                  {type === "array" ? "" : `"${key}": `}
                </span>
              </div>
              <JsonTreeView data={value} level={level + 1} />
            </div>
          ))}
          <div style={{ paddingLeft: indent }} className="text-sm font-mono">
            {type === "array" ? "]" : "}"}
          </div>
        </div>
      )}
    </div>
  );
}
