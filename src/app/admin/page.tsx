'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building, Ship, ShieldAlert } from 'lucide-react';
import { useAuth } from '@/firebase'; 
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { firebaseApp } from '@/firebase/config';
import { Loader } from 'lucide-react';
import { WAREHOUSE_ADMINS, VESSEL_ADMINS } from '@/lib/admins';

export default function AdminHubPage() {
  const { user, loading } = useAuth(); 

  const handleLogin = async () => {
    try {
      const auth = getAuth(firebaseApp);
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      console.error("Authentication failed:", error);
      alert(`Login failed. An unknown error occurred. Please check the browser console for details.`);
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
  
  const canManageWarehouses = user.email && WAREHOUSE_ADMINS.includes(user.email);
  const canManageVessels = user.email && VESSEL_ADMINS.includes(user.email);
  const isAnyAdmin = canManageWarehouses || canManageVessels;


  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-8 bg-gray-50">
      <div className="w-full max-w-md text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">
          Admin Panel
        </h1>
        {isAnyAdmin ? (
          <div className="grid grid-cols-1 gap-8">
            {canManageWarehouses && (
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
            )}
            {canManageVessels && (
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
            )}
          </div>
        ) : (
           <Card className="w-full max-w-md text-center border-yellow-500">
            <CardHeader>
              <CardTitle className="flex items-center justify-center gap-2 text-yellow-600">
                <ShieldAlert className="h-6 w-6" />
                <span>Access Denied</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                You are logged in as <span className="font-semibold">{user.email}</span>, but this account is not authorized to access any admin panels.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}