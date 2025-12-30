/**
 * @swagger
 * /api/customer/livestream/like:
 *   post:
 *     summary: Like a livestream
 *     description: Adds a like to a livestream for a user. Prevents duplicate likes.
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
 *     responses:
 *       200:
 *         description: Like added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 likeCount:
 *                   type: integer
 *       409:
 *         description: Already liked
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
 *                   example: "Already liked"
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
 *     summary: Get livestream like count
 *     description: Retrieves the total number of likes for a livestream.
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
 *         description: Like count fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 likeCount:
 *                   type: integer
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
import LiveLike from '@/models/LiveLike';
import connectDB  from '@/lib/db';

export async function POST(req: NextRequest) {
  await connectDB();
  try {
    const { streamId, userId } = await req.json();
    // Prevent duplicate likes
    const existing = await LiveLike.findOne({ stream: streamId, user: userId });
    if (existing) {
      return NextResponse.json({ data: { status: false, message: 'Already liked' } }, { status: 409 });
    }
    await LiveLike.create({ stream: streamId, user: userId });
    const likeCount = await LiveLike.countDocuments({ stream: streamId });
    return NextResponse.json({ data: { status: true, likeCount } });
  } catch (error: any) {
    return NextResponse.json({ data: { status: false, message: error.message } }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  await connectDB();
  try {
    const { searchParams } = new URL(req.url);
    const streamId = searchParams.get('streamId');
    const likeCount = await LiveLike.countDocuments({ stream: streamId });
    return NextResponse.json({ data: { status: true, likeCount } });
  } catch (error: any) {
    return NextResponse.json({ data: { status: false, message: error.message } }, { status: 500 });
  }
}