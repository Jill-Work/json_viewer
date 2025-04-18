"use client";

import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Upload,
  Download,
  Trash,
  X,
  CornerDownLeft,
  ArrowRightLeft,
} from "lucide-react";
import { usePopupContext } from "@/context/popup-context";

export function TextDiffPopup() {
  const { isTextDiffOpen, closeTextDiff, headerHeight } = usePopupContext();
  const { toast } = useToast();
  const [leftInput, setLeftInput] = useState("");
  const [rightInput, setRightInput] = useState("");
  const [diffResult, setDiffResult] = useState<any[]>([]);
  const [diffView, setDiffView] = useState<"side-by-side" | "inline">(
    "side-by-side"
  );
  const leftFileInputRef = useRef<HTMLInputElement>(null);
  const rightFileInputRef = useRef<HTMLInputElement>(null);
  const leftTextareaRef = useRef<HTMLTextAreaElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  // Animation states
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Handle popup opening and closing animations
  useEffect(() => {
    if (isTextDiffOpen) {
      setIsVisible(true);
      setIsAnimating(true);
      // Small delay to ensure DOM is updated before animation starts
      setTimeout(() => {
        setIsAnimating(false);
      }, 10);
    } else {
      setIsAnimating(true);
      // Wait for animation to complete before removing from DOM
      const timer = setTimeout(() => {
        setIsVisible(false);
        setIsAnimating(false);
      }, 300); // Match this with CSS transition duration
      return () => clearTimeout(timer);
    }
  }, [isTextDiffOpen]);

  // Handle ESC key to close popup
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isTextDiffOpen) {
        closeTextDiff();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isTextDiffOpen, closeTextDiff]);

  // Focus left textarea when popup opens
  useEffect(() => {
    if (isTextDiffOpen && leftTextareaRef.current) {
      setTimeout(() => {
        leftTextareaRef.current?.focus();
      }, 350); // Wait for animation to complete before focusing
    }
  }, [isTextDiffOpen]);

  const compareText = () => {
    if (!leftInput.trim() || !rightInput.trim()) {
      toast({
        title: "Empty input",
        description: "Please enter text in both editors to compare.",
        variant: "destructive",
      });
      return;
    }

    // Simple line-by-line diff implementation
    const leftLines = leftInput.split("\n");
    const rightLines = rightInput.split("\n");

    // Create a simple diff algorithm based on the Longest Common Subsequence (LCS) problem
    const result = diffLines(leftLines, rightLines);
    setDiffResult(result);

    toast({
      title: "Text compared",
      description: "The text comparison has been completed.",
    });
  };

  // A simple text diff algorithm
  const diffLines = (leftLines: string[], rightLines: string[]) => {
    const result: Array<{
      type: "unchanged" | "added" | "removed" | "modified";
      leftContent?: string;
      rightContent?: string;
      lineNumber: { left?: number; right?: number };
    }> = [];

    let leftIndex = 0;
    let rightIndex = 0;

    while (leftIndex < leftLines.length || rightIndex < rightLines.length) {
      // Both lines exist
      if (leftIndex < leftLines.length && rightIndex < rightLines.length) {
        if (leftLines[leftIndex] === rightLines[rightIndex]) {
          // Lines are identical
          result.push({
            type: "unchanged",
            leftContent: leftLines[leftIndex],
            rightContent: rightLines[rightIndex],
            lineNumber: { left: leftIndex + 1, right: rightIndex + 1 },
          });
          leftIndex++;
          rightIndex++;
        } else {
          // Lines are different - we need a more sophisticated approach
          const lookAheadLimit = 5; // Increase the look-ahead limit for better matches
          let foundMatch = false;

          // Check for additions (matched by looking ahead in right side)
          let rightLookAhead = 0;
          for (
            let i = 1;
            i <= lookAheadLimit && rightIndex + i < rightLines.length;
            i++
          ) {
            if (
              leftIndex < leftLines.length &&
              leftLines[leftIndex] === rightLines[rightIndex + i]
            ) {
              // Found a match after some additions
              rightLookAhead = i;
              foundMatch = true;
              break;
            }
          }

          // Check for removals (matched by looking ahead in left side)
          let leftLookAhead = 0;
          for (
            let i = 1;
            i <= lookAheadLimit && leftIndex + i < leftLines.length;
            i++
          ) {
            if (
              rightIndex < rightLines.length &&
              leftLines[leftIndex + i] === rightLines[rightIndex]
            ) {
              // Found a match after some removals
              leftLookAhead = i;
              // Only set foundMatch if we haven't found a better match in the right side
              // or if this match is closer (fewer lines to skip)
              if (!foundMatch || leftLookAhead < rightLookAhead) {
                foundMatch = true;
                rightLookAhead = 0; // Cancel the right match since this one is better
              }
              break;
            }
          }

          // Apply the best matching strategy
          if (foundMatch && rightLookAhead > 0) {
            // Handle additions - add all lines that were added
            for (let j = 0; j < rightLookAhead; j++) {
              result.push({
                type: "added",
                rightContent: rightLines[rightIndex + j],
                lineNumber: { right: rightIndex + j + 1 },
              });
            }
            rightIndex += rightLookAhead;
            // Don't increment leftIndex since it matches the current right line
          } else if (foundMatch && leftLookAhead > 0) {
            // Handle removals - add all lines that were removed
            for (let j = 0; j < leftLookAhead; j++) {
              result.push({
                type: "removed",
                leftContent: leftLines[leftIndex + j],
                lineNumber: { left: leftIndex + j + 1 },
              });
            }
            leftIndex += leftLookAhead;
            // Don't increment rightIndex since it matches the current left line
          } else {
            // If no good match was found, mark as modified
            result.push({
              type: "modified",
              leftContent: leftLines[leftIndex],
              rightContent: rightLines[rightIndex],
              lineNumber: { left: leftIndex + 1, right: rightIndex + 1 },
            });
            leftIndex++;
            rightIndex++;
          }
        }
      }
      // Only left lines remain
      else if (leftIndex < leftLines.length) {
        result.push({
          type: "removed",
          leftContent: leftLines[leftIndex],
          lineNumber: { left: leftIndex + 1 },
        });
        leftIndex++;
      }
      // Only right lines remain
      else if (rightIndex < rightLines.length) {
        result.push({
          type: "added",
          rightContent: rightLines[rightIndex],
          lineNumber: { right: rightIndex + 1 },
        });
        rightIndex++;
      }
    }

    return result;
  };

  const handleLeftUpload = () => {
    if (leftFileInputRef.current) {
      leftFileInputRef.current.click();
    }
  };

  const handleRightUpload = () => {
    if (rightFileInputRef.current) {
      rightFileInputRef.current.click();
    }
  };

  const handleFileChange = (
    side: "left" | "right",
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        const content = event.target.result as string;
        if (side === "left") {
          setLeftInput(content);
        } else {
          setRightInput(content);
        }
        toast({
          title: "File uploaded",
          description: `${file.name} has been loaded in the ${side} editor.`,
        });
      }
    };
    reader.readAsText(file);

    if (side === "left" && leftFileInputRef.current) {
      leftFileInputRef.current.value = "";
    } else if (side === "right" && rightFileInputRef.current) {
      rightFileInputRef.current.value = "";
    }
  };

  const handleDownload = (side: "left" | "right" | "diff") => {
    let content = "";
    let filename = "";

    if (side === "left") {
      content = leftInput;
      filename = "left-text.txt";
    } else if (side === "right") {
      content = rightInput;
      filename = "right-text.txt";
    } else if (side === "diff") {
      // Create a readable diff format
      content = diffResult
        .map((line) => {
          if (line.type === "unchanged") {
            return ` ${line.leftContent}`;
          } else if (line.type === "added") {
            return `+ ${line.rightContent}`;
          } else if (line.type === "removed") {
            return `- ${line.leftContent}`;
          } else {
            return `- ${line.leftContent}\n+ ${line.rightContent}`;
          }
        })
        .join("\n");
      filename = "diff-result.txt";
    }

    if (!content.trim()) {
      toast({
        title: "Nothing to download",
        description: `The ${side} editor is empty.`,
        variant: "destructive",
      });
      return;
    }

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "File downloaded",
      description: `Your ${side} content has been downloaded as ${filename}.`,
    });
  };

  const handleClear = (side: "left" | "right" | "both") => {
    if (side === "left" || side === "both") {
      setLeftInput("");
    }
    if (side === "right" || side === "both") {
      setRightInput("");
    }
    if (side === "both") {
      setDiffResult([]);
    }

    toast({
      title:
        side === "both"
          ? "Both editors cleared"
          : `${side.charAt(0).toUpperCase() + side.slice(1)} editor cleared`,
      description: "Content has been cleared.",
    });
  };

  const handleSwap = () => {
    const temp = leftInput;
    setLeftInput(rightInput);
    setRightInput(temp);
    toast({
      title: "Content swapped",
      description: "Left and right editor content has been swapped.",
    });
  };

  // Handle clicks outside the popup to close it
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (popupRef.current && e.target === e.currentTarget) {
      closeTextDiff();
    }
  };

  // Render the diff results
  const renderDiffResults = () => {
    if (!diffResult.length) return null;

    if (diffView === "side-by-side") {
      return (
        <div className="mt-4 p-4 bg-background/50 rounded-md border border-white/10 overflow-auto">
          <div className="flex">
            <div className="flex-1 border-r border-white/10 pr-2">
              <h3 className="text-sm font-medium mb-2">Left Text</h3>
            </div>
            <div className="flex-1 pl-2">
              <h3 className="text-sm font-medium mb-2">Right Text</h3>
            </div>
          </div>
          {diffResult.map((line, idx) => (
            <div key={idx} className="flex py-1">
              {/* Left side */}
              <div
                className={`flex-1 pr-2 ${
                  line.type === "added" ? "opacity-50" : ""
                }`}
              >
                <div className="flex">
                  <span className="text-xs font-mono w-8 text-muted-foreground">
                    {line.lineNumber.left || ""}
                  </span>
                  <pre
                    className={`text-sm font-mono flex-1 ${
                      line.type === "removed" || line.type === "modified"
                        ? "bg-red-500/20"
                        : ""
                    }`}
                  >
                    {line.leftContent || (line.type === "added" ? "\n" : "")}
                  </pre>
                </div>
              </div>

              {/* Right side */}
              <div
                className={`flex-1 pl-2 ${
                  line.type === "removed" ? "opacity-50" : ""
                }`}
              >
                <div className="flex">
                  <span className="text-xs font-mono w-8 text-muted-foreground">
                    {line.lineNumber.right || ""}
                  </span>
                  <pre
                    className={`text-sm font-mono flex-1 ${
                      line.type === "added" || line.type === "modified"
                        ? "bg-green-500/20"
                        : ""
                    }`}
                  >
                    {line.rightContent || (line.type === "removed" ? "\n" : "")}
                  </pre>
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    } else {
      // Inline view
      return (
        <div className="mt-4 p-4 bg-background/50 rounded-md border border-white/10 overflow-auto">
          <h3 className="text-sm font-medium mb-2">Unified Diff View</h3>
          {diffResult.map((line, idx) => (
            <div key={idx} className="flex py-1">
              <div className="flex items-start">
                <span className="text-xs font-mono w-8 text-muted-foreground mr-1">
                  {line.lineNumber.left || ""}
                </span>
                <span className="text-xs font-mono w-8 text-muted-foreground mr-1">
                  {line.lineNumber.right || ""}
                </span>
                <span className="font-mono text-muted-foreground w-4">
                  {line.type === "unchanged"
                    ? " "
                    : line.type === "added"
                    ? "+"
                    : line.type === "removed"
                    ? "-"
                    : "~"}
                </span>
                <pre
                  className={`text-sm font-mono ${
                    line.type === "unchanged"
                      ? ""
                      : line.type === "added"
                      ? "bg-green-500/20"
                      : line.type === "removed"
                      ? "bg-red-500/20"
                      : "bg-amber-500/20"
                  }`}
                >
                  {line.type === "added"
                    ? line.rightContent
                    : line.leftContent || ""}
                </pre>
                {line.type === "modified" && (
                  <pre className="text-sm font-mono bg-green-500/20 ml-2 pl-2 border-l border-white/10">
                    {line.rightContent}
                  </pre>
                )}
              </div>
            </div>
          ))}
        </div>
      );
    }
  };

  // Don't render anything if not visible
  if (!isVisible) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col transition-opacity duration-300 ease-in-out"
      style={{
        top: headerHeight,
        opacity: !isAnimating ? 1 : 0,
      }}
      onClick={handleBackdropClick}
    >
      {/* Semi-transparent background overlay */}
      <div
        className="absolute inset-0 bg-background/40 backdrop-blur-xl transition-all duration-300"
        style={{
          backdropFilter: !isAnimating ? "blur(16px)" : "blur(0px)",
        }}
      />

      {/* Popup container - full screen positioned below the header */}
      <div
        ref={popupRef}
        className="relative z-10 w-full h-full flex flex-col bg-background/30 backdrop-blur-md border-t border-white/10 transition-transform duration-300 ease-out"
        style={{
          transform: !isAnimating ? "translateY(0)" : "translateY(20px)",
        }}
      >
        {/* Header with title and close button */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-background/50">
          <h2 className="text-lg font-semibold">Text Diff Checker</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={closeTextDiff}
            className="h-8 w-8 rounded-full hover:bg-foreground/10"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-background/30">
          <div className="flex items-center space-x-4">
            <Button onClick={compareText} className="gap-1.5">
              <CornerDownLeft className="h-4 w-4" />
              Compare Text
            </Button>

            <Button onClick={handleSwap} variant="outline" className="gap-1.5">
              <ArrowRightLeft className="h-4 w-4" />
              Swap
            </Button>

            <div className="flex items-center space-x-2">
              <Label htmlFor="diffView">View:</Label>
              <Select
                value={diffView}
                onValueChange={(value) =>
                  setDiffView(value as "side-by-side" | "inline")
                }
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Side by Side" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="side-by-side">Side by Side</SelectItem>
                  <SelectItem value="inline">Inline</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-8"
              onClick={() => handleClear("both")}
            >
              <Trash className="h-3.5 w-3.5 mr-1" />
              Clear All
            </Button>
          </div>
        </div>

        {/* Editor area - Split view for text comparison */}
        <div className="flex-1 overflow-hidden">
          <div className="grid grid-cols-2 gap-4 h-full p-4">
            {/* Left text input */}
            <div className="flex flex-col h-full">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-medium">Left Text</h3>
                <div className="flex space-x-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0"
                    onClick={handleLeftUpload}
                  >
                    <Upload className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0"
                    onClick={() => handleDownload("left")}
                  >
                    <Download className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0"
                    onClick={() => handleClear("left")}
                  >
                    <Trash className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
              <Textarea
                ref={leftTextareaRef}
                value={leftInput}
                onChange={(e) => setLeftInput(e.target.value)}
                placeholder="Paste your left text here..."
                className="flex-1 resize-none font-mono text-sm p-4 rounded bg-background/30 backdrop-blur-sm focus-visible:ring-1 focus-visible:ring-offset-0 transition-all duration-300"
              />
            </div>

            {/* Right text input */}
            <div
              className="flex flex-col h-full transition-opacity duration-300 ease-in-out"
              style={{
                opacity: !isAnimating ? 1 : 0,
                transform: !isAnimating ? "translateX(0)" : "translateX(20px)",
              }}
            >
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-medium">Right Text</h3>
                <div className="flex space-x-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0"
                    onClick={handleRightUpload}
                  >
                    <Upload className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0"
                    onClick={() => handleDownload("right")}
                  >
                    <Download className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0"
                    onClick={() => handleClear("right")}
                  >
                    <Trash className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
              <Textarea
                value={rightInput}
                onChange={(e) => setRightInput(e.target.value)}
                placeholder="Paste your right text here..."
                className="flex-1 resize-none font-mono text-sm p-4 rounded bg-background/30 backdrop-blur-sm focus-visible:ring-1 focus-visible:ring-offset-0 transition-all duration-300"
              />
            </div>
          </div>

          {/* Diff results section */}
          {diffResult.length > 0 && (
            <div className="p-4 animate-in fade-in slide-in-from-bottom-5 duration-300">
              {renderDiffResults()}
            </div>
          )}
        </div>
      </div>

      {/* Hidden file inputs */}
      <input
        type="file"
        ref={leftFileInputRef}
        onChange={(e) => handleFileChange("left", e)}
        className="hidden"
        accept=".txt,.md,.js,.ts,.html,.css,.json,.xml,.csv,.yaml,.yml"
      />
      <input
        type="file"
        ref={rightFileInputRef}
        onChange={(e) => handleFileChange("right", e)}
        className="hidden"
        accept=".txt,.md,.js,.ts,.html,.css,.json,.xml,.csv,.yaml,.yml"
      />
    </div>
  );
}
