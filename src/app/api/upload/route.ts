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
    const filepath = path.join(process.cwd(), 'public', filename);

    await fs.writeFile(filepath, buffer);

    return NextResponse.json({ message: 'File uploaded successfully' }, { status: 200 });
  } catch (error) {
    console.error('Upload failed:', error);
    return NextResponse.json({ error: 'File upload failed.' }, { status: 500 });
  }
}
