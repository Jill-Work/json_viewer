"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
}

export default function TestPage() {
  const [results, setResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const runTests = async () => {
    setIsRunning(true);
    setResults([]);
    const tests = [
      testJsonFormatting,
      testJsonValidation,
      testThemeSwitch,
      testEmptyJson,
      testInvalidJson,
      testLargeJson,
    ];

    for (const test of tests) {
      try {
        await test();
      } catch (error) {
        console.error(`Test failed:`, error);
      }
    }
    setIsRunning(false);
  };

  // Test Functions
  const testJsonFormatting = async () => {
    try {
      const input = '{"a":1,"b":2}';
      const expected = `{
  "a": 1,
  "b": 2
}`;
      const parsedJSON = JSON.parse(input);
      const formatted = JSON.stringify(parsedJSON, null, 2);

      if (formatted === expected) {
        setResults((prev) => [
          ...prev,
          { name: "JSON Formatting", passed: true },
        ]);
      } else {
        throw new Error("Formatted JSON does not match expected output");
      }
    } catch (error) {
      setResults((prev) => [
        ...prev,
        {
          name: "JSON Formatting",
          passed: false,
          error: error instanceof Error ? error.message : "Unknown error",
        },
      ]);
    }
  };

  const testJsonValidation = async () => {
    try {
      const validJson = '{"valid": true}';
      const invalidJson = '{"invalid": true,}';

      // Test valid JSON
      JSON.parse(validJson);

      // Test invalid JSON
      try {
        JSON.parse(invalidJson);
        throw new Error("Invalid JSON was parsed successfully");
      } catch (error) {
        // This is expected
        setResults((prev) => [
          ...prev,
          { name: "JSON Validation", passed: true },
        ]);
        return;
      }

      throw new Error("Invalid JSON validation failed");
    } catch (error) {
      setResults((prev) => [
        ...prev,
        {
          name: "JSON Validation",
          passed: false,
          error: error instanceof Error ? error.message : "Unknown error",
        },
      ]);
    }
  };

  const testThemeSwitch = async () => {
    try {
      // Check if theme class exists
      const hasThemeClass =
        document.documentElement.classList.contains("light") ||
        document.documentElement.classList.contains("dark");

      if (!hasThemeClass) {
        throw new Error("Theme classes not found");
      }

      setResults((prev) => [
        ...prev,
        { name: "Theme Switching", passed: true },
      ]);
    } catch (error) {
      setResults((prev) => [
        ...prev,
        {
          name: "Theme Switching",
          passed: false,
          error: error instanceof Error ? error.message : "Unknown error",
        },
      ]);
    }
  };

  const testEmptyJson = async () => {
    try {
      const input = "";
      const formatted = input.trim()
        ? JSON.stringify(JSON.parse(input), null, 2)
        : "";

      if (formatted === "") {
        setResults((prev) => [
          ...prev,
          { name: "Empty JSON Handling", passed: true },
        ]);
      } else {
        throw new Error("Empty JSON not handled correctly");
      }
    } catch (error) {
      setResults((prev) => [
        ...prev,
        {
          name: "Empty JSON Handling",
          passed: false,
          error: error instanceof Error ? error.message : "Unknown error",
        },
      ]);
    }
  };

  const testInvalidJson = async () => {
    try {
      const invalidInputs = [
        '{"unclosed": "bracket"',
        '{"missing": value}',
        '{"trailing": "comma",}',
      ];

      let allFailed = true;
      for (const input of invalidInputs) {
        try {
          JSON.parse(input);
          allFailed = false;
          break;
        } catch {
          // Expected to fail
        }
      }

      if (allFailed) {
        setResults((prev) => [
          ...prev,
          { name: "Invalid JSON Detection", passed: true },
        ]);
      } else {
        throw new Error("Some invalid JSON was parsed successfully");
      }
    } catch (error) {
      setResults((prev) => [
        ...prev,
        {
          name: "Invalid JSON Detection",
          passed: false,
          error: error instanceof Error ? error.message : "Unknown error",
        },
      ]);
    }
  };

  const testLargeJson = async () => {
    try {
      const largeObject: Record<string, string> = {};
      for (let i = 0; i < 1000; i++) {
        largeObject[`key${i}`] = `value${i}`;
      }

      const input = JSON.stringify(largeObject);
      const formatted = JSON.stringify(JSON.parse(input), null, 2);

      if (formatted && formatted.includes("key999")) {
        setResults((prev) => [
          ...prev,
          { name: "Large JSON Handling", passed: true },
        ]);
      } else {
        throw new Error("Large JSON not handled correctly");
      }
    } catch (error) {
      setResults((prev) => [
        ...prev,
        {
          name: "Large JSON Handling",
          passed: false,
          error: error instanceof Error ? error.message : "Unknown error",
        },
      ]);
    }
  };

  return (
    <div className="container py-8">
      <Card className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">Test Suite</h1>
          <Button onClick={runTests} disabled={isRunning}>
            {isRunning ? "Running Tests..." : "Run Tests"}
          </Button>
        </div>

        <div className="space-y-4">
          {results.map((result, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg ${
                result.passed ? "bg-green-500/10" : "bg-red-500/10"
              }`}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-medium">{result.name}</h3>
                <span
                  className={`px-2 py-1 rounded text-sm ${
                    result.passed
                      ? "bg-green-500/20 text-green-700"
                      : "bg-red-500/20 text-red-700"
                  }`}
                >
                  {result.passed ? "PASSED" : "FAILED"}
                </span>
              </div>
              {result.error && (
                <p className="mt-2 text-sm text-red-600">{result.error}</p>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
