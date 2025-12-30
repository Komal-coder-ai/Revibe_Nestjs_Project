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
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *           example: 1
 *       - in: query
 *         name: pageSize
 *         required: false
 *         schema:
 *           type: integer
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
import connectDB  from '@/lib/db';
import Follow from '@/models/Follow';
import mongoose from 'mongoose';

// GET /api/follow/following?userId=...&page=1&pageSize=20
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '20', 10);
    const search = searchParams.get('search')?.trim() || '';
    if (!userId) return NextResponse.json({ data: { status: false, message: 'userId required' } }, { status: 400 });
    if (!/^[a-fA-F0-9]{24}$/.test(userId)) {
      return NextResponse.json({ data: { status: false, message: 'Invalid userId format' } }, { status: 400 });
    }
    try {
      const matchStage = {
        follower: new mongoose.Types.ObjectId(userId),
        status: 'accepted',
        isDeleted: false
      };
      const searchStage = search
        ? [{ $match: { 'followingUser.username': { $regex: search, $options: 'i' } } }]
        : [];
      const following = await Follow.aggregate([
        { $match: matchStage },
        { $sort: { createdAt: -1 } },
        { $lookup: { from: 'users', localField: 'following', foreignField: '_id', as: 'followingUser' } },
        { $unwind: { path: '$followingUser', preserveNullAndEmptyArrays: true } },
        ...searchStage,
        { $skip: (page - 1) * pageSize },
        { $limit: pageSize },
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
          }
        }
      ]);

      // Add followStatus for each user in the list
      const followingUserIds = following.map(f => f.userId?.toString?.() ?? f.userId);
      const followDocs = await Follow.find({
        follower: userId,
        following: { $in: followingUserIds },
        isDeleted: false
      }).select('following status');
      const statusMap = new Map();
      for (const doc of followDocs) {
        const id = doc.following.toString();
        if (doc.status === 'accepted') statusMap.set(id, 1);
        else if (doc.status === 'pending') statusMap.set(id, 3);
        else if (doc.status === 'rejected') statusMap.set(id, 4);
      }
      for (const f of following) {
        const id = f.userId?.toString?.() ?? f.userId;
        f.followStatus = statusMap.get(id) || 2;
      }
      // For total, apply the same search filter
      const totalAgg = await Follow.aggregate([
        { $match: matchStage },
        { $lookup: { from: 'users', localField: 'following', foreignField: '_id', as: 'followingUser' } },
        { $unwind: { path: '$followingUser', preserveNullAndEmptyArrays: true } },
        ...searchStage,
        { $count: 'total' }
      ]);
      const total = totalAgg[0]?.total || 0;
      return NextResponse.json({ data: { status: true, message: 'Following list fetched', following, total, page, pageSize } });
    } catch (err: any) {
      return NextResponse.json({ data: { status: false, message: 'Server error', error: err?.message || err } }, { status: 500 });
    }
  } catch (error) {
    console.log('Error in fetching following list:', error);
    const message = (error instanceof Error) ? error.message : 'Internal server error';
    return NextResponse.json({ data: { status: false, message } }, { status: 500 });

  }
}
