/**
 * @openapi
 * /api/customer/post/userPostList:
 *   get:
 *     summary: Get a user's post list
 *     description: Returns a paginated list of posts for the specified user (targetId), with stats and cursor-based pagination. Requires userId (the requester) and targetId (whose posts to fetch).
 *     tags:
 *       - Post
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user making the request (for like/follow info)
 *       - in: query
 *         name: targetId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user whose posts to fetch
 *       - in: query
 *         name: type
 *         required: false
 *         schema:
 *           type: string
 *         description: Filter posts by type (image, video, text, etc.)
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of posts per page
 *       - in: query
 *         name: cursor
 *         required: false
 *         schema:
 *           type: string
 *           format: date-time
 *         description: The createdAt value of the last post from the previous page (for cursor-based pagination)
 *       - in: query
 *         name: cursorId
 *         required: false
 *         schema:
 *           type: string
 *         description: The postId (or _id) of the last post from the previous page (for cursor-based pagination)
 *     responses:
 *       200:
 *         description: Posts fetched successfully
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
 *                       example: true
 *                     message:
 *                       type: string
 *                       example: Posts fetched
 *                     posts:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           postId:
 *                             type: string
 *                           user:
 *                             type: object
 *                           userVoted:
 *                             type: boolean
 *                           userVoteOption:
 *                             type: integer
 *                             nullable: true
 *                           taggedUsers:
 *                             type: array
 *                             items:
 *                               type: object
 *                           type:
 *                             type: string
 *                           media:
 *                             type: array
 *                             items:
 *                               type: object
 *                           text:
 *                             type: string
 *                           caption:
 *                             type: string
 *                           location:
 *                             type: string
 *                           hashtags:
 *                             type: array
 *                             items:
 *                               type: string
 *                           options:
 *                             type: array
 *                             items:
 *                               type: object
 *                           correctOption:
 *                             type: integer
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                           updatedAt:
 *                             type: string
 *                             format: date-time
 *                           commentCount:
 *                             type: integer
 *                           likeCount:
 *                             type: integer
 *                           shareCount:
 *                             type: integer
 *                           userLike:
 *                             type: boolean
 *                           totalVotes:
 *                             type: integer
 *                             nullable: true
 *                           isLoggedInUser:
 *                             type: boolean
 *                           followStatusCode:
 *                             type: integer
 *                             description: Follow/friend status code between logged-in user and post's user. 0 = no relation, 1 = pending, 2 = accepted, 3 = rejected, 4 = self.
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         limit:
 *                           type: integer
 *                         nextCursor:
 *                           type: string
 *                           format: date-time
 *                           nullable: true
 *                         nextCursorId:
 *                           type: string
 *                           nullable: true
 */

import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import mongoose from 'mongoose';
import { getAggregatedPosts } from '@/common/getAggregatedPosts';
import { processPostsWithStats } from '@/common/processPostsWithStats';

export async function GET(req: NextRequest) {
    try {
        await connectDB();
        const { searchParams } = new URL(req.url);
        // userId: currently logged-in user (for like/feed info), targetId: whose posts to fetch (required)
        const userId = searchParams.get('userId');
        const targetId = searchParams.get('targetId');
        if (!userId) {
            return NextResponse.json({ data: { status: false, message: 'userId is required' } }, { status: 400 });
        }
        if (!targetId) {
            return NextResponse.json({ data: { status: false, message: 'targetId is required' } }, { status: 400 });
        }
        const limit = parseInt(searchParams.get('limit') || '10', 10);
        let cursor = searchParams.get('cursor');
        let cursorId = searchParams.get('cursorId');
        if (cursor === '' || cursor === 'null' || cursor == null) cursor = null;
        if (cursorId === '' || cursorId === 'null' || cursorId == null) cursorId = null;
        const type = searchParams.get('type');

        // Build filter for posts (always use targetId)
        let filter: any = { isDeleted: false, user: new mongoose.Types.ObjectId(targetId.toString()) };
        if (type && type !== 'all') {
            filter.type = type;
        }
        let sort = 'createdAt';
        let matchStage = { ...filter };
        if (cursor && cursorId) {
            matchStage.$or = [
                { [sort]: { $lt: new Date(cursor) } },
                { [sort]: new Date(cursor), _id: { $lt: mongoose.Types.ObjectId.isValid(cursorId) ? new mongoose.Types.ObjectId(cursorId) : cursorId } }
            ];
        } else if (cursor) {
            matchStage[sort] = { $lt: new Date(cursor) };
        }

        const posts = await getAggregatedPosts({
            match: matchStage,
            limit,
            sort: { [sort]: -1 }
        });

        const postsWithStats = await processPostsWithStats(posts, userId);

        return NextResponse.json({
            data: {
                status: true,
                message: 'Posts fetched',
                posts: postsWithStats,
                pagination: {
                    limit,
                    nextCursor: postsWithStats.length ? postsWithStats[postsWithStats.length - 1].createdAt : null,
                    nextCursorId: postsWithStats.length ? postsWithStats[postsWithStats.length - 1].postId || postsWithStats[postsWithStats.length - 1]._id : null
                }
            }
        });
    } catch (error) {
        console.error('Error listing user posts:', error);
        const message = (error instanceof Error) ? error.message : 'Internal server error';
        return NextResponse.json({ data: { status: false, message } }, { status: 500 });
    }
}
