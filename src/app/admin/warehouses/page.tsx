'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { type Warehouse, type WarehouseBin, warehouses as defaultWarehouses } from '@/lib/data';
import { Textarea } from '@/components/ui/textarea';
import { updateWarehouses } from '@/ai/flows/update-warehouses-flow';
import { Loader, Plus, Minus, Upload } from 'lucide-react';
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
import * as XLSX from 'xlsx';

interface ChangeLog {
  id?: string;
  user: string;
  timestamp: string;
  changes: string[];
}

function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        return JSON.parse(item);
      } else {
        window.localStorage.setItem(key, JSON.stringify(initialValue));
        return initialValue;
      }
    } catch (error) {
      console.log(error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.log(error);
    }
  };
  
  useEffect(() => {
    const item = window.localStorage.getItem(key);
    if (!item) {
      setValue(initialValue);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return [storedValue, setValue] as const;
}

function WarehouseAdminDashboard() {
  const [warehouseData, setWarehouseData] = useLocalStorage<Warehouse[]>('warehouses', defaultWarehouses);
  const [logs, setLogs] = useLocalStorage<ChangeLog[]>('warehouseLogs', []);
  const [loading, setLoading] = useState(true);

  const sortedLogs = useMemo(() => {
    return [...logs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [logs]);

  const [aiUpdateText, setAiUpdateText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const currentUser = 'Admin';

  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string>('');
  const [selectedBinId, setSelectedBinId] = useState<string>('');
  const [inventoryAmount, setInventoryAmount] = useState<number>(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLoading(false);
  }, []);
  
  // Store the state before a change for the log
  useEffect(() => {
    localStorage.setItem('warehouses_before_change', JSON.stringify(warehouseData));
  }, []);


  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const json: any[] = XLSX.utils.sheet_to_json(worksheet);

      if (json.length === 0) {
        alert('The uploaded file is empty or in an incorrect format.');
        return;
      }
      
      const newWarehouses: { [key: number]: Warehouse } = {};

      for (const row of json) {
        const warehouseId = parseInt(row.warehouseId, 10);
        if (isNaN(warehouseId)) continue;

        if (!newWarehouses[warehouseId]) {
          newWarehouses[warehouseId] = {
            id: warehouseId,
            name: row.warehouseName,
            totalCapacity: parseInt(row.totalCapacity, 10),
            bins: [],
          };
        }

        newWarehouses[warehouseId].bins.push({
          id: row.binId,
          commodity: row.commodity,
          tonnage: parseInt(row.tonnage, 10),
          code: row.code,
        });
      }

      setWarehouseData(Object.values(newWarehouses));
      alert('Data from Excel has been loaded. Please review the changes and click "Save Changes" to apply them.');
    };
    reader.readAsArrayBuffer(file);
    if(fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };

  const handleSaveChanges = async () => {
    const oldWarehouseDataJSON = localStorage.getItem('warehouses_before_change');
    const oldWarehouseData: Warehouse[] = oldWarehouseDataJSON ? JSON.parse(oldWarehouseDataJSON) : defaultWarehouses;

    const warehouseMap = new Map(oldWarehouseData.map(w => [w.id, w]));
    const changes: string[] = [];

    warehouseData.forEach((newWarehouse) => {
      const oldWarehouse = warehouseMap.get(newWarehouse.id);

      if (oldWarehouse) {
        if (newWarehouse.name !== oldWarehouse.name) {
          changes.push(`Warehouse '${oldWarehouse.name}' -> '${newWarehouse.name}': Name changed from '${oldWarehouse.name}' to '${newWarehouse.name}'.`);
        }
        if (newWarehouse.totalCapacity !== oldWarehouse.totalCapacity) {
          changes.push(`Warehouse '${newWarehouse.name}': Total capacity changed from '${oldWarehouse.totalCapacity}' to '${newWarehouse.totalCapacity}'.`);
        }
        
        const oldBinMap = new Map(oldWarehouse.bins.map(b => [b.id, b]));
        newWarehouse.bins.forEach((newBin) => {
          const oldBin = oldBinMap.get(newBin.id);
          if (oldBin) {
             (Object.keys(newBin) as Array<keyof WarehouseBin>).forEach(field => {
                if (field === 'id') return;
                const oldValue = oldBin[field];
                const newValue = newBin[field];
                if (String(newValue) !== String(oldValue)) {
                    changes.push(`Warehouse '${newWarehouse.name}', Bin ${newBin.id}: ${field} changed from '${oldValue}' to '${newValue}'.`);
                }
             });
          }
        });
      }
    });

    if (changes.length > 0) {
      const newLog: ChangeLog = {
        id: new Date().toISOString(),
        user: currentUser,
        timestamp: new Date().toISOString(),
        changes: changes,
      };
      setLogs([newLog, ...logs]);
    }
    
    localStorage.setItem('warehouses_before_change', JSON.stringify(warehouseData));
    alert('Changes saved to local storage!');
  };

  const handleWarehouseChange = (index: number, field: keyof Warehouse, value: string | number) => {
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
  
  const handleInventoryChange = (action: 'add' | 'remove') => {
    if (!selectedWarehouseId || !selectedBinId || inventoryAmount <= 0) {
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
    
    setSelectedWarehouseId('');
    setSelectedBinId('');
    setInventoryAmount(0);
    setIsDialogOpen(false);
  };
  
  const selectedWarehouseForDialog = warehouseData?.find(wh => wh.id === parseInt(selectedWarehouseId, 10));
  
  if (loading) {
    return <div className="flex justify-center items-center h-screen"><Loader className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
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
                        </SelectTrigger>
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
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Update with AI</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Paste your warehouse status update here..."
              value={aiUpdateText}
              onChange={(e) => setAiUpdateText(e.target.value)}
              rows={3}
            />
            <Button onClick={handleAiUpdate} disabled={isProcessing} className="w-full">
              {isProcessing ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : null}
              {isProcessing ? 'Processing...' : 'Update with AI'}
            </Button>
          </CardContent>
        </Card>
        <Card className="md:col-span-1">
            <CardHeader>
                <CardTitle>Upload from File</CardTitle>
            </CardHeader>
            <CardContent>
                 <p className="text-muted-foreground mb-4">
                    Upload an Excel (.xlsx) or CSV file to populate warehouse data.
                </p>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    className="hidden"
                    accept=".xlsx, .xls, .csv"
                />
                <Button onClick={() => fileInputRef.current?.click()} className="w-full">
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Excel File
                </Button>
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
                    <Input type="number" value={warehouse.totalCapacity || ''} onChange={e => handleWarehouseChange(whIndex, 'totalCapacity', parseInt(e.target.value, 10) || 0)} />
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
                          <Input type="number" value={bin.tonnage} onChange={e => handleWarehouseBinChange(whIndex, binIndex, 'tonnage', parseInt(e.target.value, 10) || 0)} />
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
  return (
    <main className="container mx-auto p-4 sm:p-8">
      <div className="flex justify-between items-center w-full mb-8">
        <h1 className="text-3xl font-bold">Warehouse Admin Panel</h1>
      </div>
      <WarehouseAdminDashboard />
    </main>
  );
}
