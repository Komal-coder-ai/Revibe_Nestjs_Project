/**
 * @swagger
 * /api/customer/follow/following:
 *   get:
 *     summary: Get following list
 *     description: Retrieves a paginated list of users that the specified user is following, with optional search.
 *     tags:
 *       - Follow
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           example: "65a1234567890abcdef12345"
 *       - in: query
 *         name: targetUserId
 *         required: true
 *         schema:
 *           type: string
 *           example: "65a1234567890abcdef67890"
 *         description: The user ID whose following list to fetch.
 *       - in: query
 *         name: cursor
 *         required: false
 *         schema:
 *           type: string
 *           example: "2024-12-31T23:59:59.999Z"
 *         description: The createdAt value of the last following from the previous page. Used for cursor-based pagination. Must be used together with cursorId.
 *       - in: query
 *         name: cursorId
 *         required: false
 *         schema:
 *           type: string
 *           example: "65a1234567890abcdef12345"
 *         description: The followingId (or _id) of the last following from the previous page. Used for cursor-based pagination. Must be used together with cursor.
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           default: 20
 *           example: 20
 *       - in: query
 *         name: search
 *         required: false
 *         schema:
 *           type: string
 *           example: "john"
 *     responses:
 *       200:
 *         description: Following fetched successfully
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
 *                   example: "Following fetched"
 *                 following:
 *                   type: array
 *                   items:
 *                     type: object
 *                 total:
 *                   type: integer
 *                 page:
 *                   type: integer
 *                 pageSize:
 *                   type: integer
 */
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Follow from '@/models/Follow';
import mongoose from 'mongoose';
import { getFollowStatusMap } from '@/common/getFollowStatusMap';

// GET /api/follow/following?userId=...&targetId=...&limit=20&cursor=...&cursorId=...
import type { PipelineStage } from 'mongoose';
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId'); // logged-in user
    const targetId = searchParams.get('targetUserId'); // whose following list to fetch
    const cursor = searchParams.get('cursor');
    const cursorId = searchParams.get('cursorId');
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const search = searchParams.get('search')?.trim() || '';
    if (!userId || !targetId) return NextResponse.json({ data: { status: false, message: 'userId and targetId required' } }, { status: 400 });
    if (!/^[a-fA-F0-9]{24}$/.test(targetId)) {
      return NextResponse.json({ data: { status: false, message: 'Invalid targetId format' } }, { status: 400 });
    }
    try {
      const matchStage = {
        follower: new mongoose.Types.ObjectId(targetId),
        status: 'accepted',
        isDeleted: false
      };
      const searchStage = search
        ? [{ $match: { 'followingUser.username': { $regex: search, $options: 'i' } } }]
        : [];
      let cursorFilter: PipelineStage[] = [];
      if (cursor && cursorId) {
        cursorFilter = [
          {
            $match: {
              $or: [
                { createdAt: { $lt: new Date(cursor) } },
                {
                  createdAt: { $eq: new Date(cursor) },
                  _id: { $lt: new mongoose.Types.ObjectId(cursorId) }
                }
              ]
            }
          }
        ];
      }
      const following = await Follow.aggregate([
        { $match: matchStage },
        ...cursorFilter,
        { $sort: { createdAt: -1, _id: -1 } },
        { $lookup: { from: 'users', localField: 'following', foreignField: '_id', as: 'followingUser' } },
        { $unwind: { path: '$followingUser', preserveNullAndEmptyArrays: true } },
        ...searchStage,
        { $limit: limit },
        // Add followersCount for each followingUser
        {
          $lookup: {
            from: 'follows',
            let: { userId: '$followingUser._id' },
            pipeline: [
              { $match: { $expr: { $and: [{ $eq: ['$following', '$$userId'] }, { $eq: ['$status', 'accepted'] }, { $eq: ['$isDeleted', false] }] } } },
              { $count: 'count' }
            ],
            as: 'followersCountArr'
          }
        },
        {
          $addFields: {
            followersCount: { $ifNull: [{ $arrayElemAt: ['$followersCountArr.count', 0] }, 0] }
          }
        },
        {
          $project: {
            _id: 0,
            userId: '$followingUser._id',
            username: '$followingUser.username',
            name: '$followingUser.name',
            profileImage: '$followingUser.profileImage',
            followersCount: 1,
            createdAt: 1,
            followingId: '$_id'
          }
        }
      ]);

      // Add followStatusCode for each user in the list (from logged-in user to each following)
      const followingUserIds = following.map(f => f.userId?.toString?.() ?? f.userId);
      const followStatusMap = await getFollowStatusMap(userId, followingUserIds);
      for (const f of following) {
        const id = f.userId?.toString?.() ?? f.userId;
        f.followStatusCode = followStatusMap[id] ?? 0;
      }

      // Prepare next cursor
      let nextCursor = null;
      let nextCursorId = null;
      if (following.length === limit) {
        const last = following[following.length - 1];
        nextCursor = last.createdAt;
        nextCursorId = last.followingId;
      }

      return NextResponse.json({ data: { status: true, message: 'Following list fetched', following, nextCursor, nextCursorId, limit } });
    } catch (err: any) {
      return NextResponse.json({ data: { status: false, message: 'Server error', error: err?.message || err } }, { status: 500 });
    }
  } catch (error) {
    console.log('Error in fetching following list:', error);
    const message = (error instanceof Error) ? error.message : 'Internal server error';
    return NextResponse.json({ data: { status: false, message } }, { status: 500 });
  }
}
