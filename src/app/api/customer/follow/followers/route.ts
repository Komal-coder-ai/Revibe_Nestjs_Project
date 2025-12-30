/**
 * @swagger
 * /api/customer/follow/followers:
 *   get:
 *     summary: Get followers list
 *     description: Retrieves a paginated list of followers for a user, with optional search.
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
 *         description: Followers fetched successfully
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
 *                   example: "Followers fetched"
 *                 followers:
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
// Followers list API with pagination
import { NextRequest, NextResponse } from 'next/server';
// JWT import removed
import connectDB  from '@/lib/db';
import Follow from '@/models/Follow';
import mongoose from 'mongoose';

export async function GET(req: NextRequest) {
    try {
        // JWT and authorization header removed: public access
        await connectDB();
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');
        const page = parseInt(searchParams.get('page') || '1', 10);
        const pageSize = parseInt(searchParams.get('pageSize') || '20', 10);
        const search = searchParams.get('search')?.trim() || '';

        if (!userId) return NextResponse.json({
            data: {
                status: false, message: 'userId required'
            }
        },
            { status: 400 });

        const matchStage = {
            following: new mongoose.Types.ObjectId(userId),
            status: 'accepted',
            isDeleted: false
        };
        const searchStage = search
            ? [{ $match: { 'followerUser.username': { $regex: search, $options: 'i' } } }]
            : [];
        const followers = await Follow.aggregate([
            { $match: matchStage },
            { $sort: { createdAt: -1 } },
            {
                $lookup: {
                    from: 'users',
                    localField: 'follower',
                    foreignField: '_id',
                    as: 'followerUser'
                }
            },
            { $unwind: { path: '$followerUser', preserveNullAndEmptyArrays: true } },
            ...searchStage,
            { $skip: (page - 1) * pageSize },
            { $limit: pageSize },
            // Add followersCount for each followerUser
            {
                $lookup: {
                    from: 'follows',
                    let: { userId: '$followerUser._id' },
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
                    userId: '$followerUser._id',
                    username: '$followerUser.username',
                    name: '$followerUser.name',
                    profileImage: '$followerUser.profileImage',
                    followersCount: 1,
                }
            }
        ]);

        //     1 = following (accepted)
        // 2 = not following
        // 3 = requested (pending)
        // 4 = rejected

        // Add followStatus for each user in the list
        const followerUserIds = followers.map(f => f.userId?.toString?.() ?? f.userId);
        const followDocs = await Follow.find({
            follower: userId,
            following: { $in: followerUserIds },
            isDeleted: false
        }).select('following status');
        const statusMap = new Map();
        for (const doc of followDocs) {
            const id = doc.following.toString();
            if (doc.status === 'accepted') statusMap.set(id, 1);
            else if (doc.status === 'pending') statusMap.set(id, 3);
            else if (doc.status === 'rejected') statusMap.set(id, 4);
        }
        for (const f of followers) {
            const id = f.userId?.toString?.() ?? f.userId;
            f.followStatus = statusMap.get(id) || 2;
        }

        // For total, apply the same search filter
        const totalAgg = await Follow.aggregate([
            { $match: matchStage },
            {
                $lookup: {
                    from: 'users',
                    localField: 'follower',
                    foreignField: '_id',
                    as: 'followerUser'
                }
            },
            { $unwind: { path: '$followerUser', preserveNullAndEmptyArrays: true } },
            ...searchStage,
            { $count: 'total' }
        ]);
        const total = totalAgg[0]?.total || 0;
        return NextResponse.json(
            {
                data:
                {
                    status: true,
                    message: 'Followers fetched',
                    followers, total, page, pageSize
                }
            });
    } catch (error) {
        console.log('Error in fetching followers:', error);
        const message = (error instanceof Error) ? error.message : 'Internal server error';
        return NextResponse.json({ data: { status: false, message } }, { status: 500 });

    }
}
