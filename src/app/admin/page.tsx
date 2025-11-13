'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { vessels as defaultVessels, warehouses as defaultWarehouses, type Vessel, type Warehouse } from '@/lib/data';
import { useTranslation } from '@/context/language-context';

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

  const handleSaveChanges = () => {
    localStorage.setItem('vessels', JSON.stringify(vesselData));
    localStorage.setItem('warehouses', JSON.stringify(warehouseData));
    alert(t('changesSaved'));
  };

  const handleVesselChange = (index: number, field: keyof Vessel, value: string | number) => {
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
                  <Label htmlFor={`status-${index}`}>{t('status')}</Label>
                  <Input id={`status-${index}`} value={vessel.status} onChange={(e) => handleVesselChange(index, 'status', e.target.value)} />
                </div>
                 <div className="space-y-2">
                  <Label htmlFor={`progress-${index}`}>{t('progress')}</Label>
                  <Input id={`progress-${index}`} type="number" value={vessel.progress} onChange={(e) => handleVesselChange(index, 'progress', parseInt(e.target.value, 10))} />
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
        </Card>
      </div>
    );
  }

  return (
    <main className="container mx-auto p-4 sm:p-8">
      <h1 className="text-3xl font-bold mb-8">{t('adminPanelTitle')}</h1>
      <AdminDashboard />
    </main>
  );
}
