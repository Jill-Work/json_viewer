import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function PrivacyPage() {
  return (
    <div className="container py-8 space-y-8">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="text-3xl font-bold">Privacy Policy</h1>
        <p className="text-muted-foreground mt-2">How we handle your data</p>
      </div>

      <Card className="mx-auto max-w-3xl">
        <CardHeader>
          <CardTitle>Privacy Policy</CardTitle>
          <CardDescription>Last updated: April 2023</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <h2 className="text-xl font-semibold">Data Collection</h2>
          <p>
            We do not collect, store, or process any personal data from our users. All operations performed on this
            website are executed entirely within your browser. Your data never leaves your device or is transmitted to
            our servers.
          </p>

          <h2 className="text-xl font-semibold">Local Storage</h2>
          <p>
            We use local storage to save your theme preferences and settings. This information is stored locally on your
            device and is not accessible to us or any third parties.
          </p>

          <h2 className="text-xl font-semibold">Cookies</h2>
          <p>
            This website does not use cookies for tracking or advertising purposes. We may use essential cookies for
            maintaining your session state while using the website.
          </p>

          <h2 className="text-xl font-semibold">Third-Party Services</h2>
          <p>
            We do not integrate with any third-party analytics, advertising, or tracking services. Your usage of this
            website is completely private.
          </p>

          <h2 className="text-xl font-semibold">Changes to This Policy</h2>
          <p>
            We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new
            Privacy Policy on this page.
          </p>

          <h2 className="text-xl font-semibold">Contact Us</h2>
          <p>If you have any questions about this Privacy Policy, please contact us at privacy@devtools.example.com.</p>
        </CardContent>
      </Card>
    </div>
  )
}
