import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const fileType = formData.get('type') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided.' }, { status: 400 });
    }
    
    if (!fileType || (fileType !== 'vessel' && fileType !== 'warehouse')) {
        return NextResponse.json({ error: 'Invalid file type specified.' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = fileType === 'vessel' ? 'vessel_data.xlsx' : 'warehouse_data.xlsx';
    
    // Ensure the 'public' directory exists. In most server environments it will,
    // but this is a good safeguard.
    const publicDir = path.join(process.cwd(), 'public');
    try {
      await fs.access(publicDir);
    } catch {
      await fs.mkdir(publicDir, { recursive: true });
    }
    
    const filepath = path.join(publicDir, filename);

    await fs.writeFile(filepath, buffer);

    return NextResponse.json({ message: 'File uploaded successfully' }, { status: 200 });
  } catch (error: any) {
    console.error('Upload failed:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred during file upload.';
    return NextResponse.json({ error: 'File upload failed.', details: errorMessage }, { status: 500 });
  }
}
