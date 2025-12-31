/**
 * @openapi
 * /api/customer/share:
 *   post:
 *     summary: Share a post and generate a shareable URL
 *     description: |
 *       1 = Share post (creates a Share record for analytics)
 *       2 = Copy post URL (does NOT create a Share record, just returns the link)
 *     tags:
 *       - Share
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 description: The ID of the user sharing the post
 *               postId:
 *                 type: string
 *                 description: The ID of the post to share
 *               type:
 *                 type: integer
 *                 enum: [1, 2]
 *                 description: |
 *                   Action type:
 *                     1 = Share post (tracks platform, e.g., WhatsApp, Facebook, etc.)
 *                     2 = Copy post URL (no platform required, just generates and returns the link)
 *             required:
 *               - userId
 *               - postId
 *               - type
 *     responses:
 *       200:
 *         description: Share created and URL generated
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
 *                     share:
 *                       type: object
 *                       description: Share record
 *                     url:
 *                       type: string
 *                       description: Shareable URL for the post
 */
import { NextRequest, NextResponse } from 'next/server';
import Share from '@/models/Share';
import connectDB from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { userId, postId, type, } = await req.json();
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    const postUrl = `${baseUrl}/customer/post/detail?postId=${postId}`;
    if (type === 1) {
      const share = await Share.create({ userId, postId, type: 'share' });
      return NextResponse.json(
        {
          data: {
            status: true,
            message: 'shared',
            url: postUrl
          }
        });
    } else if (type === 2) {
      // Create a Share record for copy action as well
      const share = await Share.create({ userId, postId, type: 'copy' });
      return NextResponse.json(
        {
          data: {
            status: true,
            message: 'copied',
            url: postUrl
          }
        });
    } else {
      return NextResponse.json(
        {
          data: {
            status: false,
            message: 'Invalid type value'
          }
        }, { status: 400 });
    }
  } catch (error) {
    console.error('Error sharing/copying post:', error);
    const message = (error instanceof Error) ? error.message : 'Internal server error';
    return NextResponse.json({ data: { status: false, message } }, { status: 500 });
  }
}
