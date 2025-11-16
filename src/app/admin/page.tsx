'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/context/language-context';
import { Building, Ship } from 'lucide-react';

export default function AdminHubPage() {
  const { t } = useTranslation();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-8 bg-gray-50">
      <div className="w-full max-w-md text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">
          {t('adminPanelTitle')}
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
