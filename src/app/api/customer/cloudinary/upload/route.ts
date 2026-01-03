export const runtime = 'nodejs'; // 🔴 REQUIRED


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
 *                 url:
 *                   type: string
 *                   example: "https://res.cloudinary.com/demo/image/upload/v1234567890/uploads/sample.jpg"
 *       400:
 *         description: No file uploaded
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "No file uploaded"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Internal server error"
 */


// import { NextRequest, NextResponse } from 'next/server';
// import cloudinary from '@/lib/cloudinary';

// export async function POST(request: NextRequest) {
//     try {
//         const formData = await request.formData();
//         const file = formData.get('file');
//         const folder = formData.get('folder');
//         if (!file || !(file instanceof File)) {
//             return NextResponse.json({ success: false, message: 'No file uploaded' }, { status: 400 });
//         }
//         const folderName = typeof folder === 'string' && folder.trim() !== '' ? folder.trim() : 'uploads';
//         const arrayBuffer = await file.arrayBuffer();
//         const buffer = Buffer.from(arrayBuffer);
//         const publicId = `file_${Date.now()}`;
//         const result = await new Promise((resolve, reject) => {
//             cloudinary.uploader.upload_stream(
//                 { folder: folderName, public_id: publicId, resource_type: 'auto' },
//                 (error: any, result: any) => {
//                     if (error) return reject(error);
//                     resolve(result);
//                 }
//             ).end(buffer);
//         });
//         return NextResponse.json({ success: true, url: (result as any).secure_url });
//     } catch (error: any) {
//         return NextResponse.json({ success: false, message: error.message }, { status: 500 });
//     }
// }


import { NextRequest, NextResponse } from 'next/server';
import cloudinary from '@/lib/cloudinary';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();

        const file = formData.get('file');
        const folder = formData.get('folder');

        if (!file || !(file instanceof File)) {
            return NextResponse.json(
                { success: false, message: 'No file uploaded' },
                { status: 400 }
            );
        }

        const folderName =
            typeof folder === 'string' && folder.trim() !== ''
                ? folder.trim()
                : 'uploads';

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const result: any = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream(
                {
                    folder: folderName,
                    resource_type: 'auto',
                },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            ).end(buffer);
        });

        return NextResponse.json({
            success: true,
            url: result.secure_url,
        });
    } catch (error: any) {
        console.error('UPLOAD ERROR:', error);
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
}
