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
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *           example: 1
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           example: 10
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
 *                 total:
 *                   type: integer
 *                 page:
 *                   type: integer
 *                 limit:
 *                   type: integer
 *                 userLike:
 *                   type: boolean
 */
import { NextRequest, NextResponse } from 'next/server';
import connectDB  from '@/lib/db';

import Like from '@/models/Like';
import User from '@/models/User';

export async function GET(request: NextRequest) {
  await connectDB();
  try {
    const { searchParams } = new URL(request.url);
    const targetId = searchParams.get('targetId');
    const targetType = searchParams.get('targetType');
    const userId = searchParams.get('userId');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    if (!targetId || !targetType || !['post', 'comment'].includes(targetType)) {
      return NextResponse.json({ data: { status: false, message: 'targetId and valid targetType required' } }, { status: 400 });
    }
    const filter = { targetId, targetType, isDeleted: false };
    const total = await Like.countDocuments(filter);
    const likes = await Like.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();
    // Fetch user info for each like
    const userIds = likes.map(l => l.user?.toString()).filter(Boolean);
    type UserType = { _id: any; name: string; username: string; profileImage?: any };
    const rawUsers = await User.find({ _id: { $in: userIds } }).lean();
    const users: UserType[] = rawUsers.map((u: any) => ({
      _id: u._id,
      name: u.name,
      username: u.username,
      profileImage: u.profileImage || []
    }));
    const userMap = Object.fromEntries(users.map(u => [u._id.toString(), { _id: u._id, name: u.name, username: u.username, profileImage: u.profileImage }]));
    const likesWithUser = likes.map(l => ({ ...l, user: userMap[l.user?.toString()] || null }));
    // Check if userId liked this target
    let userLike = false;
    if (userId) {
      const like = await Like.findOne({ targetId, targetType, user: userId, isDeleted: false });
      userLike = !!like;
    }
    return NextResponse.json({
      data: {
        status: true,
        likes: likesWithUser,
        total,
        page,
        limit,
        userLike
      }
    });
  } catch (error: any) {
    return NextResponse.json({ data: { status: false, message: error.message } }, { status: 500 });
  }
}
