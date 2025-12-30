/**
 * @swagger
 * /api/customer/cloudinary/delete:
 *   post:
 *     summary: Delete Cloudinary resource
 *     description: Deletes an image, video, or raw file from Cloudinary using its URL.
 *     tags:
 *       - Cloudinary
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               url:
 *                 type: string
 *                 example: "https://res.cloudinary.com/demo/image/upload/v1234567890/folder/image.jpg"
 *     responses:
 *       200:
 *         description: Resource deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Resource deleted"
 */

import { NextRequest, NextResponse } from 'next/server';
import cloudinary from '@/lib/cloudinary';

function extractPublicId(url: string): string | null {
  // Cloudinary URLs are like: https://res.cloudinary.com/<cloud_name>/<resource_type>/upload/v<version>/<public_id>.<ext>
  // This regex extracts the public_id with folder(s), without extension
  const match = url.match(/\/upload\/v\d+\/(.+)\.[a-zA-Z0-9]+$/);
  return match ? match[1] : null;
}

function extractResourceType(url: string): 'image' | 'video' | 'raw' | undefined {
  if (url.includes('/image/upload/')) return 'image';
  if (url.includes('/video/upload/')) return 'video';
  if (url.includes('/raw/upload/')) return 'raw';
  return undefined;
}

export async function POST(request: NextRequest) {
    try {
        const { imageUrl } = await request.json();
        if (!imageUrl) {
            return NextResponse.json({ success: false, message: 'No imageUrl provided' }, { status: 400 });
        }
        const publicId = extractPublicId(imageUrl);
        if (!publicId) {
            return NextResponse.json({ success: false, message: 'Invalid Cloudinary URL' }, { status: 400 });
        }
        const resourceType = extractResourceType(imageUrl);
        if (!resourceType) {
          return NextResponse.json({ success: false, message: 'Could not determine resource type from URL' }, { status: 400 });
        }
        const result = await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
        if (result.result === 'ok') {
            return NextResponse.json({ success: true, result });
        } else {
            return NextResponse.json({ success: false, message: result.result || 'Delete failed', result }, { status: 400 });
        }
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
