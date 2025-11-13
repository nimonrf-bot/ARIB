'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { vessels as defaultVessels, warehouses as defaultWarehouses, type Vessel, type Warehouse } from '@/lib/data';
import { useTranslation } from '@/context/language-context';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const portNames = [
  "Arib",
  "Astrakhan",
  "Makhachkala",
  "Caspian",
  "Anzali",
  "Amirabad",
  "Noshahr",
  "Freidunkenar"
];

function AdminDashboard() {
  const [vesselData, setVesselData] = useState<Vessel[]>(defaultVessels);
  const [warehouseData, setWarehouseData] = useState<Warehouse[]>(defaultWarehouses);
  const { t } = useTranslation();

  useEffect(() => {
    const savedVessels = localStorage.getItem('vessels');
    if (savedVessels) {
      setVesselData(JSON.parse(savedVessels));
    }
    const savedWarehouses = localStorage.getItem('warehouses');
    if (savedWarehouses) {
      setWarehouseData(JSON.parse(savedWarehouses));
    }
  }, []);

  const calculateProgress = (vessel: Vessel) => {
    const now = new Date();
    const start = new Date(vessel.departureDate);
    const end = new Date(vessel.etaDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || end <= start || now <= start) return 0;
    if (now >= end) return 100;
    const totalDuration = end.getTime() - start.getTime();
    const elapsedDuration = now.getTime() - start.getTime();
    return Math.min(100, Math.max(0, (elapsedDuration / totalDuration) * 100));
  };


  const handleSaveChanges = () => {
    for (const vessel of vesselData) {
      if (vessel.origin === vessel.destination) {
        alert(`Error: Departure and destination ports cannot be the same for vessel ${vessel.vesselName}.`);
        return;
      }
    }

    // When saving, if a vessel is anchored, we store the current calculated progress.
    // Otherwise, we can just store 0 and let it be calculated live.
    const vesselsToSave = vesselData.map(v => {
      if (v.anchored) {
        return { ...v, progress: calculateProgress(v) };
      }
      return v;
    });

    localStorage.setItem('vessels', JSON.stringify(vesselsToSave));
    localStorage.setItem('warehouses', JSON.stringify(warehouseData));
    setVesselData(vesselsToSave); // Update state to reflect saved progress
    alert(t('changesSaved'));
  };

  const handleVesselChange = (index: number, field: keyof Vessel, value: string | number | boolean) => {
    const newVessels = [...vesselData];
    (newVessels[index] as any)[field] = value;
    setVesselData(newVessels);
  };
  
  const handleWarehouseChange = (index: number, field: keyof Warehouse, value: string | number) => {
    const newWarehouses = [...warehouseData];
    (newWarehouses[index] as any)[field] = value;
    setWarehouseData(newWarehouses);
  };
  
  const handleWarehouseBinChange = (whIndex: number, binIndex: number, field: keyof Warehouse['bins'][0], value: string | number) => {
    const newWarehouses = [...warehouseData];
    (newWarehouses[whIndex].bins[binIndex] as any)[field] = value;
    setWarehouseData(newWarehouses);
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-4">{t('updateVesselInfo')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {vesselData.map((vessel, index) => (
            <Card key={vessel.id}>
              <CardHeader>
                <CardTitle>{vessel.vesselName}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor={`vessel-name-${index}`}>{t('vesselName')}</Label>
                  <Input id={`vessel-name-${index}`} value={vessel.vesselName} onChange={(e) => handleVesselChange(index, 'vesselName', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`cargo-${index}`}>{t('cargo')}</Label>
                  <Input id={`cargo-${index}`} value={vessel.cargo} onChange={(e) => handleVesselChange(index, 'cargo', e.target.value)} />
                </div>
                 <div className="space-y-2">
                  <Label htmlFor={`departure-port-${index}`}>{t('departurePort')}</Label>
                  <Select value={vessel.origin} onValueChange={(value) => handleVesselChange(index, 'origin', value)}>
                    <SelectTrigger id={`departure-port-${index}`}>
                      <SelectValue placeholder="Select a port" />
                    </SelectTrigger>
                    <SelectContent>
                      {portNames.map(port => <SelectItem key={port} value={port}>{port}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                 <div className="space-y-2">
                  <Label htmlFor={`destination-port-${index}`}>{t('destinationPort')}</Label>
                  <Select value={vessel.destination} onValueChange={(value) => handleVesselChange(index, 'destination', value)}>
                    <SelectTrigger id={`destination-port-${index}`}>
                      <SelectValue placeholder="Select a port" />
                    </SelectTrigger>
                    <SelectContent>
                      {portNames.map(port => <SelectItem key={port} value={port}>{port}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                 <div className="space-y-2">
                  <Label htmlFor={`departure-date-${index}`}>{t('departureDate')}</Label>
                  <Input id={`departure-date-${index}`} type="date" value={vessel.departureDate} onChange={(e) => handleVesselChange(index, 'departureDate', e.target.value)} />
                </div>
                 <div className="space-y-2">
                  <Label htmlFor={`eta-date-${index}`}>{t('etaDate')}</Label>
                  <Input id={`eta-date-${index}`} type="date" value={vessel.etaDate} onChange={(e) => handleVesselChange(index, 'etaDate', e.target.value)} />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id={`anchored-${index}`} checked={vessel.anchored} onCheckedChange={(checked) => handleVesselChange(index, 'anchored', !!checked)} />
                  <Label htmlFor={`anchored-${index}`}>{t('anchored')}</Label>
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`status-${index}`}>{t('status')}</Label>
                  <Input id={`status-${index}`} value={vessel.status} onChange={(e) => handleVesselChange(index, 'status', e.target.value)} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">{t('updateWarehouseInfo')}</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
           {warehouseData.map((warehouse, whIndex) => (
             <Card key={warehouse.id}>
                <CardHeader>
                  <CardTitle>{t('warehouse')} {warehouse.id}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>{t('warehouseName')}</Label>
                    <Input value={warehouse.name} onChange={e => handleWarehouseChange(whIndex, 'name', e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('totalCapacityT')}</Label>
                    <Input type="number" value={warehouse.totalCapacity} onChange={e => handleWarehouseChange(whIndex, 'totalCapacity', parseInt(e.target.value, 10))} />
                  </div>
                  {warehouse.bins.map((bin, binIndex) => (
                    <div key={bin.id} className="p-4 border rounded-md space-y-2">
                       <h4 className="font-semibold">{t('bin')} {bin.id}</h4>
                       <div className="space-y-2">
                          <Label>{t('commodity')}</Label>
                          <Input value={bin.commodity} onChange={e => handleWarehouseBinChange(whIndex, binIndex, 'commodity', e.target.value)} />
                       </div>
                       <div className="space-y-2">
                          <Label>{t('tonnage')}</Label>
                          <Input type="number" value={bin.tonnage} onChange={e => handleWarehouseBinChange(whIndex, binIndex, 'tonnage', parseInt(e.target.value, 10))} />
                       </div>
                    </div>
                  ))}
                </CardContent>
             </Card>
           ))}
        </div>
      </div>
      <Button size="lg" className="w-full" onClick={handleSaveChanges}>{t('saveChanges')}</Button>
    </div>
  );
}


export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { t } = useTranslation();

  const handleLogin = () => {
    // In a real application, this would be a secure check against a server.
    if (password === 'password') {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError(t('incorrectPassword'));
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle className="text-2xl">{t('adminLogin')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">{t('password')}</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button onClick={handleLogin} className="w-full">
              {t('login')}
            </Button>
          </CardContent>
           <CardFooter className="flex justify-center">
            <Link href="/" className="text-sm font-medium text-primary hover:underline">
              {t('statusPageLink')}
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <main className="container mx-auto p-4 sm:p-8">
      <div className="flex justify-between items-center w-full mb-8">
        <h1 className="text-3xl font-bold">{t('adminPanelTitle')}</h1>
         <Link href="/" className="text-sm font-medium text-primary hover:underline">
          {t('statusPageLink')}
        </Link>
      </div>
      <AdminDashboard />
    </main>
  );
}
