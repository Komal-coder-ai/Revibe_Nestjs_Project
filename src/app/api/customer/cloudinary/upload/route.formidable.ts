import formidable, { File } from 'formidable';
import { NextRequest, NextResponse } from 'next/server';
import cloudinary from '@/lib/cloudinary';
import { Readable } from 'stream';

export const config = {
  api: {
    bodyParser: false,
  },
};

async function parseForm(req: Request): Promise<{ fields: formidable.Fields; files: formidable.Files }> {
  return new Promise((resolve, reject) => {
    const form = formidable({ multiples: false });
    form.parse(req as any, (err, fields, files) => {
      if (err) return reject(err);
      resolve({ fields, files });
    });
  });
}

export async function POST(request: NextRequest) {
  try {
    const req = (request as any).req || request;
    const { files, fields } = await parseForm(req);
    let file: File | undefined;
    if (Array.isArray(files.file)) {
      file = files.file[0];
    } else {
      file = files.file as File | undefined;
    }
    if (!file) {
      return NextResponse.json({ success: false, message: 'No file uploaded' }, { status: 400 });
    }
    const folderValue = Array.isArray(fields.folder) ? fields.folder[0] : fields.folder;
    const folderName = folderValue && typeof folderValue === 'string' && folderValue.trim() !== '' ? folderValue.trim() : 'uploads';
    const publicId = `file_${Date.now()}`;
    const stream = cloudinary.uploader.upload_stream(
      { folder: folderName, public_id: publicId, resource_type: 'auto' },
      (error: any, result: any) => {
        if (error) {
          return NextResponse.json({ success: false, message: error.message }, { status: 500 });
        }
        return NextResponse.json({ success: true, url: result.secure_url });
      }
    );
    Readable.from(file as any).pipe(stream);
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
