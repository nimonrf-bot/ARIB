
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { warehouses as defaultWarehouses, type Warehouse, WarehouseBin } from '@/lib/data';
import { Textarea } from '@/components/ui/textarea';
import { updateWarehouses } from '@/ai/flows/update-warehouses-flow';
import { Loader, Plus, Minus, ShieldAlert } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth, useCollection, useFirestore } from '@/firebase';
import { collection, doc, writeBatch, getDocs } from 'firebase/firestore';
import { WAREHOUSE_ADMINS } from '@/lib/admins';


interface ChangeLog {
  id?: string;
  user: string;
  timestamp: string;
  changes: string[];
}

function WarehouseAdminDashboard() {
  const firestore = useFirestore();
  const { user } = useAuth();
  
  const { data: warehouseData, setData: setWarehouseData } = useCollection<Warehouse>('warehouses');
  const { data: logs, add: addLog } = useCollection<ChangeLog>('warehouseLogs');

  const sortedLogs = useMemo(() => {
    if (!logs) return [];
    return [...logs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [logs]);

  const [aiUpdateText, setAiUpdateText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentUser, setCurrentUser] = useState('Admin');

  // State for the inventory dialog
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string>('');
  const [selectedBinId, setSelectedBinId] = useState<string>('');
  const [inventoryAmount, setInventoryAmount] = useState<number>(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    if (user) {
      setCurrentUser(user.email || 'Admin');
    }
  }, [user]);

  const handleSaveChanges = async () => {
    if (!firestore || !warehouseData) return;

    const warehousesCollectionRef = collection(firestore, 'warehouses');
    const savedWarehousesSnapshot = await getDocs(warehousesCollectionRef);
    const oldWarehouseData: Warehouse[] = savedWarehousesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as unknown as Warehouse));

    const changes: string[] = [];

    warehouseData.forEach((newWarehouse) => {
      const oldWarehouse = oldWarehouseData.find(w => w.id === newWarehouse.id);

      if (oldWarehouse) {
        if (newWarehouse.name !== oldWarehouse.name) {
          changes.push(`Warehouse '${oldWarehouse.name}' -> '${newWarehouse.name}': Name changed from '${oldWarehouse.name}' to '${newWarehouse.name}'.`);
        }
        if (newWarehouse.totalCapacity !== oldWarehouse.totalCapacity) {
          changes.push(`Warehouse '${newWarehouse.name}': Total capacity changed from '${oldWarehouse.totalCapacity}' to '${newWarehouse.totalCapacity}'.`);
        }
        
        newWarehouse.bins.forEach((newBin) => {
          const oldBin = oldWarehouse.bins.find(b => b.id === newBin.id);
          if (oldBin) {
             (Object.keys(newBin) as Array<keyof WarehouseBin>).forEach(field => {
                const oldValue = oldBin[field];
                const newValue = newBin[field];
                if (field !== 'id' && String(newValue) !== String(oldValue)) {
                    changes.push(`Warehouse '${newWarehouse.name}', Bin ${newBin.id}: ${field} changed from '${oldValue}' to '${newValue}'.`);
                }
             });
          }
        });
      }
    });

    if (changes.length > 0) {
      const newLog: ChangeLog = {
        user: currentUser,
        timestamp: new Date().toISOString(),
        changes: changes,
      };
      addLog(newLog);
    }
    
    const batch = writeBatch(firestore);
    warehouseData.forEach((warehouse) => {
      const { id, ...data } = warehouse;
      const docRef = doc(firestore, 'warehouses', String(id));
      batch.set(docRef, data);
    });
    await batch.commit();

    alert('Changes saved!');
  };

  const handleWarehouseChange = (index: number, field: keyof Warehouse, value: string | number) => {
    if (!warehouseData) return;
    const newWarehouses = [...warehouseData];
    const warehouse = newWarehouses[index];
    (warehouse as any)[field] = value;

    if (field === 'name' && typeof value === 'string') {
      const warehouseNumberMatch = value.match(/\d+/);
      if (warehouseNumberMatch) {
        const warehouseNumber = warehouseNumberMatch[0];
        warehouse.bins = warehouse.bins.map(bin => {
          const binLetterMatch = bin.id.match(/[A-Z]$/);
          if (binLetterMatch) {
            return { ...bin, id: `${warehouseNumber}${binLetterMatch[0]}` };
          }
          return bin;
        });
      }
    }
    setWarehouseData(newWarehouses);
  };
  
  const handleWarehouseBinChange = (whIndex: number, binIndex: number, field: keyof Warehouse['bins'][0], value: string | number) => {
    if (!warehouseData) return;
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
      if (!warehouseData) {
        setIsProcessing(false);
        return;
      }
      
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
  
  const handleInventoryChange = (action: 'add' | 'remove') => {
    if (!selectedWarehouseId || !selectedBinId || inventoryAmount <= 0 || !warehouseData) {
      alert('Please select a warehouse, a bin, and enter a valid amount.');
      return;
    }

    const whId = parseInt(selectedWarehouseId, 10);
    
    const newWarehouses = [...warehouseData];
    const whIndex = newWarehouses.findIndex(wh => wh.id === whId);
    if (whIndex === -1) return;

    const binIndex = newWarehouses[whIndex].bins.findIndex(b => b.id === selectedBinId);
    if (binIndex === -1) return;

    const bin = newWarehouses[whIndex].bins[binIndex];
    const currentTonnage = bin.tonnage;

    if (action === 'add') {
      bin.tonnage += inventoryAmount;
    } else {
      if (currentTonnage < inventoryAmount) {
        alert(`Cannot remove ${inventoryAmount}T. Bin ${bin.id} only has ${currentTonnage}T.`);
        return;
      }
      bin.tonnage -= inventoryAmount;
    }
    
    setWarehouseData(newWarehouses);
    alert(`Successfully ${action === 'add' ? 'added' : 'removed'} ${inventoryAmount}T. Please review and save changes.`);
    
    // Reset dialog fields and close it
    setSelectedWarehouseId('');
    setSelectedBinId('');
    setInventoryAmount(0);
    setIsDialogOpen(false);
  };
  
  const selectedWarehouseForDialog = warehouseData?.find(wh => wh.id === parseInt(selectedWarehouseId, 10));
  
  if (!warehouseData) {
    return <div className="flex justify-center items-center h-screen"><Loader className="h-8 w-8 animate-spin" /></div>;
  }


  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
        <Card>
          <CardHeader>
            <CardTitle>Manage Inventory</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Add or remove stock from a specific warehouse bin.
            </p>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full">Add / Remove Stock</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Add or Remove Inventory</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="warehouse-select" className="text-right">
                      Warehouse
                    </Label>
                    <Select value={selectedWarehouseId} onValueChange={id => {setSelectedWarehouseId(id); setSelectedBinId('')}}>
                        <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Select a warehouse" />
                        </SelectTrigger>
                        <SelectContent>
                            {warehouseData.map(wh => (
                                <SelectItem key={wh.id} value={String(wh.id)}>{wh.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                  </div>
                  {selectedWarehouseForDialog && (
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="bin-select" className="text-right">
                        Bin
                      </Label>
                      <Select value={selectedBinId} onValueChange={setSelectedBinId}>
                        <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Select a bin" />
                        </Trigger>
                        <SelectContent>
                            {selectedWarehouseForDialog.bins.map(bin => (
                                <SelectItem key={bin.id} value={bin.id}>{bin.id} ({bin.commodity})</SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="amount" className="text-right">
                      Tonnage
                    </Label>
                    <Input
                      id="amount"
                      type="number"
                      value={inventoryAmount}
                      onChange={(e) => setInventoryAmount(Math.max(0, parseInt(e.target.value, 10) || 0))}
                      className="col-span-3"
                    />
                  </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                    <Button onClick={() => handleInventoryChange('remove')} variant="destructive" disabled={!selectedBinId || inventoryAmount <= 0}>
                        <Minus className="mr-2 h-4 w-4" /> Remove
                    </Button>
                    <Button onClick={() => handleInventoryChange('add')} disabled={!selectedBinId || inventoryAmount <= 0}>
                        <Plus className="mr-2 h-4 w-4" /> Add
                    </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">Update Warehouse Information</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
           {warehouseData.map((warehouse, whIndex) => (
             <Card key={warehouse.id}>
                <CardHeader>
                  <CardTitle>Warehouse {warehouse.id}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Warehouse Name</Label>
                    <Input value={warehouse.name} onChange={e => handleWarehouseChange(whIndex, 'name', e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Total Capacity (T)</Label>
                    <Input type="number" value={warehouse.totalCapacity} onChange={e => handleWarehouseChange(whIndex, 'totalCapacity', parseInt(e.target.value, 10))} />
                  </div>
                  {warehouse.bins.map((bin, binIndex) => (
                    <div key={bin.id} className="p-4 border rounded-md space-y-2">
                       <h4 className="font-semibold">Bin {bin.id}</h4>
                       <div className="space-y-2">
                          <Label>Commodity</Label>
                          <Input value={bin.commodity} onChange={e => handleWarehouseBinChange(whIndex, binIndex, 'commodity', e.target.value)} />
                       </div>
                       <div className="space-y-2">
                          <Label>Tonnage</Label>
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
      <Button size="lg" className="w-full" onClick={handleSaveChanges}>Save Changes</Button>
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
              {sortedLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>{log.user}</TableCell>
                  <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
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
  const { user, loading } = useAuth();

  if (loading) {
     return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <Loader className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle className="text-2xl">Warehouse Admin Login</CardTitle>
          </CardHeader>
          <CardContent><p>You must be logged in to view this page.</p></CardContent>
        </Card>
      </div>
    );
  }
  
  if (!user.email || !WAREHOUSE_ADMINS.includes(user.email)) {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <Card className="w-full max-w-md text-center border-red-500">
                <CardHeader>
                    <CardTitle className="flex items-center justify-center gap-2 text-red-600">
                        <ShieldAlert className="h-6 w-6" />
                        <span>Access Denied</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">
                        Your account <span className="font-semibold">{user.email}</span> is not authorized to access the Warehouse Admin panel.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
  }

  return (
    <main className="container mx-auto p-4 sm:p-8">
      <div className="flex justify-between items-center w-full mb-8">
        <h1 className="text-3xl font-bold">Warehouse Admin Panel</h1>
      </div>
      <WarehouseAdminDashboard />
    </main>
  );
}
