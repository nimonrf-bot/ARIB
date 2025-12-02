'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Download } from 'lucide-react';
import { warehouses as defaultWarehouses } from '@/lib/data';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { DATA_URLS } from '@/lib/config';

function WarehouseAdminDashboard() {
  const handleDownloadTemplate = () => {
    // We need to flatten the data for a better Excel structure
    const flattenedData = defaultWarehouses.flatMap(w => 
      w.bins.map(b => ({
        warehouseld: w.id,
        warehouseName: w.name,
        warehouseTotalCapacity: w.totalCapacity,
        binld: b.id,
        binCommodity: b.commodity,
        binTonnage: b.tonnage,
        binCode: b.code,
      }))
    );

    const worksheet = XLSX.utils.json_to_sheet(flattenedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Warehouses');
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
    saveAs(data, 'warehouse_template.xlsx');
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Warehouse Data Management</CardTitle>
          <CardDescription>
            Download the Excel template to manage your warehouse data. After updating, host the file at a public URL.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-800">Instructions:</h3>
            <ol className="list-decimal list-inside mt-2 text-sm text-blue-700 space-y-1">
              <li>Click the button below to download the Excel template named <code className="bg-blue-100 p-1 rounded">warehouse_template.xlsx</code>.</li>
              <li>Edit the file to update your warehouse information.</li>
              <li>Upload the saved file to a public hosting service of your choice (e.g., inside your project's `public` folder).</li>
              <li>
                Update the URL in <code className="bg-blue-100 p-1 rounded">src/lib/config.ts</code> to point to your new file location.
                The current URL is: <a href={DATA_URLS.warehouses} target="_blank" rel="noopener noreferrer" className="underline">{DATA_URLS.warehouses}</a>
              </li>
              <li>The homepage will automatically reflect the changes from the new file.</li>
            </ol>
          </div>
          <Button onClick={handleDownloadTemplate}>
            <Download className="mr-2 h-4 w-4" />
            Download Warehouse Template
          </Button>
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
