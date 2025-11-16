
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { warehouses as defaultWarehouses, type Warehouse, WarehouseBin } from '@/lib/data';
import { useTranslation } from '@/context/language-context';
import { Textarea } from '@/components/ui/textarea';
import { updateWarehouses } from '@/ai/flows/update-warehouses-flow';
import { Loader } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface ChangeLog {
  user: string;
  timestamp: string;
  changes: string[];
}

function WarehouseAdminDashboard() {
  const [warehouseData, setWarehouseData] = useState<Warehouse[]>(defaultWarehouses);
  const [aiUpdateText, setAiUpdateText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [logs, setLogs] = useState<ChangeLog[]>([]);
  const [currentUser, setCurrentUser] = useState('Admin');
  const { t } = useTranslation();

  useEffect(() => {
    const savedWarehouses = localStorage.getItem('warehouses');
    if (savedWarehouses) {
      setWarehouseData(JSON.parse(savedWarehouses));
    }
    const savedLogs = localStorage.getItem('warehouseLogs');
    if (savedLogs) {
      setLogs(JSON.parse(savedLogs));
    }
  }, []);

  const handleSaveChanges = () => {
    const savedWarehousesRaw = localStorage.getItem('warehouses');
    const oldWarehouseData: Warehouse[] = savedWarehousesRaw ? JSON.parse(savedWarehousesRaw) : defaultWarehouses;

    const changes: string[] = [];

    warehouseData.forEach((newWarehouse) => {
      const oldWarehouse = oldWarehouseData.find(w => w.id === newWarehouse.id);
      if (oldWarehouse) {
        // Check warehouse-level fields
        if (newWarehouse.name !== oldWarehouse.name) {
          changes.push(`Warehouse '${oldWarehouse.name}' -> '${newWarehouse.name}': Name updated.`);
        }
        if (newWarehouse.totalCapacity !== oldWarehouse.totalCapacity) {
          changes.push(`Warehouse '${newWarehouse.name}': Total capacity updated.`);
        }
        
        // Check bin-level fields
        newWarehouse.bins.forEach((newBin) => {
          const oldBin = oldWarehouse.bins.find(b => b.id === newBin.id);
          if (oldBin) {
             Object.keys(newBin).forEach(key => {
                const field = key as keyof WarehouseBin;
                if (field !== 'id' && newBin[field] !== oldBin[field]) {
                    changes.push(`Warehouse '${newWarehouse.name}', Bin ${newBin.id}: ${field} updated.`);
                }
             });
          }
        });
      }
    });

    if (changes.length > 0) {
      const newLog: ChangeLog = {
        user: currentUser,
        timestamp: new Date().toLocaleString(),
        changes: changes,
      };
      const updatedLogs = [newLog, ...logs];
      setLogs(updatedLogs);
      localStorage.setItem('warehouseLogs', JSON.stringify(updatedLogs));
    }

    localStorage.setItem('warehouses', JSON.stringify(warehouseData));
    alert(t('changesSaved'));
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

  const handleAiUpdate = async () => {
    if (!aiUpdateText.trim()) {
      alert('Please paste the update text into the text area first.');
      return;
    }
    setIsProcessing(true);
    try {
      const updatedWarehouses = await updateWarehouses(aiUpdateText);
      
      const warehouseMap = new Map(warehouseData.map(wh => [wh.name.toLowerCase(), wh]));
      const newWarehouseData = [...warehouseData];

      updatedWarehouses.forEach(updatedWh => {
        const existingWarehouse = warehouseMap.get(updatedWh.name.toLowerCase());
        if (existingWarehouse) {
          const whIndex = newWarehouseData.findIndex(wh => wh.id === existingWarehouse.id);
          if (whIndex !== -1) {
            newWarehouseData[whIndex] = {
              ...newWarehouseData[whIndex],
              ...updatedWh,
              bins: newWarehouseData[whIndex].bins.map(existingBin => {
                const updatedBin = updatedWh.bins.find(ub => ub.id.toLowerCase() === existingBin.id.toLowerCase());
                return updatedBin ? { ...existingBin, ...updatedBin } : existingBin;
              })
            };
          }
        }
      });

      setWarehouseData(newWarehouseData);
      alert('Warehouse data updated with AI! Please review and save changes.');

    } catch (error) {
      console.error('AI update failed:', error);
      alert('Failed to update with AI. Please check the console for details.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-8">
       <Card>
        <CardHeader>
          <CardTitle>Update with AI</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Paste a text with warehouse updates, and the AI will fill in the fields for you. For example: "Warehouse 9 has 2900T of Corn in bin 9A (code AFRA) and 3000T of Barley in 9B (TEHR)."
          </p>
          <Textarea
            placeholder="Paste your warehouse status update here..."
            value={aiUpdateText}
            onChange={(e) => setAiUpdateText(e.target.value)}
            rows={5}
          />
          <Button onClick={handleAiUpdate} disabled={isProcessing}>
            {isProcessing ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : null}
            {isProcessing ? 'Processing...' : 'Update with AI'}
          </Button>
        </CardContent>
      </Card>
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
                       <div className="space-y-2">
                          <Label>Code</Label>
                          <Input value={bin.code} onChange={e => handleWarehouseBinChange(whIndex, binIndex, 'code', e.target.value)} />
                       </div>
                    </div>
                  ))}
                </CardContent>
             </Card>
           ))}
        </div>
      </div>
      <Button size="lg" className="w-full" onClick={handleSaveChanges}>{t('saveChanges')}</Button>
      <Card>
        <CardHeader>
          <CardTitle>Change History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Changes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log, index) => (
                <TableRow key={index}>
                  <TableCell>{log.user}</TableCell>
                  <TableCell>{log.timestamp}</TableCell>
                  <TableCell>
                    <ul className="list-disc list-inside">
                      {log.changes.map((change, i) => <li key={i}>{change}</li>)}
                    </ul>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}


export default function WarehouseAdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { t } = useTranslation();

  const handleLogin = () => {
    if (password === 'warehousepass') {
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
            <CardTitle className="text-2xl">Warehouse Admin Login</CardTitle>
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
        <h1 className="text-3xl font-bold">Warehouse Admin Panel</h1>
         <Link href="/" className="text-sm font-medium text-primary hover:underline">
          {t('statusPageLink')}
        </Link>
      </div>
      <WarehouseAdminDashboard />
    </main>
  );
}

    