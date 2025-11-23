'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download } from 'lucide-react';
import * as XLSX from 'xlsx';
import { vessels as defaultVessels } from '@/lib/data';


function VesselAdminDashboard() {
  const [vesselData, setVesselData] = useState(defaultVessels);

  const handleDownloadTemplate = () => {
    const worksheet = XLSX.utils.json_to_sheet(vesselData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Vessels');
    XLSX.writeFile(workbook, 'vessel_template.xlsx');
  };

  
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Vessel Data Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Download the Excel template to update vessel data. Once you have updated the file, upload it to the `public` folder of the project with the name `vessel_data.xlsx`. The main dashboard will automatically reflect the changes.
          </p>
          <Button onClick={handleDownloadTemplate}>
            <Download className="mr-2 h-4 w-4" />
            Download Vessel Template
          </Button>
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
