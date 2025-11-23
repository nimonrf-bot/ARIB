'use client';

import { useState } from 'react';
import { useFirestore, useAuth } from '@/firebase';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { collection, writeBatch, doc } from 'firebase/firestore';
import { vessels as defaultVessels, warehouses as defaultWarehouses } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader } from 'lucide-react';
import { firebaseApp } from '@/firebase/config';

export default function SeedPage() {
  const firestore = useFirestore();
  const { user, loading: authLoading } = useAuth();
  const [seeding, setSeeding] = useState(false);
  const [message, setMessage] = useState('');

  const handleLogin = async () => {
    try {
      const auth = getAuth(firebaseApp);
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      console.error("Authentication failed:", error);
      setMessage(`Login failed. An unknown error occurred. Please check the browser console for details.`);
    }
  };

  const handleSeed = async () => {
    if (!firestore || !user) {
      setMessage('You must be logged in to seed the database.');
      return;
    }
    setSeeding(true);
    setMessage('Seeding in progress...');
    try {
      const batch = writeBatch(firestore);

      const vesselsCollection = collection(firestore, 'vessels');
      defaultVessels.forEach((vessel) => {
        const { id, ...data } = vessel;
        const docRef = doc(vesselsCollection, String(id));
        batch.set(docRef, data);
      });

      const warehousesCollection = collection(firestore, 'warehouses');
      defaultWarehouses.forEach((warehouse) => {
        const { id, ...data } = warehouse;
        const docRef = doc(warehousesCollection, String(id));
        batch.set(docRef, data);
      });

      await batch.commit();
      setMessage('Successfully seeded the database with initial data! You can now navigate back to the home page.');
    } catch (error) {
      console.error("Error seeding database:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      setMessage(`An error occurred while seeding: ${errorMessage}`);
    } finally {
      setSeeding(false);
    }
  };

  if (authLoading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-8 bg-gray-50">
        <Loader className="h-8 w-8 animate-spin" />
        <p className="mt-4 text-muted-foreground">Authenticating...</p>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-8 bg-gray-50">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Seed Database</CardTitle>
          {user ? (
            <CardDescription>
              Welcome, {user.email}! Click the button below to populate your Firestore database with the initial set of vessel and warehouse data.
            </CardDescription>
          ) : (
            <CardDescription>
              Please log in with Google to seed the database. This is required to get the application running with data.
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          {user ? (
            <Button onClick={handleSeed} disabled={seeding || authLoading} size="lg">
              {seeding && <Loader className="mr-2 h-4 w-4 animate-spin" />}
              {seeding ? 'Seeding...' : 'Seed Database'}
            </Button>
          ) : (
            <Button onClick={handleLogin} size="lg" disabled={authLoading}>
              {authLoading ? 'Loading...' : 'Log in with Google to Seed'}
            </Button>
          )}
          {message && (
            <p className="mt-4 text-sm text-center text-muted-foreground">{message}</p>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
