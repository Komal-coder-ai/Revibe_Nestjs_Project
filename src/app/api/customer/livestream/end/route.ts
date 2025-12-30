/**
 * @swagger
 * /api/customer/livestream/end:
 *   post:
 *     summary: End a livestream
 *     description: Ends an active livestream by its streamId.
 *     tags:
 *       - Livestream
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               streamId:
 *                 type: string
 *                 example: "65a1234567890abcdef12345"
 *     responses:
 *       200:
 *         description: Livestream ended successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *       404:
 *         description: Stream not found or already ended
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

export async function POST(req: NextRequest) {
  await connectDB();
  try {
    const { streamId } = await req.json();
    const stream = await LiveStream.findById(streamId);
    if (!stream || !stream.isActive) {
      return NextResponse.json({ data: { status: false, message: 'Stream not found or already ended' } }, { status: 404 });
    }
    stream.isActive = false;
    stream.endedAt = new Date();
    await stream.save();
    return NextResponse.json({ data: { status: true } });
  } catch (error: any) {
    return NextResponse.json({ data: { status: false, message: error.message } }, { status: 500 });
  }
}