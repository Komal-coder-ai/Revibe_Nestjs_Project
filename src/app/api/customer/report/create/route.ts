/**
 * @swagger
 * /api/customer/report/create:
 *   post:
 *     summary: Create a report for a post or user
 *     description: Allows a user to report a post or another user. Validation (only one of postId or targetUserId) is handled by the API.
 *     tags:
 *       - Report
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *             properties:
 *               userId:
 *                 type: string
 *                 description: ID of the reporting user
 *                 example: "66b9c8e8a4f1a2b3c4d5e678"
 *               postId:
 *                 type: string
 *                 description: ID of the post being reported (optional)
 *                 nullable: true
 *                 example: "66b9c8e8a4f1a2b3c4d5e679"
 *               targetUserId:
 *                 type: string
 *                 description: ID of the user being reported (optional)
 *                 nullable: true
 *                 example: "66b9c8e8a4f1a2b3c4d5e680"
 *               reason:
 *                 type: string
 *                 description: Reason for reporting
 *                 example: "Spam content"
 *     responses:
 *       201:
 *         description: Report created successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Internal server error
 */


import { NextRequest, NextResponse } from 'next/server';
import Report from '@/models/Report';
import Post from '@/models/Post';
import User from '@/models/User';
import connectDB from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { userId, postId, targetUserId, reason } = await req.json();
    // Must provide exactly one: postId or targetUserId
    if (!userId || (!postId && !targetUserId)) {
      return NextResponse.json({ data: { status: false, message: 'userId and either postId or targetUserId is required' } }, { status: 400 });
    }
    if ((postId && targetUserId) || (!postId && !targetUserId)) {
      return NextResponse.json({ data: { status: false, message: 'Provide only one of postId or targetUserId, not both and not neither.' } }, { status: 400 });
    }

    // Validate that the user exists
    const reportingUser = await User.findById(userId);
    if (!reportingUser) {
      return NextResponse.json({ data: { status: false, message: 'Reporting user does not exist.' } }, { status: 400 });
    }

    // Validate that the post or target user exists
    if (postId) {
      const post = await Post.findById(postId);
      if (!post) {
        return NextResponse.json({ data: { status: false, message: 'Reported post does not exist.' } }, { status: 400 });
      }
    }
    if (targetUserId) {
      const targetUser = await User.findById(targetUserId);
      if (!targetUser) {
        return NextResponse.json({ data: { status: false, message: 'Reported user does not exist.' } }, { status: 400 });
      }
    }

    // Reason is optional
    const reportData: any = { userId };
    if (postId) {
      reportData.postId = postId;
      reportData.reportType = 'post';
    }
    if (targetUserId) {
      reportData.targetUserId = targetUserId;
      reportData.reportType = 'user';
    }
    if (reason) reportData.reason = reason;
    const report = await Report.create(reportData);
    return NextResponse.json({ data: { status: true, report } });
  } catch (error) {
    console.error('Error in POST /api/customer/report/create:', error);
    return NextResponse.json({ data: { status: false, message: 'Internal Server Error' } }, { status: 500 });
  }
}
// ...existing code above...