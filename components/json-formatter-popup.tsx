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
  Check,
  Code,
  Minimize,
  Upload,
  Download,
  Copy,
  Trash,
  X,
  List,
} from "lucide-react";
import { usePopupContext } from "@/context/popup-context";
import { JsonTreeView } from "@/components/json-tree-view";
import { JsonSyntaxHighlighter } from "@/components/json-syntax-highlighter";

export function JsonFormatterPopup() {
  const { isJsonFormatterOpen, closeJsonFormatter, headerHeight } =
    usePopupContext();
  const { toast } = useToast();
  const [input, setInput] = useState("");
  const [parsedJson, setParsedJson] = useState<any>(null);
  const [indentation, setIndentation] = useState("2");
  const [isTreeView, setIsTreeView] = useState(false);
  const [isMinified, setIsMinified] = useState(false); // Track if minified
  const [autoFormat, setAutoFormat] = useState(true); // Track if auto-formatting is enabled
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  // Animation states
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Handle popup opening and closing animations
  useEffect(() => {
    if (isJsonFormatterOpen) {
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
  }, [isJsonFormatterOpen]);

  // Handle ESC key to close popup
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isJsonFormatterOpen) {
        closeJsonFormatter();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isJsonFormatterOpen, closeJsonFormatter]);

  // Helper function to handle JSON parsing and array-like inputs
  const tryParseJSON = (input: string) => {
    try {
      // First try parsing as-is
      return JSON.parse(input);
    } catch (e1) {
      try {
        // If it fails, check if it looks like multiple objects and try wrapping in array
        if (
          input.trim().startsWith("{") &&
          input.trim().endsWith("}") &&
          input.includes("},{")
        ) {
          return JSON.parse(`[${input}]`);
        }
        throw e1;
      } catch (e2) {
        throw e2;
      }
    }
  };

  // Auto-format JSON as user types, unless minified mode is active
  useEffect(() => {
    if (!autoFormat) {
      // Only update parsedJson for validation, don't auto-format
      if (input.trim()) {
        try {
          const parsed = tryParseJSON(input);
          setParsedJson(parsed);
        } catch (error) {
          setParsedJson(null);
        }
      } else {
        setParsedJson(null);
      }
      return;
    }
    // Auto-format logic
    if (input.trim()) {
      try {
        const parsed = tryParseJSON(input);
        setParsedJson(parsed);
        const formatted = JSON.stringify(
          parsed,
          null,
          Number.parseInt(indentation)
        );
        if (input !== formatted) {
          setInput(formatted);
        }
      } catch (error) {
        setParsedJson(null);
      }
    } else {
      setParsedJson(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input, indentation, autoFormat]);

  // Focus textarea when popup opens
  useEffect(() => {
    if (isJsonFormatterOpen && textareaRef.current) {
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 350); // Wait for animation to complete before focusing
    }
  }, [isJsonFormatterOpen]);

  const formatJSON = () => {
    try {
      if (!input.trim()) {
        toast({
          title: "Empty input",
          description: "Please enter some JSON to format.",
          variant: "destructive",
        });
        return;
      }

      const parsed = tryParseJSON(input);
      setParsedJson(parsed);
      const formatted = JSON.stringify(
        parsed,
        null,
        Number.parseInt(indentation)
      );
      setInput(formatted);
      setIsMinified(false);
      setAutoFormat(true); // Turn auto-formatting back on
      toast({
        title: "JSON formatted",
        description: "Your JSON has been formatted successfully.",
      });
    } catch (error) {
      toast({
        title: "Invalid JSON",
        description:
          error instanceof Error
            ? error.message
            : "Please make sure your JSON is properly formatted. For multiple objects, make sure they're wrapped in square brackets [].",
        variant: "destructive",
      });
    }
  };

  const validateJSON = () => {
    try {
      if (!input.trim()) {
        toast({
          title: "Empty input",
          description: "Please enter some JSON to validate.",
          variant: "destructive",
        });
        return;
      }

      tryParseJSON(input);
      toast({
        title: "Valid JSON",
        description: "Your JSON syntax is valid.",
      });
    } catch (error) {
      toast({
        title: "Invalid JSON",
        description:
          "Please check your JSON syntax. Make sure objects are properly formatted.",
        variant: "destructive",
      });
    }
  };

  const minifyJSON = () => {
    try {
      if (!input.trim()) {
        toast({
          title: "Empty input",
          description: "Please enter some JSON to minify.",
          variant: "destructive",
        });
        return;
      }

      // First validate and parse the JSON
      const parsed = tryParseJSON(input);

      // Create minified version (no whitespace)
      const minified = JSON.stringify(parsed);

      // Update state
      setInput(minified);
      setParsedJson(parsed);
      setIsMinified(true);
      setAutoFormat(false); // Stop auto-formatting

      toast({
        title: "JSON minified",
        description: "Your JSON has been minified successfully.",
      });
    } catch (error) {
      toast({
        title: "Invalid JSON",
        description: "Please make sure your JSON is valid before minifying.",
        variant: "destructive",
      });
    }
  };

  const handleUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setInput(event.target.result as string);
        toast({
          title: "File uploaded",
          description: `${file.name} has been loaded successfully.`,
        });
      }
    };
    reader.readAsText(file);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDownload = () => {
    if (!parsedJson) {
      toast({
        title: "Nothing to download",
        description: "The editor is empty.",
        variant: "destructive",
      });
      return;
    }

    const content = JSON.stringify(
      parsedJson,
      null,
      Number.parseInt(indentation)
    );
    const blob = new Blob([content], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "formatted.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "File downloaded",
      description: "Your JSON has been downloaded successfully.",
    });
  };

  const handleCopy = () => {
    if (!parsedJson) {
      toast({
        title: "Nothing to copy",
        description: "The editor is empty.",
        variant: "destructive",
      });
      return;
    }

    const content = JSON.stringify(
      parsedJson,
      null,
      Number.parseInt(indentation)
    );
    navigator.clipboard.writeText(content);
    toast({
      title: "Copied to clipboard",
      description: "JSON has been copied to your clipboard.",
    });
  };

  const handleClear = () => {
    if (!input.trim()) return;
    setInput("");
    setParsedJson(null);
    toast({
      title: "Editor cleared",
      description: "All content has been cleared.",
    });
  };

  // Handle clicks outside the popup to close it
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (popupRef.current && e.target === e.currentTarget) {
      closeJsonFormatter();
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

      {/* Popup container - now full screen and positioned below the header */}
      <div
        ref={popupRef}
        className="relative z-10 w-full h-full flex flex-col bg-background/30 backdrop-blur-md border-t border-white/10 transition-transform duration-300 ease-out"
        style={{
          transform: !isAnimating ? "translateY(0)" : "translateY(20px)",
        }}
      >
        {/* Removing header section entirely to eliminate white space */}

        {/* Toolbar - now becomes the first element right below the tabs */}
        <div className="flex items-center justify-between p-3 border-b border-white/10 bg-background/30">
          <div className="flex items-center space-x-4">
            <Button onClick={formatJSON} className="gap-1.5">
              <Code className="h-4 w-4" />
              Format
            </Button>

            <Button
              onClick={validateJSON}
              variant="outline"
              className="gap-1.5"
            >
              <Check className="h-4 w-4" />
              Validate
            </Button>

            <Button onClick={minifyJSON} variant="outline" className="gap-1.5">
              <Minimize className="h-4 w-4" />
              Minify
            </Button>

            <div className="flex items-center space-x-2">
              <Label htmlFor="indentation">Indentation:</Label>
              <Select value={indentation} onValueChange={setIndentation}>
                <SelectTrigger className="w-20">
                  <SelectValue placeholder="2" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">2</SelectItem>
                  <SelectItem value="3">3</SelectItem>
                  <SelectItem value="4">4</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              variant="outline"
              onClick={() => setIsTreeView(!isTreeView)}
              className="gap-1.5"
            >
              <List className="h-4 w-4 mr-1.5" />
              {isTreeView ? "Text View" : "Tree View"}
            </Button>
          </div>

          <div
            className="flex items-center space-x-2 transition-opacity duration-300 ease-in-out"
            style={{
              opacity: !isAnimating ? 1 : 0,
              transform: !isAnimating ? "translateY(0)" : "translateY(-10px)",
            }}
          >
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-8"
              onClick={handleUpload}
            >
              <Upload className="h-3.5 w-3.5 mr-1" />
              Upload
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-8"
              onClick={handleDownload}
            >
              <Download className="h-3.5 w-3.5 mr-1" />
              Download
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-8"
              onClick={handleCopy}
            >
              <Copy className="h-3.5 w-3.5 mr-1" />
              Copy
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-8"
              onClick={handleClear}
            >
              <Trash className="h-3.5 w-3.5 mr-1" />
              Clear
            </Button>
          </div>
        </div>

        {/* Editor area */}
        <div className="flex-1 overflow-hidden">
          <div
            className="relative h-full transition-all duration-300 ease-out"
            style={{
              opacity: !isAnimating ? 1 : 0,
              transform: !isAnimating ? "scale(1)" : "scale(0.98)",
            }}
          >
            <div className="relative h-full w-full">
              {!isTreeView ? (
                <div className="relative h-full">
                  {parsedJson && !isMinified ? (
                    <div className="h-full">
                      <JsonSyntaxHighlighter
                        json={JSON.stringify(
                          parsedJson,
                          null,
                          Number.parseInt(indentation)
                        )}
                        className="h-full p-4 bg-background/35 backdrop-blur-sm"
                      />
                      <Textarea
                        ref={textareaRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Paste your JSON here..."
                        className="absolute inset-0 h-full w-full resize-none font-mono text-sm p-4 rounded-none border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 transition-all duration-300"
                      />
                    </div>
                  ) : (
                    <Textarea
                      ref={textareaRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Paste your JSON here..."
                      className="h-full w-full resize-none font-mono text-sm p-4 rounded-none border-0 bg-background/35 backdrop-blur-sm focus-visible:ring-0 focus-visible:ring-offset-0 transition-all duration-300"
                    />
                  )}
                </div>
              ) : parsedJson ? (
                <div className="h-full w-full overflow-auto p-4 font-mono bg-background/30 backdrop-blur-sm">
                  <JsonTreeView data={parsedJson} />
                </div>
              ) : (
                <div className="h-full w-full p-4 flex items-center justify-center text-muted-foreground">
                  No valid JSON to display in tree view
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept=".json,.txt,.js,.ts"
      />
    </div>
  );
}
