/**
 * @swagger
 * /api/customer/follow/followers:
 *   get:
 *     summary: Get followers list
 *     description: Retrieves a paginated list of users who follow the specified user, with optional search.
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
 *         name: targetId
 *         required: true
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
import connectDB from '@/lib/db';
import Follow from '@/models/Follow';
import mongoose from 'mongoose';
import { getFollowStatusMap } from '@/common/getFollowStatusMap';

export async function GET(req: NextRequest) {
    try {
        // JWT and authorization header removed: public access
        await connectDB();
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId'); // logged-in user
        const targetId = searchParams.get('targetId'); // whose followers to fetch
        const page = parseInt(searchParams.get('page') || '1', 10);
        const pageSize = parseInt(searchParams.get('pageSize') || '20', 10);
        const search = searchParams.get('search')?.trim() || '';

        if (!userId || !targetId) return NextResponse.json({
            data: {
                status: false, message: 'userId and targetId required'
            }
        },
            { status: 400 });

        const matchStage = {
            following: new mongoose.Types.ObjectId(targetId),
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

        // Add followStatusCode for each user in the list (from logged-in user to each follower)
        const followerUserIds = followers.map(f => f.userId?.toString?.() ?? f.userId);
        const followStatusMap = await getFollowStatusMap(userId, followerUserIds);
        for (const f of followers) {
            const id = f.userId?.toString?.() ?? f.userId;
            f.followStatusCode = followStatusMap[id] ?? 0;
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
