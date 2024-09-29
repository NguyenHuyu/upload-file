import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

// Các loại MIME hợp lệ cho ảnh và video
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
  // Lấy file từ request
  const formData = await req.formData();
  const file = formData.get('file') as File;
  const typePath = formData.get('typePath') as string;

  // Kiểm tra xem có file hay không
  if (!file) {
    return NextResponse.json({ message: 'No file uploaded' }, { status: 400 });
  }
  if (!typePath) {
    return NextResponse.json({ message: 'No type path' }, { status: 400 });
  }


  // Kiểm tra loại MIME của file
  const mimeType = file.type;

  if (!allowedMimeTypes.includes(mimeType)) {
    return NextResponse.json({ message: 'File type not supported' }, { status: 400 });
  }

  // Lưu file vào thư mục uploads
  const uploadDir = path.join(process.cwd(), `uploads/${typePath}`);
  await fs.mkdir(uploadDir, { recursive: true });
  const filePath = path.join(uploadDir, file.name);

  const buffer = await file.arrayBuffer();
  await fs.writeFile(filePath, Buffer.from(buffer));

  return NextResponse.json({
    message: 'File uploaded successfully!',
    fileName: `${process.env.NEXT_PUBLIC_API_URL}/api/files/${file.name}?typePath=${typePath}`,
  });
}
