import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function AboutPage() {
  return (
    <div className="container py-8 space-y-8">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="text-3xl font-bold">About DevTools</h1>
        <p className="text-muted-foreground mt-2">Fast, efficient tools for developers</p>
      </div>

      <Card className="mx-auto max-w-3xl">
        <CardHeader>
          <CardTitle>Our Mission</CardTitle>
          <CardDescription>Empowering developers with efficient tools</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            DevTools was created with a simple mission: to provide developers with fast, efficient, and free online
            tools that make their daily work easier. We believe that high-quality development tools should be accessible
            to everyone, regardless of their experience level or resources.
          </p>

          <h2 className="text-xl font-semibold">Our Tools</h2>
          <p>We currently offer three main tools:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>JSON Formatter</strong> - Format, validate, and minify your JSON data with customizable
              indentation and syntax highlighting.
            </li>
            <li>
              <strong>JSON Diff Checker</strong> - Compare two JSON objects and highlight the differences between them.
            </li>
            <li>
              <strong>Text Diff Checker</strong> - Compare two text blocks and see the differences highlighted line by
              line.
            </li>
          </ul>

          <h2 className="text-xl font-semibold">Privacy First</h2>
          <p>
            We are committed to protecting your privacy. All of our tools operate entirely within your browser, meaning
            your data never leaves your device. We don't track your usage, collect your data, or use cookies for
            advertising purposes.
          </p>

          <h2 className="text-xl font-semibold">Open Source</h2>
          <p>
            We believe in the power of open source software. Our codebase is available on GitHub, and we welcome
            contributions from the community.
          </p>

          <div className="pt-4">
            <p>
              Have suggestions or found a bug? Please visit our{" "}
              <Link href="https://github.com/example/devtools" className="text-primary underline">
                GitHub repository
              </Link>{" "}
              to submit an issue or contribute to the project.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
