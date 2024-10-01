import { promises as fs } from 'fs';
import path from 'path';
import { NextResponse, NextRequest } from 'next/server';
import { fileTypeFromBuffer } from 'file-type';


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

const MAX_FILE_SIZE = 50 * 1024 * 1024;


export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const { id, } = params;
  const searchParams = req.nextUrl.searchParams

  const typePath = searchParams.get('typePath')

  if (!typePath) {
    return NextResponse.json({ message: 'No type path' }, { status: 400 });
  }

  const isValidPath = /^[a-zA-Z0-9-_]+$/.test(typePath);
  if (!isValidPath) {
    return NextResponse.json({ message: 'Invalid type path' }, { status: 400 });
  }

  const uploadDir = path.join(process.cwd(), `uploads/${typePath}`);
  const filePath = path.join(uploadDir, id);

  try {
    // Kiểm tra xem file có tồn tại không
    await fs.access(filePath);

    // Đọc file
    const file = await fs.readFile(filePath);

    // Giới hạn kích thước file trả về
    if (file.byteLength > MAX_FILE_SIZE) {
      return NextResponse.json({ message: 'File too large' }, { status: 413 });
    }

    // Kiểm tra loại MIME thực sự từ nội dung file
    const fileType = await fileTypeFromBuffer(file);

    if (!fileType || !allowedMimeTypes.includes(fileType.mime)) {
      return NextResponse.json({ message: 'Unsupported file type' }, { status: 400 });
    }

    // Trả về file với MIME type tương ứng
    return new NextResponse(file, {
      headers: {
        'Content-Type': fileType.mime,
      },
    })
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return NextResponse.json({ message: 'File not found' }, { status: 404 });
  }
}
