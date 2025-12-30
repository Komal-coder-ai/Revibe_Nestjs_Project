/**
 * @swagger
 * /api/customer/livestream/chat:
 *   post:
 *     summary: Send a chat message in livestream
 *     description: Sends a chat message to a livestream.
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
 *               userId:
 *                 type: string
 *                 example: "65a1234567890abcdef67890"
 *               message:
 *                 type: string
 *                 example: "Hello everyone!"
 *     responses:
 *       200:
 *         description: Chat message sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 chat:
 *                   type: object
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
 *   get:
 *     summary: Get livestream chat messages
 *     description: Retrieves all chat messages for a livestream.
 *     tags:
 *       - Livestream
 *     parameters:
 *       - in: query
 *         name: streamId
 *         required: true
 *         schema:
 *           type: string
 *           example: "65a1234567890abcdef12345"
 *     responses:
 *       200:
 *         description: Chat messages fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 chats:
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
import LiveChat from '@/models/LiveChat';
import connectDB from '@/lib/db';


export async function POST(req: NextRequest) {
  await connectDB();
  try {
    const { streamId, userId, message } = await req.json();
    const chat = await LiveChat.create({ stream: streamId, user: userId, message });
    return NextResponse.json({ data: { status: true, chat } });
  } catch (error: any) {
    return NextResponse.json({ data: { status: false, message: error.message } }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  await connectDB();
  try {
    const { searchParams } = new URL(req.url);
    const streamId = searchParams.get('streamId');
    const chats = await LiveChat.find({ stream: streamId }).populate('user').sort({ createdAt: 1 }).lean();
    return NextResponse.json({ data: { status: true, chats } });
  } catch (error: any) {
    return NextResponse.json({ data: { status: false, message: error.message } }, { status: 500 });
  }
}