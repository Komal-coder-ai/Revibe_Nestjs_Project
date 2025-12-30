/**
 * @swagger
 * /api/customer/livestream/list:
 *   get:
 *     summary: List active livestreams
 *     description: Retrieves a list of all active livestreams.
 *     tags:
 *       - Livestream
 *     responses:
 *       200:
 *         description: Active livestreams fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 streams:
 *                   type: array
 *                   items:
 *                     type: object
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 */
import { NextRequest, NextResponse } from 'next/server';
import LiveStream from '@/models/LiveStream';
import connectDB  from '@/lib/db';

export async function GET(req: NextRequest) {
  await connectDB();
  try {
    // List all active streams
    const streams = await LiveStream.find({ isActive: true }).populate('streamer').lean();
    return NextResponse.json({ data: { status: true, streams } });
  } catch (error: any) {
    return NextResponse.json({ data: { status: false, message: error.message } }, { status: 500 });
  }
}