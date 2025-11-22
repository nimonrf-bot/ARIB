'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building, Ship } from 'lucide-react';
import { useAuth } from '@/firebase'; 
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { firebaseApp } from '@/firebase/config';
import { Loader } from 'lucide-react';

export default function AdminHubPage() {
  const { user, loading } = useAuth(); 

  const handleLogin = async () => {
    try {
      const auth = getAuth(firebaseApp);
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      console.error("Authentication failed:", error);
      const errorMessage = error?.message || 'An unknown error occurred.';
      const errorCode = error?.code || 'undefined';
      alert(`Login failed. Code: ${errorCode}\nMessage: ${errorMessage}`);
    }
  };

  if (loading) {
    return (
       <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-8 bg-gray-50">
        <Loader className="h-8 w-8 animate-spin" />
      </main>
    );
  }

  if (!user) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-8 bg-gray-50">
        <div className="w-full max-w-md text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-8">
            Admin Panel
          </h1>
          <p className="text-muted-foreground mb-4">Please log in to manage the admin panels.</p>
          <Button onClick={handleLogin}>Log in with Google</Button>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-8 bg-gray-50">
      <div className="w-full max-w-md text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">
          Admin Panel
        </h1>
        <div className="grid grid-cols-1 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-center gap-2">
                <Building className="h-6 w-6" />
                <span>Manage Warehouses</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Update warehouse capacity, stock levels, and bin contents.
              </p>
              <Button asChild className="w-full">
                <Link href="/admin/warehouses">Go to Warehouse Admin</Link>
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-center gap-2">
                <Ship className="h-6 w-6" />
                <span>Manage Vessels</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Update vessel status, location, and ETA.
              </p>
              <Button asChild className="w-full">
                <Link href="/admin/ves_adm">Go to Vessel Admin</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
