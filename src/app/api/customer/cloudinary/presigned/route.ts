/**
 * @swagger
 * /api/customer/cloudinary/presigned:
 *   post:
 *     summary: Get Cloudinary presigned upload parameters
 *     description: Returns a signature and parameters for uploading directly to Cloudinary from the client.
 *     tags:
 *       - Cloudinary
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 description: The type of file/folder to upload to (numeric string expected)
 *                 default: '1'
 *     responses:
 *       200:
 *         description: Presigned parameters returned
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     url:
 *                       type: string
 *                       example: https://api.cloudinary.com/v1_1/demo/auto/upload
 *                     apiKey:
 *                       type: string
 *                       example: demo_api_key
 *                     timestamp:
 *                       type: integer
 *                       example: 1700000000
 *                     signature:
 *                       type: string
 *                       example: demo_signature
 *                     folder:
 *                       type: string
 *                       example: uploads/demo
 */
import { NextRequest, NextResponse } from 'next/server';
// Update the import path to a relative path based on your project structure
import { getCloudinaryFolder } from './cloudinaryFolders';
import { v2 as cloudinary } from 'cloudinary';
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type } = body;

    if (!type) {
      return NextResponse.json(
        { message: 'type is required' },
        { status: 400 }
      );
    }

    const folder = getCloudinaryFolder(Number(type));
    const timestamp = Math.round(Date.now() / 1000);

    const signature = cloudinary.utils.api_sign_request(
      { timestamp, folder },
      process.env.CLOUDINARY_SECRET!
    );

    return NextResponse.json({
      status: true,
      data: {
        apiKey: process.env.CLOUDINARY_KEY,
        cloudName: process.env.CLOUDINARY_NAME,
        timestamp,
        signature,
        folder,
      },
    });
  } catch (error: any) {
    console.error('Cloudinary signature error:', error);
    return NextResponse.json(
      { status: false, message: error.message },
      { status: 500 }
    );
  }
}