'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Save, AlertTriangle, CheckCircle } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from "@/hooks/use-toast";
import { useLocalStorage } from '@/hooks/use-local-storage';
import { vessels as defaultVessels, Vessel } from '@/lib/data';

function VesselAdminDashboard() {
  const [vessels, setVessels] = useLocalStorage<Vessel[]>('vessel_data', defaultVessels);
  const [textData, setTextData] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    // Pre-populate the textarea with the current data from local storage
    if (vessels) {
      setTextData(JSON.stringify(vessels, null, 2));
    }
  }, [vessels]);

  const handleSave = () => {
    try {
      const parsedData = JSON.parse(textData);
      // You might want to add validation here to ensure parsedData is an array of Vessel
      setVessels(parsedData);
      toast({
        title: "Save Successful",
        description: "Vessel data has been saved to local storage.",
        action: <CheckCircle className="text-green-500" />,
      });
    } catch (error) {
      console.error("Failed to parse and save vessel data:", error);
      toast({
        variant: "destructive",
        title: "Save Failed",
        description: "The text is not valid JSON. Please correct it and try again.",
        action: <AlertTriangle className="text-white" />,
      });
    }
  };

  const loadDefaultData = () => {
    setVessels(defaultVessels);
    setTextData(JSON.stringify(defaultVessels, null, 2));
    toast({
        title: "Default Data Loaded",
        description: "The default vessel data has been loaded. Click 'Save' to apply.",
      });
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Vessel Data Management</CardTitle>
          <CardDescription>
            Edit the vessel data in the JSON format below. Click 'Save' to update the application data in your browser.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={textData}
            onChange={(e) => setTextData(e.target.value)}
            rows={20}
            className="font-mono text-sm"
            placeholder="Enter vessel data in JSON format..."
          />
          <div className="flex justify-between gap-2">
            <Button onClick={handleSave}>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
            <Button variant="outline" onClick={loadDefaultData}>
              Load Default Data
            </Button>
          </div>
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
