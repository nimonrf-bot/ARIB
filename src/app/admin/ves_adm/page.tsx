'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Download, Upload, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
import * as XLSX from 'xlsx';
import { vessels as defaultVessels } from '@/lib/data';
import { Input } from '@/components/ui/input';
import { useToast } from "@/hooks/use-toast";


function VesselAdminDashboard() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleDownloadTemplate = () => {
    const worksheet = XLSX.utils.json_to_sheet(defaultVessels);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Vessels');
    XLSX.writeFile(workbook, 'vessel_template.xlsx');
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast({
        variant: "destructive",
        title: "No File Selected",
        description: "Please select a vessel data file to upload.",
      });
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('type', 'vessel');

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Upload failed');
      }
      
      toast({
        title: "Upload Successful",
        description: "Vessel data file has been updated.",
        action: <CheckCircle className="text-green-500" />,
      });

    } catch (error: any) {
       toast({
        variant: "destructive",
        title: "Upload Failed",
        description: error.message || "An unknown error occurred.",
        action: <AlertTriangle className="text-white" />,
      });
    } finally {
      setIsUploading(false);
      setSelectedFile(null);
      // Reset the file input
      const fileInput = document.getElementById('vessel-file-input') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
    }
  };
  
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Vessel Data Management</CardTitle>
          <CardDescription>
            Download the Excel template, update it with the latest vessel data, and upload it here.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
             <h3 className="font-semibold">Step 1: Download Template</h3>
             <p className="text-muted-foreground text-sm">
                If you don't have the template, download it to get the correct format.
            </p>
            <Button onClick={handleDownloadTemplate}>
              <Download className="mr-2 h-4 w-4" />
              Download Vessel Template
            </Button>
          </div>
          <div className="space-y-3">
             <h3 className="font-semibold">Step 2: Upload Updated File</h3>
             <p className="text-muted-foreground text-sm">
                Upload the updated `vessel_data.xlsx` file. This will replace the existing data on the main dashboard.
            </p>
             <div className="flex items-center gap-4">
                <Input id="vessel-file-input" type="file" accept=".xlsx" onChange={handleFileChange} className="max-w-xs" />
                <Button onClick={handleUpload} disabled={isUploading || !selectedFile}>
                  {isUploading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="mr-2 h-4 w-4" />
                  )}
                  Upload File
                </Button>
            </div>
            {selectedFile && <p className="text-sm text-muted-foreground">Selected: {selectedFile.name}</p>}
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
