
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { vessels as defaultVessels, type Vessel } from '@/lib/data';
import { useTranslation } from '@/context/language-context';
import { updateVessels } from '@/ai/flows/update-vessels-flow';
import { Textarea } from '@/components/ui/textarea';
import { Loader } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const portNames = [
  'Caspian',
  'Anzali',
  'Amirabad',
  'Noshahr',
  'Freidunkenar',
  'Astrakhan',
  'Makhachkala',
  'Arib',
  'Ola',
];

function VesselAdminDashboard() {
  const { t } = useTranslation();
  const [vesselData, setVesselData] = useState<Vessel[]>(defaultVessels);
  const [aiUpdateText, setAiUpdateText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const savedVessels = localStorage.getItem('vessels');
    if (savedVessels) {
      setVesselData(JSON.parse(savedVessels));
    }
  }, []);

  const handleVesselChange = (index: number, field: keyof Vessel, value: string | number | boolean) => {
    const newVessels = [...vesselData];
    const vessel = newVessels[index];

    // Date validation
    if (field === 'etaDate') {
        const departureDate = new Date(vessel.departureDate);
        const newEtaDate = new Date(value as string);
        if (newEtaDate <= departureDate) {
            alert("ETA date must be after the departure date.");
            return;
        }
    }
    if (field === 'departureDate') {
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

  const handleSaveChanges = () => {
    localStorage.setItem('vessels', JSON.stringify(vesselData));
    alert(t('changesSaved'));
  };

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
      alert('Vessel data updated with AI!');

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
        <h2 className="text-2xl font-bold mb-4">{t('updateVesselInfo')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vesselData.map((vessel, index) => (
            <Card key={vessel.id}>
              <CardHeader>
                <CardTitle>{vessel.vesselName}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>{t('status')}</Label>
                  <Input value={vessel.status} onChange={e => handleVesselChange(index, 'status', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>{t('cargo')}</Label>
                  <Input value={vessel.cargo} onChange={e => handleVesselChange(index, 'cargo', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>{t('departurePort')}</Label>
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
                  <Label>{t('destinationPort')}</Label>
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
                  <Label>{t('departureDate')}</Label>
                  <Input type="date" value={vessel.departureDate} onChange={e => handleVesselChange(index, 'departureDate', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>{t('etaDate')}</Label>
                  <Input type="date" value={vessel.etaDate} onChange={e => handleVesselChange(index, 'etaDate', e.target.value)} />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id={`anchored-${vessel.id}`} checked={vessel.anchored} onCheckedChange={checked => handleVesselChange(index, 'anchored', checked)} />
                  <Label htmlFor={`anchored-${vessel.id}`}>{t('anchored')}</Label>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      <Button size="lg" className="w-full" onClick={handleSaveChanges}>{t('saveChanges')}</Button>
    </div>
  );
}

export default function VesAdmPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { t } = useTranslation();

  const handleLogin = () => {
    if (password === 'vesselpass') {
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
            <CardTitle className="text-2xl">Vessel Admin Login</CardTitle>
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
        <h1 className="text-3xl font-bold">Vessel Admin Panel</h1>
        <Link href="/" className="text-sm font-medium text-primary hover:underline">
          {t('statusPageLink')}
        </Link>
      </div>
      <VesselAdminDashboard />
    </main>
  );
}
