'use client';

import { useState } from 'react';
import { vessels as defaultVessels, warehouses as defaultWarehouses } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader } from 'lucide-react';

export default function SeedPage() {
  const [seeding, setSeeding] = useState(false);
  const [message, setMessage] = useState('');

  const handleSeed = () => {
    setSeeding(true);
    setMessage('Seeding in progress...');
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('vessels', JSON.stringify(defaultVessels));
        window.localStorage.setItem('warehouses', JSON.stringify(defaultWarehouses));
        window.localStorage.setItem('vesselLogs', JSON.stringify([]));
        window.localStorage.setItem('warehouseLogs', JSON.stringify([]));
      }
      setMessage('Successfully seeded local storage with initial data! You can now navigate to the admin pages to see the data.');
    } catch (error) {
      console.error("Error seeding local storage:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      setMessage(`An error occurred while seeding: ${errorMessage}`);
    } finally {
      setSeeding(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-8 bg-gray-50">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Seed Local Storage</CardTitle>
          <CardDescription>
            Click the button below to populate your browser's local storage with the initial set of vessel and warehouse data. This is required to get the application running with data.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          <Button onClick={handleSeed} disabled={seeding} size="lg">
            {seeding && <Loader className="mr-2 h-4 w-4 animate-spin" />}
            {seeding ? 'Seeding...' : 'Seed Data'}
          </Button>
          {message && (
            <p className="mt-4 text-sm text-center text-muted-foreground">{message}</p>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
