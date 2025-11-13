import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Welcome to your Firebase Studio App!</CardTitle>
          <CardDescription>
            This is a starter Next.js application. You can start editing it by
            telling me what you want to change.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>Here are some things you can ask me to do:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>&quot;Change the background color to a dark gray&quot;</li>
            <li>&quot;Add a heading that says &apos;Hello World&apos;&quot;</li>
            <li>&quot;Create a button with the text &apos;Click me&apos;&quot;</li>
          </ul>
        </CardContent>
      </Card>
    </main>
  );
}
