'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { warehouses as defaultWarehouses } from '@/lib/data';
import { Download } from 'lucide-react';
import * as XLSX from 'xlsx';

function WarehouseAdminDashboard() {

  const handleDownloadTemplate = () => {
    // We need to flatten the data structure for the Excel file
    const flattenedData = defaultWarehouses.flatMap(wh => 
      wh.bins.map(bin => ({
        warehouseId: wh.id,
        warehouseName: wh.name,
        totalCapacity: wh.totalCapacity,
        binId: bin.id,
        commodity: bin.commodity,
        tonnage: bin.tonnage,
        code: bin.code,
      }))
    );
    
    const worksheet = XLSX.utils.json_to_sheet(flattenedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Warehouses');
    XLSX.writeFile(workbook, 'warehouse_template.xlsx');
  };

  return (
    <div className="space-y-8">
       <Card>
        <CardHeader>
          <CardTitle>Warehouse Data Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Download the Excel template to update warehouse data. The template is structured with one row per bin. Once you have updated the file, upload it to the `public` folder of the project with the name `warehouse_data.xlsx`. The main dashboard will automatically reflect the changes.
          </p>
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
