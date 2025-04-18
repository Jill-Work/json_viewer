"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
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
import DiffMatchPatch from "diff-match-patch";
import { useTheme } from "next-themes";

export function JsonDiffPopup() {
  const { isJsonDiffOpen, closeJsonDiff, headerHeight } = usePopupContext();
  const { toast } = useToast();
  const [leftInput, setLeftInput] = useState("");
  const [rightInput, setRightInput] = useState("");
  const [diffSegments, setDiffSegments] = useState<any[]>([]);
  // Add a state to control whether to show the editable textareas or read-only diff view
  const [showDiffView, setShowDiffView] = useState(false);
  const { theme } = useTheme();
  const [isEditing, setIsEditing] = useState(true);

  // Replace autoCompareJson with logic that only sets diff if both sides are filled
  const autoCompareJson = useCallback(() => {
    if (isEditing) return;
    if (!leftInput.trim() || !rightInput.trim()) {
      setDiffSegments([]);
      setShowDiffView(false);
      return;
    }
    try {
      const dmp = new DiffMatchPatch();
      const diff = dmp.diff_main(leftInput, rightInput);
      dmp.diff_cleanupSemantic(diff);
      setDiffSegments(diff);
      if (diff.some(([op]: [number, string]) => op !== 0))
        setShowDiffView(true);
    } catch {
      setDiffSegments([]);
      setShowDiffView(false);
    }
  }, [leftInput, rightInput, isEditing]);

  // Replace compareJson with diff-match-patch
  const compareJson = () => {
    try {
      if (!leftInput.trim() || !rightInput.trim()) {
        toast({
          title: "Empty input",
          description: "Please enter JSON in both editors to compare.",
          variant: "destructive",
        });
        return;
      }
      const dmp = new DiffMatchPatch();
      const diff = dmp.diff_main(leftInput, rightInput);
      dmp.diff_cleanupSemantic(diff);
      setDiffSegments(diff);
      setShowDiffView(true);
      toast({
        title: "Text compared",
        description: "The text comparison has been completed.",
      });
    } catch (error) {
      toast({
        title: "Invalid input",
        description:
          error instanceof Error
            ? error.message
            : "Please check your input in both editors.",
        variant: "destructive",
      });
    }
  };

  // Handle file content updates
  const updateContent = useCallback(
    (side: "left" | "right", content: string) => {
      if (side === "left") {
        setLeftInput(content);
      } else {
        setRightInput(content);
      }
    },
    []
  );

  // Auto-compare when inputs change
  useEffect(() => {
    if (!isEditing) {
      let isSubscribed = true;
      const timer = setTimeout(() => {
        if (isSubscribed) {
          autoCompareJson();
        }
      }, 500); // Debounce for better performance

      return () => {
        isSubscribed = false;
        clearTimeout(timer);
      };
    }
  }, [autoCompareJson, isEditing]);

  const leftFileInputRef = useRef<HTMLInputElement>(null);
  const rightFileInputRef = useRef<HTMLInputElement>(null);
  const leftTextareaRef = useRef<HTMLTextAreaElement>(null);
  const rightTextareaRef = useRef<HTMLTextAreaElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  // Animation states
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Handle popup opening and closing animations
  useEffect(() => {
    if (isJsonDiffOpen) {
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
  }, [isJsonDiffOpen]);

  // Handle ESC key to close popup
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isJsonDiffOpen) {
        closeJsonDiff();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isJsonDiffOpen, closeJsonDiff]);

  // Focus left textarea when popup opens
  useEffect(() => {
    if (isJsonDiffOpen && leftTextareaRef.current) {
      setTimeout(() => {
        leftTextareaRef.current?.focus();
      }, 350); // Wait for animation to complete before focusing
    }
  }, [isJsonDiffOpen]);

  // Synchronize scrolling between left and right textareas
  useEffect(() => {
    const leftTextarea = leftTextareaRef.current;
    const rightTextarea = rightTextareaRef.current;

    if (!leftTextarea || !rightTextarea) return;

    const handleLeftScroll = () => {
      rightTextarea.scrollTop = leftTextarea.scrollTop;
      rightTextarea.scrollLeft = leftTextarea.scrollLeft;
    };

    const handleRightScroll = () => {
      leftTextarea.scrollTop = rightTextarea.scrollTop;
      leftTextarea.scrollLeft = rightTextarea.scrollLeft;
    };

    leftTextarea.addEventListener("scroll", handleLeftScroll);
    rightTextarea.addEventListener("scroll", handleRightScroll);

    return () => {
      leftTextarea.removeEventListener("scroll", handleLeftScroll);
      rightTextarea.removeEventListener("scroll", handleRightScroll);
    };
  }, [isJsonDiffOpen]);

  // This effect will run when diff result changes
  useEffect(() => {
    if (diffSegments.length > 0 && !showDiffView) {
      setShowDiffView(true);
    }
  }, [diffSegments, showDiffView]);

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
        try {
          // Try to prettify JSON
          const jsonObj = JSON.parse(content);
          const formatted = JSON.stringify(jsonObj, null, 2);
          if (side === "left") {
            updateContent("left", formatted);
          } else {
            updateContent("right", formatted);
          }
          toast({
            title: "File uploaded",
            description: `${file.name} has been loaded in the ${side} editor.`,
          });
        } catch (err) {
          // If it's not valid JSON, just set the raw content
          if (side === "left") {
            updateContent("left", content);
          } else {
            updateContent("right", content);
          }
          toast({
            title: "File uploaded",
            description: `${file.name} has been loaded, but it may not be valid JSON.`,
          });
        }
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
      filename = "left.json";
    } else if (side === "right") {
      content = rightInput;
      filename = "right.json";
    } else if (side === "diff") {
      content = JSON.stringify(diffSegments, null, 2);
      filename = "diff-result.json";
    }

    if (!content.trim()) {
      toast({
        title: "Nothing to download",
        description: `The ${side} editor is empty.`,
        variant: "destructive",
      });
      return;
    }

    const blob = new Blob([content], { type: "application/json" });
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
      setDiffSegments([]);
      // When clearing both sides, go back to edit mode
      setShowDiffView(false);
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

  // Add a function to switch back to edit mode
  const handleEditAgain = () => {
    setShowDiffView(false);
  };

  // Handle clicks outside the popup to close it
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (popupRef.current && e.target === e.currentTarget) {
      closeJsonDiff();
    }
  };

  const tryFormatJson = (input: string) => {
    try {
      const parsed = JSON.parse(input);
      return JSON.stringify(parsed, null, 2);
    } catch {
      return input;
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
        className="relative z-10 w-full h-full flex flex-col bg-background/40 backdrop-blur-md border-t border-white/10 transition-transform duration-300 ease-out"
        style={{
          transform: !isAnimating ? "translateY(0)" : "translateY(20px)",
        }}
      >
        {/* Header with title and close button */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-background/40">
          <div className="flex items-center space-x-4">
            {/* Remove the duplicate title "JSON Diff Checker" */}
            <Button
              onClick={() => {
                if (isEditing) {
                  // Format both JSONs before diff
                  const formattedLeft = tryFormatJson(leftInput);
                  const formattedRight = tryFormatJson(rightInput);
                  setLeftInput(formattedLeft);
                  setRightInput(formattedRight);
                  // Run diff
                  compareJson();
                  setIsEditing(false);
                } else {
                  setShowDiffView(false);
                  setIsEditing(true);
                }
              }}
              className="gap-1.5 min-w-[120px]"
            >
              {isEditing ? "Find Diff" : "Edit JSON"}
            </Button>

            <Button onClick={handleSwap} variant="outline" className="gap-1.5">
              <ArrowRightLeft className="h-4 w-4" />
              Swap
            </Button>

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

          <Button
            variant="ghost"
            size="icon"
            onClick={closeJsonDiff}
            className="h-8 w-8 rounded-full hover:bg-foreground/10"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Editor area - Code view for JSON editing and diff display */}
        <div className="flex-1 overflow-hidden">
          <div className="grid grid-cols-2 gap-4 h-full p-4">
            {/* Left JSON input and diff view */}
            <div className="flex flex-col h-full">
              <div className="flex justify-between items-center p-4">
                <h3 className="text-sm font-medium">Left JSON</h3>
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

              {/* Show either the textarea for editing or the diff view */}
              {isEditing || !showDiffView ? (
                <div className="px-4 pb-4 flex-1">
                  <Textarea
                    ref={leftTextareaRef}
                    value={leftInput}
                    onChange={(e) => setLeftInput(e.target.value)}
                    onBlur={() => {
                      const formatted = tryFormatJson(leftInput);
                      if (formatted !== leftInput) setLeftInput(formatted);
                    }}
                    placeholder="Paste your left JSON here..."
                    className="flex-1 resize-none font-mono text-base p-4 rounded bg-background/30 backdrop-blur-sm focus-visible:ring-1 focus-visible:ring-offset-0 transition-all duration-300 h-full"
                  />
                </div>
              ) : (
                <div className="px-4 pb-4 flex-1 overflow-hidden">
                  {diffSegments.length > 0 && (
                    <div className="h-full bg-background/40 rounded overflow-auto p-4 text-xs font-mono">
                      <div className="flex flex-col h-full">
                        <div className="w-full text-muted-foreground border-b border-muted pb-2 select-none">
                          Text Diff (highlighting differences)
                        </div>
                        <div className="pt-2 flex-1 overflow-auto">
                          <pre className="whitespace-pre-wrap text-base">
                            {diffSegments.map(
                              ([op, text], i) =>
                                op !== 1 && (
                                  <span
                                    key={i}
                                    className={
                                      op === -1
                                        ? theme === "dark"
                                          ? "bg-destructive text-destructive-foreground line-through"
                                          : "bg-destructive text-destructive-foreground line-through"
                                        : ""
                                    }
                                  >
                                    {text}
                                  </span>
                                )
                            )}
                          </pre>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right JSON input and diff view */}
            <div className="flex flex-col h-full">
              <div className="flex justify-between items-center p-4">
                <h3 className="text-sm font-medium">Right JSON</h3>
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

              {/* Show either the textarea for editing or the diff view */}
              {isEditing || !showDiffView ? (
                <div className="px-4 pb-4 flex-1">
                  <Textarea
                    ref={rightTextareaRef}
                    value={rightInput}
                    onChange={(e) => setRightInput(e.target.value)}
                    onBlur={() => {
                      const formatted = tryFormatJson(rightInput);
                      if (formatted !== rightInput) setRightInput(formatted);
                    }}
                    placeholder="Paste your right JSON here..."
                    className="flex-1 resize-none font-mono text-base p-4 rounded bg-background/30 backdrop-blur-sm focus-visible:ring-1 focus-visible:ring-offset-0 transition-all duration-300 h-full"
                  />
                </div>
              ) : (
                <div className="px-4 pb-4 flex-1 overflow-hidden">
                  {diffSegments.length > 0 && (
                    <div className="h-full bg-background/40 rounded overflow-auto p-4 text-xs font-mono">
                      <div className="flex flex-col h-full">
                        <div className="w-full text-muted-foreground border-b border-muted pb-2 select-none">
                          Text Diff (highlighting differences)
                        </div>
                        <div className="pt-2 flex-1 overflow-auto">
                          <pre className="whitespace-pre-wrap text-base">
                            {diffSegments.map(
                              ([op, text], i) =>
                                op !== -1 && (
                                  <span
                                    key={i}
                                    className={
                                      op === 1
                                        ? theme === "dark"
                                          ? "bg-primary text-primary-foreground"
                                          : "bg-primary text-primary-foreground"
                                        : ""
                                    }
                                  >
                                    {text}
                                  </span>
                                )
                            )}
                          </pre>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Hidden file inputs */}
      <input
        type="file"
        ref={leftFileInputRef}
        onChange={(e) => handleFileChange("left", e)}
        className="hidden"
        accept=".json,.txt,.js,.ts"
      />
      <input
        type="file"
        ref={rightFileInputRef}
        onChange={(e) => handleFileChange("right", e)}
        className="hidden"
        accept=".json,.txt,.js,.ts"
      />
    </div>
  );
}
