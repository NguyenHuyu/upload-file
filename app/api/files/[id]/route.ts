// app/api/files/[id]/route.ts
import { promises as fs } from 'fs';
import path from 'path';
import { NextResponse, NextRequest } from 'next/server';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const { id, } = params;
  const searchParams = req.nextUrl.searchParams

  const typePath = searchParams.get('typePath')

  if (!typePath) {
    return NextResponse.json({ message: 'No type path' }, { status: 400 });
  }

  // Lấy đường dẫn tới file cần tìm trong thư mục uploads
  const uploadDir = path.join(process.cwd(), `uploads/${typePath}`);
  const filePath = path.join(uploadDir, id);

  try {
    // Kiểm tra xem file có tồn tại không
    await fs.access(filePath);

    // Đọc file
    const file = await fs.readFile(filePath);

    // Xác định loại MIME từ phần mở rộng của file
    const ext = path.extname(filePath).toLowerCase();
    let contentType = '';

    switch (ext) {
      case '.jpg':
      case '.jpeg':
        contentType = 'image/jpeg';
        break;
      case '.png':
        contentType = 'image/png';
        break;
      case '.gif':
        contentType = 'image/gif';
        break;
      case '.webp':
        contentType = 'image/webp';
        break;
      case '.svg':
        contentType = 'image/svg+xml';
        break;
      case '.bmp':
        contentType = 'image/bmp';
        break;
      case '.mp4':
        contentType = 'video/mp4';
        break;
      case '.avi':
        contentType = 'video/avi';
        break;
      case '.mpeg':
        contentType = 'video/mpeg';
        break;
      default:
        return NextResponse.json({ message: 'Unsupported file type' }, { status: 400 });
    }

    // Trả về file ảnh
    return new NextResponse(file, {
      headers: {
        'Content-Type': contentType,
      },
    });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return NextResponse.json({ message: 'File not found' }, { status: 404 });
  }
}
