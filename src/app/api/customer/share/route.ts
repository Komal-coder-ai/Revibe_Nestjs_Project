/**
 * @openapi
 * /api/customer/share:
 *   post:
 *     summary: Share a post and generate a shareable URL
 *     description: |
 *       1 = Share post other app 
 *       3 = Share post in app 
 *       2 = Copy post URL 
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
 *                 enum: [1, 2, 3]
 *                 description: |
 *                   Action type:
 *                     1 = Share post (creates a Share record for analytics)
 *                     2 = Copy post URL (creates a Share record for analytics, just returns the link)
 *                     3 = In-app share (creates a Share record for sharing within the app, e.g., Instagram-style)
 *             required:
 *               - userId
 *               - postId
 *               - type
 *     responses:
 *       200:
 *         description: Share created and URL generated. For type 3, message will be 'shared in app'.
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
 *                       description: Share record (type will be 'share', 'copy', or 'inAppShare')
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
    // const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    // const postUrl = `${baseUrl}/customer/post/detail?postId=${postId}`;
    if (type === 1) {
      const share = await Share.create({ userId, postId, type: 'share' });
      return NextResponse.json(
        {
          data: {
            status: true,
            message: 'shared',
            // url: postUrl
          }
        });
    } else if (type === 2) {
      const share = await Share.create({ userId, postId, type: 'copy' });
      return NextResponse.json(
        {
          data: {
            status: true,
            message: 'copied',
            // url: postUrl
          }
        });
    } else if (type === 3) {
      const share = await Share.create({ userId, postId, type: 'inAppShare' });
      return NextResponse.json(
        {
          data: {
            status: true,
            message: 'shared in app',
            // url: postUrl
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
