'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { updateVessels } from '@/ai/flows/update-vessels-flow';
import { Textarea } from '@/components/ui/textarea';
import { Loader } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { Vessel } from '@/lib/data';
import { vessels as defaultVessels } from '@/lib/data';

const portNames = [
  'Caspian port',
  'Anzali port',
  'Amirabad port',
  'Noshahr port',
  'Freidunkenar port',
  'Astrakhan port',
  'Makhachkala port',
  'Arib port',
  'Ola port',
];

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

function VesselAdminDashboard() {
  const [vesselData, setVesselData] = useLocalStorage<Vessel[]>('vessels', defaultVessels);
  const [logs, setLogs] = useLocalStorage<ChangeLog[]>('vesselLogs', []);
  const [loading, setLoading] = useState(true);

  const sortedLogs = useMemo(() => {
    return [...logs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [logs]);
  
  const [aiUpdateText, setAiUpdateText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const currentUser = 'Admin'; // User is always Admin now

   useEffect(() => {
    setLoading(false);
  }, []);

  const handleVesselChange = (index: number, field: keyof Vessel, value: string | number | boolean) => {
    const newVessels = [...vesselData];
    const vessel = newVessels[index];

    if (field === 'etaDate' && vessel.departureDate) {
        const departureDate = new Date(vessel.departureDate);
        const newEtaDate = new Date(value as string);
        if (newEtaDate <= departureDate) {
            alert("ETA date must be after the departure date.");
            return;
        }
    }
    if (field === 'departureDate' && vessel.etaDate) {
        const etaDate = new Date(vessel.etaDate);
        const newDepartureDate = new Date(value as string);
        if (etaDate <= newDepartureDate) {
            alert("Departure date must be before the ETA date.");
            return;
        }
    }

    (newVessels[index] as any)[field] = value;
    setVesselData(newVessels);
  };

  const handleSaveChanges = async () => {
    // Data is already saved to localStorage on every change by the hook.
    // This button can provide user feedback.
    
    // We'll regenerate the change log here.
    const oldVesselDataJSON = localStorage.getItem('vessels_before_change');
    const oldVesselData: Vessel[] = oldVesselDataJSON ? JSON.parse(oldVesselDataJSON) : defaultVessels;

    const changes: string[] = [];
    const vesselMap = new Map(oldVesselData.map(v => [v.id, v]));

    vesselData.forEach((newVessel) => {
      const oldVessel = vesselMap.get(newVessel.id);
      if (oldVessel) {
        (Object.keys(newVessel) as Array<keyof Vessel>).forEach(field => {
          if (field === 'id') return;
          const oldValue = oldVessel[field];
          const newValue = newVessel[field];
           if (String(newValue) !== String(oldValue)) {
            changes.push(`Vessel '${newVessel.vesselName}': ${field} changed from '${oldValue}' to '${newValue}'.`);
          }
        });
      }
    });

    if (changes.length > 0) {
      const newLog: ChangeLog = {
        id: new Date().toISOString(), // simple id
        user: currentUser,
        timestamp: new Date().toISOString(),
        changes: changes,
      };
      setLogs([newLog, ...logs]);
    }
    
    // Set the "before" state for the next save.
    localStorage.setItem('vessels_before_change', JSON.stringify(vesselData));

    alert('Changes saved to local storage!');
  };
  
  // Store the state before a change for the log
  useEffect(() => {
    localStorage.setItem('vessels_before_change', JSON.stringify(vesselData));
  }, []);


  const handleAiUpdate = async () => {
    if (!aiUpdateText.trim()) {
      alert('Please paste the update text into the text area first.');
      return;
    }
    setIsProcessing(true);
    try {
      const updatedVessels = await updateVessels(aiUpdateText);
      const vesselMap = new Map(vesselData.map(v => [v.vesselName.toLowerCase(), v]));
      const newVesselData = [...vesselData];

      updatedVessels.forEach(updatedVessel => {
        const existingVessel = vesselMap.get(updatedVessel.vesselName.toLowerCase());
        if (existingVessel) {
          const vIndex = newVesselData.findIndex(v => v.id === existingVessel.id);
          if (vIndex !== -1) {
            newVesselData[vIndex] = { ...newVesselData[vIndex], ...updatedVessel };
          }
        }
      });
      setVesselData(newVesselData);
      alert('Vessel data updated with AI! Please review and save changes.');

    } catch (error) {
      console.error('AI update failed:', error);
      alert('Failed to update with AI. Please check the console for details.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen"><Loader className="h-8 w-8 animate-spin" /></div>;
  }
  
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Update with AI</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Paste a text with vessel updates, and the AI will fill in the fields for you. For example: "Omskiy-130 has arrived at Caspian Port and is waiting for port entry. It carries Corn."
          </p>
          <Textarea
            placeholder="Paste your vessel status update here..."
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
        <h2 className="text-2xl font-bold mb-4">Update Vessel Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vesselData.map((vessel, index) => (
            <Card key={vessel.id}>
              <CardHeader>
                <CardTitle>{vessel.vesselName}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Input value={vessel.status || ''} onChange={e => handleVesselChange(index, 'status', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Cargo</Label>
                  <Input value={vessel.cargo || ''} onChange={e => handleVesselChange(index, 'cargo', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Departure Port</Label>
                  <Select
                    value={vessel.origin}
                    onValueChange={value => handleVesselChange(index, 'origin', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a port" />
                    </SelectTrigger>
                    <SelectContent>
                      {portNames
                        .filter(port => port !== vessel.destination)
                        .map(port => (
                          <SelectItem key={port} value={port}>{port}</SelectItem>
                        ))
                      }
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Destination Port</Label>
                   <Select
                    value={vessel.destination}
                    onValueChange={value => handleVesselChange(index, 'destination', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a port" />
                    </SelectTrigger>
                    <SelectContent>
                      {portNames
                        .filter(port => port !== vessel.origin)
                        .map(port => (
                          <SelectItem key={port} value={port}>{port}</SelectItem>
                        ))
                      }
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Departure Date</Label>
                  <Input type="date" value={vessel.departureDate || ''} onChange={e => handleVesselChange(index, 'departureDate', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>ETA Date</Label>
                  <Input type="date" value={vessel.etaDate || ''} onChange={e => handleVesselChange(index, 'etaDate', e.target.value)} />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id={`anchored-${vessel.id}`} checked={vessel.anchored} onCheckedChange={checked => handleVesselChange(index, 'anchored', checked)} />
                  <Label htmlFor={`anchored-${vessel.id}`}>Anchored</Label>
                </div>
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

export default function VesAdmPage() {
  return (
    <main className="container mx-auto p-4 sm:p-8">
      <div className="flex justify-between items-center w-full mb-8">
        <h1 className="text-3xl font-bold">Vessel Admin Panel</h1>
      </div>
      <VesselAdminDashboard />
    </main>
  );
}
