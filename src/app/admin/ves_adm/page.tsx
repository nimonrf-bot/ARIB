'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Download } from 'lucide-react';
import { vessels as defaultVessels } from '@/lib/data';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { DATA_URLS } from '@/lib/config';

function VesselAdminDashboard() {
  const handleDownloadTemplate = () => {
    const worksheet = XLSX.utils.json_to_sheet(defaultVessels);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Vessels');
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
    saveAs(data, 'vessel_template.xlsx');
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Vessel Data Management</CardTitle>
          <CardDescription>
            Download the Excel template to manage your vessel data. After updating the file, you must host it at a public URL.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-semibold text-blue-800">Instructions:</h3>
                <ol className="list-decimal list-inside mt-2 text-sm text-blue-700 space-y-1">
                    <li>Click the button below to download the Excel template.</li>
                    <li>Edit the file to update your vessel information.</li>
                    <li>Upload the saved file to a public hosting service of your choice.</li>
                    <li>
                        Update the URL in <code className="bg-blue-100 p-1 rounded">src/lib/config.ts</code> to point to your new file location.
                        The current URL is: <a href={DATA_URLS.vessels} target="_blank" rel="noopener noreferrer" className="underline">{DATA_URLS.vessels}</a>
                    </li>
                    <li>The homepage will automatically reflect the changes from the new file.</li>
                </ol>
            </div>
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
