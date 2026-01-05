/**
 * @swagger
 * /api/customer/like/list:
 *   get:
 *     summary: List likes for a target
 *     description: Retrieves a paginated list of likes for a post or comment, including user info.
 *     tags:
 *       - Like
 *     parameters:
 *       - in: query
 *         name: targetId
 *         required: true
 *         schema:
 *           type: string
 *           example: "65a1234567890abcdef12345"
 *       - in: query
 *         name: targetType
 *         required: true
 *         schema:
 *           type: string
 *           enum: ["post", "comment"]
 *           example: "post"
 *       - in: query
 *         name: userId
 *         required: false
 *         schema:
 *           type: string
 *           example: "65a1234567890abcdef67890"
 *       - in: query
 *         name: cursorId
 *         required: false
 *         schema:
 *           type: string
 *           example: "65a1234567890abcdef12345"
 *         description: "The _id of the last like from the previous page. For the first page, leave empty."
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           example: 10
 *       - in: query
 *         name: search
 *         required: false
 *         schema:
 *           type: string
 *           example: ""
 *         description: "Search likes by username or name."
 *     responses:
 *       200:
 *         description: Likes fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Likes fetched"
 *                 likes:
 *                   type: array
 *                   items:
 *                     type: object
 *                 nextCursorId:
 *                   type: string
 *                   nullable: true
 *                   example: "65a1234567890abcdef12345"
 *                   description: "The _id to use as cursorId for the next page. Null if no more data."
 *                 limit:
 *                   type: integer
 *                 userLike:
 *                   type: boolean
 */
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';

import Like from '@/models/Like';
import User from '@/models/User';

export async function GET(request: NextRequest) {
  await connectDB();
  try {
    const { searchParams } = new URL(request.url);
    const targetId = searchParams.get('targetId');
    const targetType = searchParams.get('targetType');
    const userId = searchParams.get('userId');
    const cursorId = searchParams.get('cursorId');
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    if (!targetId || !targetType || !['post', 'comment'].includes(targetType)) {
      return NextResponse.json({ data: { status: false, message: 'targetId and valid targetType required' } }, { status: 400 });
    }
    const filter: any = { targetId, targetType, isDeleted: false };
    if (cursorId) {
      filter._id = { $lt: cursorId };
    }
    const likes: any[] = await Like.find(filter)
      .sort({ _id: -1 })
      .limit(limit)
      .lean();
    // Fetch user info for each like
    const userIds = likes.map(l => l.user?.toString()).filter(Boolean);
    type UserType = { userId: any; name: string; username: string; profileImage?: any };
    const rawUsers = await User.find({ _id: { $in: userIds } }).lean();
    const users: UserType[] = rawUsers.map((u: any) => ({
      userId: u._id,
      name: u.name,
      username: u.username,
      profileImage: u.profileImage || []
    }));
    const userMap = Object.fromEntries(users.map(u => [u.userId.toString(), { userId: u.userId, name: u.name, username: u.username, profileImage: u.profileImage }]));
    const likesWithUser = likes.map(l => ({ ...l, user: userMap[l.user?.toString()] || null }));
    // Check if userId liked this target
    let userLike = false;
    if (userId) {
      const like = await Like.findOne({ targetId, targetType, user: userId, isDeleted: false });
      userLike = !!like;
    }
    // Prepare nextCursor
    let nextCursorId = null;
    if (likes.length === limit) {
      nextCursorId = (likes[likes.length - 1] as any)._id.toString();
    }
    return NextResponse.json({
      data: {
        status: true,
        likes: likesWithUser,
        nextCursorId,
        limit,
        userLike
      }
    });
  } catch (error: any) {
    return NextResponse.json({ data: { status: false, message: error.message } }, { status: 500 });
  }
}
