import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const MAX_SIZE = 10 * 1024 * 1024;


const allowedMimeTypes = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  'image/bmp',
  'video/mp4',
  'video/avi',
  'video/mpeg',
];

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get('file') as File;
  const typePath = formData.get('typePath') as string;

  if (!file) {
    return NextResponse.json({ message: 'No file uploaded' }, { status: 400 });
  }
  if (!typePath) {
    return NextResponse.json({ message: 'No type path' }, { status: 400 });
  }

  const mimeType = file.type;
  const ext = path.extname(file.name).toLowerCase();


  if (!allowedMimeTypes.includes(mimeType)) {
    return NextResponse.json({ message: 'File type not supported' }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ message: 'File is too large' }, { status: 400 });
  }

  const isValidPath = /^[a-zA-Z0-9-_]+$/.test(typePath);

  if (!isValidPath) {
    return NextResponse.json({ message: 'Invalid type path' }, { status: 400 });
  }

   const safeFileName = `${Date.now()}-${Math.random().toString(36).substring(2)}${ext}`;

   const uploadDir = path.join(process.cwd(), `uploads/${typePath}`);
   await fs.mkdir(uploadDir, { recursive: true });
   const filePath = path.join(uploadDir, safeFileName);

   const buffer = await file.arrayBuffer();
   await fs.writeFile(filePath, Buffer.from(buffer));

   return NextResponse.json({
     message: 'File uploaded successfully!',
     fileName: `${process.env.NEXT_PUBLIC_API_URL}/api/files/${safeFileName}?typePath=${typePath}`,
   });
}
