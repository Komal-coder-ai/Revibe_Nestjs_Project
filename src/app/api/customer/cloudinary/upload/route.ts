
/**
 * @swagger
 * /api/customer/cloudinary/upload:
 *   post:
 *     summary: Upload file to Cloudinary
 *     description: Uploads an image, video, or raw file to Cloudinary using multipart/form-data.
 *     tags:
 *       - Cloudinary
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *               folder:
 *                 type: string
 *                 description: "Target folder in Cloudinary (optional, defaults to 'uploads')"
 *     responses:
 *       200:
 *         description: File uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "File uploaded"
 *                 url:
 *                   type: string
 */



import { NextRequest, NextResponse } from 'next/server';
import cloudinary from '@/lib/cloudinary';

export async function POST(request: NextRequest) {
    try {
        console.log('Received POST request for Cloudinary upload');
        const formData = await request.formData();
        console.log('FormData:', formData);
        const file = formData.get('file');
        const folder = formData.get('folder');
        console.log('File:', file);
        console.log('Folder:', folder);
        if (!file || !(file instanceof File)) {
            console.log('No file uploaded or file is not instance of File');
            return NextResponse.json({ success: false, message: 'No file uploaded' }, { status: 400 });
        }
        const folderName = typeof folder === 'string' && folder.trim() !== '' ? folder.trim() : 'uploads';
        console.log('Using folderName:', folderName);
        const arrayBuffer = await file.arrayBuffer();
        console.log('ArrayBuffer length:', arrayBuffer.byteLength);
        const buffer = Buffer.from(arrayBuffer);
        console.log('Buffer length:', buffer.length);
        const publicId = `image_${Date.now()}`;
        console.log('Generated publicId:', publicId);
        const result = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream(
                { folder: folderName, public_id: publicId },
                (error: import('cloudinary').UploadApiErrorResponse | undefined, result: import('cloudinary').UploadApiResponse | undefined) => {
                    if (error) {
                        console.error('Cloudinary upload error:', error);
                        return reject(error);
                    }
                    console.log('Cloudinary upload result:', result);
                    resolve(result);
                }
            ).end(buffer);
        });
        console.log('Final result:', result);
        return NextResponse.json({ success: true, url: (result as any).secure_url });
    } catch (error: any) {
        console.error('Error in Cloudinary upload route:', error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
