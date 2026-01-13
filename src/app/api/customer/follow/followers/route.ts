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
 *         name: targetUserId
 *         required: true
 *         schema:
 *           type: string
 *           example: "65a1234567890abcdef67890"
 *       - in: query
 *         name: cursor
 *         required: false
 *         schema:
 *           type: string
 *           example: "2024-12-31T23:59:59.999Z"
 *         description: The createdAt value of the last follower from the previous page. Used for cursor-based pagination. Must be used together with cursorId.
 *       - in: query
 *         name: cursorId
 *         required: false
 *         schema:
 *           type: string
 *           example: "65a1234567890abcdef12345"
 *         description: The followerId (or _id) of the last follower from the previous page. Used for cursor-based pagination. Must be used together with cursor.
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
import mongoose, { PipelineStage } from 'mongoose';
import { getFollowStatusMap } from '@/common/getFollowStatusMap';

export async function GET(req: NextRequest) {
    try {
        await connectDB();
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId'); // logged-in user
        const targetUserId = searchParams.get('targetUserId'); // whose followers to fetch
        let cursor = searchParams.get('cursor');
        let cursorId = searchParams.get('cursorId');
        const limit = parseInt(searchParams.get('limit') || '20', 10);
        let search = searchParams.get('search')?.trim() || '';

        if (cursor === '' || cursor === 'null' || cursor == null) cursor = null;
        if (cursorId === '' || cursorId === 'null' || cursorId == null) cursorId = null;
        if (search === '' || search === "" || search === 'null' || search == null) search = "";


        if (!userId || !targetUserId) return NextResponse.json({
            data: {
                status: false, message: 'userId and targetUserId required'
            }
        },
            { status: 400 });

        const matchStage = {
            following: new mongoose.Types.ObjectId(targetUserId),
            status: 'accepted',
            isDeleted: false
        };
        const searchStage = search
            ? [{
                $match: {
                    $or: [
                        { 'followerUser.username': { $regex: search, $options: 'i' } },
                        { 'followerUser.name': { $regex: search, $options: 'i' } },
                    ]
                }
            }
            ]
            : [];

        // Cursor-based pagination logic
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

        const followers = await Follow.aggregate([
            { $match: matchStage },
            ...cursorFilter,
            { $sort: { createdAt: -1, _id: -1 } },
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
            { $limit: limit },
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
                    createdAt: 1,
                    followerId: '$_id'
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

        // Prepare next cursor
        let nextCursor = null;
        let nextCursorId = null;
        if (followers.length === limit) {
            const last = followers[followers.length - 1];
            nextCursor = last.createdAt;
            nextCursorId = last.followerId;
        }

        return NextResponse.json(
            {
                data:
                {
                    status: true,
                    message: 'Followers fetched',
                    followers,
                    nextCursor,
                    nextCursorId,
                    limit
                }
            });
    } catch (error) {
        console.log('Error in fetching followers:', error);
        const message = (error instanceof Error) ? error.message : 'Internal server error';
        return NextResponse.json({ data: { status: false, message } }, { status: 500 });
    }
}
