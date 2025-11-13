import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>This is the Preview Panel!</CardTitle>
          <CardDescription>
            This is a starter Next.js application. You can start editing it by
            telling me what you want to change.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>Here are some things you can ask me to do:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>"Change the background color to a dark gray"</li>
            <li>"Add a heading that says 'Hello World'"</li>
            <li>"Create a button with the text 'Click me'"</li>
          </ul>
        </CardContent>
      </Card>
    </main>
  );
}
