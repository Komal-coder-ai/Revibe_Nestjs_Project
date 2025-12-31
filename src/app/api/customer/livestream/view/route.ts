/**
 * @openapi
 * /api/customer/livestream/view:
 *   post:
 *     summary: Join a live stream and get viewer details
 *     description: Adds a user to a live stream's viewers and returns viewer count and details.
 *     tags:
 *       - LiveStream
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               streamId:
 *                 type: string
 *                 description: LiveStream ID
 *               userId:
 *                 type: string
 *                 description: User ID joining the stream
 *             required:
 *               - streamId
 *               - userId
 *     responses:
 *       200:
 *         description: Viewer joined and details returned
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     status:
 *                       type: boolean
 *                     viewerCount:
 *                       type: integer
 *                     viewers:
 *                       type: array
 *                       items:
 *                         type: object
 *       404:
 *         description: Stream not found or inactive
 *       500:
 *         description: Server error
 */
import { NextRequest, NextResponse } from 'next/server';
import LiveStream from '@/models/LiveStream';
import connectDB  from '@/lib/db';


export async function POST(req: NextRequest) {
  await connectDB();
  try {
    const { streamId, userId } = await req.json();
    const stream = await LiveStream.findById(streamId);
    if (!stream || !stream.isActive) {
      return NextResponse.json({ data: { status: false, message: 'Stream not found or inactive' } }, { status: 404 });
    }
    if (!stream.viewers.includes(userId)) {
      stream.viewers.push(userId);
      await stream.save();
    }
    // Populate viewer user details
    const populatedStream = await LiveStream.findOne({ _id: streamId }).populate('viewers').lean() as { viewers?: any[] } | null;
    if (!populatedStream || !('viewers' in populatedStream) || !Array.isArray(populatedStream.viewers)) {
      return NextResponse.json({ data: { status: false, message: 'Stream not found after update' } }, { status: 404 });
    }
    return NextResponse.json({ data: { status: true, viewerCount: populatedStream.viewers.length, viewers: populatedStream.viewers } });
  } catch (error: any) {
    return NextResponse.json({ data: { status: false, message: error.message } }, { status: 500 });
  }
}