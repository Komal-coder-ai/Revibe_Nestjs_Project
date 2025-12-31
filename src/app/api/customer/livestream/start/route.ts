/**
 * @openapi
 * /api/customer/livestream/start:
 *   post:
 *     summary: Start a new live stream
 *     description: Creates a new live stream for a user and returns stream details and Mux info.
 *     tags:
 *       - LiveStream
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               streamer:
 *                 type: string
 *                 description: User ID of the streamer
 *               title:
 *                 type: string
 *                 description: Title of the stream
 *               category:
 *                 type: string
 *                 description: Category of the stream
 *             required:
 *               - streamer
 *               - title
 *               - category
 *     responses:
 *       200:
 *         description: Live stream started successfully
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
 *                     stream:
 *                       type: object
 *                     muxStream:
 *                       type: object
 *       500:
 *         description: Server error
 */
import { NextRequest, NextResponse } from 'next/server';
import LiveStream from '@/models/LiveStream';
import connectDB from '@/lib/db';
import mux from '@/lib/mux';


export async function POST(req: NextRequest) {
  await connectDB();
  try {
    const { streamer, title, category } = await req.json();
    // Create Mux live stream
    const muxStream = await mux.video.liveStreams.create({
      playback_policy: ['public'],
      new_asset_settings: { playback_policy: ['public'] },
      reconnect_window: 60,
      test: false,
    });
    const muxStreamId = muxStream.id;
    const muxPlaybackId = muxStream.playback_ids?.[0]?.id || '';
    const stream = await LiveStream.create({
      streamer,
      title,
      category,
      muxStreamId,
      muxPlaybackId,
      isActive: true,
      startedAt: new Date(),
      viewers: []
    });
    return NextResponse.json({ data: { status: true, stream, muxStream } });
  } catch (error: any) {
    return NextResponse.json({ data: { status: false, message: error.message } }, { status: 500 });
  }
}