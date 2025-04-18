"use client"

import type React from "react"

import { useRef, useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Upload, Download, Copy, Trash } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface CodeEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  label?: string
  height?: string
  readOnly?: boolean
}

export function CodeEditor({
  value,
  onChange,
  placeholder = "Enter code here...",
  className,
  label,
  height = "h-[400px]",
  readOnly = false,
}: CodeEditorProps) {
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isFocused, setIsFocused] = useState(false)

  const handleUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      if (event.target?.result) {
        onChange(event.target.result as string)
        toast({
          title: "File uploaded",
          description: `${file.name} has been loaded successfully.`,
        })
      }
    }
    reader.readAsText(file)

    // Reset the input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleDownload = () => {
    if (!value.trim()) {
      toast({
        title: "Nothing to download",
        description: "The editor is empty.",
        variant: "destructive",
      })
      return
    }

    const blob = new Blob([value], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "download.txt"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "File downloaded",
      description: "Your content has been downloaded successfully.",
    })
  }

  const handleCopy = () => {
    if (!value.trim()) {
      toast({
        title: "Nothing to copy",
        description: "The editor is empty.",
        variant: "destructive",
      })
      return
    }

    navigator.clipboard.writeText(value)
    toast({
      title: "Copied to clipboard",
      description: "Content has been copied to your clipboard.",
    })
  }

  const handleClear = () => {
    if (!value.trim()) return
    onChange("")
    toast({
      title: "Editor cleared",
      description: "All content has been cleared.",
    })
  }

  return (
    <div className={cn("space-y-2", className)}>
      {label && <div className="text-sm font-medium">{label}</div>}
      <div className={cn("relative rounded-md border", height, isFocused && "ring-2 ring-ring")}>
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cn(
            "absolute inset-0 resize-none font-mono text-sm p-3 h-full w-full rounded-md",
            "focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none",
          )}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          readOnly={readOnly}
        />
      </div>
      <div className="flex items-center space-x-2">
        <Button type="button" size="sm" variant="outline" className="h-8" onClick={handleUpload} disabled={readOnly}>
          <Upload className="h-3.5 w-3.5 mr-1" />
          Upload
        </Button>
        <Button type="button" size="sm" variant="outline" className="h-8" onClick={handleDownload}>
          <Download className="h-3.5 w-3.5 mr-1" />
          Download
        </Button>
        <Button type="button" size="sm" variant="outline" className="h-8" onClick={handleCopy}>
          <Copy className="h-3.5 w-3.5 mr-1" />
          Copy
        </Button>
        <Button type="button" size="sm" variant="outline" className="h-8" onClick={handleClear} disabled={readOnly}>
          <Trash className="h-3.5 w-3.5 mr-1" />
          Clear
        </Button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept=".json,.txt,.js,.ts,.html,.css,.md"
        />
      </div>
    </div>
  )
}
