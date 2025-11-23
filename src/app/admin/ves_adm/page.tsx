'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { updateVessels } from '@/ai/flows/update-vessels-flow';
import { Textarea } from '@/components/ui/textarea';
import { Loader, ShieldAlert } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAuth, useCollection, useFirestore } from '@/firebase';
import { collection, doc, writeBatch, getDocs, type DocumentData } from 'firebase/firestore';
import { VESSEL_ADMINS } from '@/lib/admins';
import type { Vessel } from '@/lib/data';

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

interface ChangeLog extends DocumentData {
  id?: string;
  user: string;
  timestamp: string;
  changes: string[];
}

function VesselAdminDashboard() {
  const firestore = useFirestore();
  const { user } = useAuth();

  const { data: vesselData, setData: setVesselData, loading: vesselsLoading } = useCollection<Vessel>('vessels');
  const { data: logs, add: addLog, loading: logsLoading } = useCollection<ChangeLog>('vesselLogs');

  const sortedLogs = useMemo(() => {
    if (!logs) return [];
    return [...logs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [logs]);
  
  const [aiUpdateText, setAiUpdateText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentUser, setCurrentUser] = useState('Admin');

   useEffect(() => {
    if (user && user.email) {
      setCurrentUser(user.email);
    }
  }, [user]);

  const handleVesselChange = (index: number, field: keyof Vessel, value: string | number | boolean) => {
    if (!vesselData) return;
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
    if (!firestore || !vesselData) return;

    const vesselsCollectionRef = collection(firestore, 'vessels');
    const savedVesselsSnapshot = await getDocs(vesselsCollectionRef);
    const oldVesselData: Vessel[] = savedVesselsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as unknown as Vessel));

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
        user: currentUser,
        timestamp: new Date().toISOString(),
        changes: changes,
      };
      await addLog(newLog);
    }
    
    const batch = writeBatch(firestore);
    vesselData.forEach((vessel) => {
      const { id, ...data } = vessel;
      const docRef = doc(firestore, 'vessels', String(id));
      batch.set(docRef, data, { merge: true });
    });
    await batch.commit();

    alert('Changes saved!');
  };

  const handleAiUpdate = async () => {
    if (!aiUpdateText.trim()) {
      alert('Please paste the update text into the text area first.');
      return;
    }
    setIsProcessing(true);
    try {
      const updatedVessels = await updateVessels(aiUpdateText);
      const vesselMap = new Map((vesselData || []).map(v => [v.vesselName.toLowerCase(), v]));
      const newVesselData = [...(vesselData || [])];

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

  if (vesselsLoading || logsLoading) {
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
          {(vesselData || []).map((vessel, index) => (
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
                    </Trigger>
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
            <CardTitle className="text-2xl">Vessel Admin Login</CardTitle>
          </CardHeader>
          <CardContent><p>You must be logged in to view this page.</p></CardContent>
        </Card>
      </div>
    );
  }
  
  if (!user.email || !VESSEL_ADMINS.includes(user.email)) {
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
                      Your account <span className="font-semibold">{user.email}</span> is not authorized to access the Vessel Admin panel.
                  </p>
              </CardContent>
          </Card>
      </div>
    );
  }

  return (
    <main className="container mx-auto p-4 sm:p-8">
      <div className="flex justify-between items-center w-full mb-8">
        <h1 className="text-3xl font-bold">Vessel Admin Panel</h1>
      </div>
      <VesselAdminDashboard />
    </main>
  );
}
