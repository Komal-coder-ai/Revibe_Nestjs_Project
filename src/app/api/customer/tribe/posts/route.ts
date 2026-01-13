import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import mongoose from 'mongoose';
import { getAggregatedPosts } from '@/common/getAggregatedPosts';
import { processPostsWithStats } from '@/common/processPostsWithStats';

/**
 * @swagger
 * /api/customer/tribe/posts:
 *   get:
 *     summary: Get posts for a tribe
 *     description: Returns a paginated list of posts for a tribe. User must be a member of the tribe to view posts.
 *     tags:
 *       - Tribe
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user making the request
 *       - in: query
 *         name: tribeId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the tribe
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
 *         description: Tribe posts fetched successfully
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

export async function GET(req: NextRequest) {
    try {
        await connectDB();
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');
        const tribeId = searchParams.get('tribeId');
        if (!userId) {
            return NextResponse.json({ data: { status: false, message: 'userId is required' } }, { status: 400 });
        }
        if (!tribeId) {
            return NextResponse.json({ data: { status: false, message: 'tribeId is required' } }, { status: 400 });
        }
        // Check if user is a member of the tribe
        const TribeMember = (await import('@/models/TribeMember')).default;
        const member = await TribeMember.findOne({ tribeId, userId });
        if (!member) {
            return NextResponse.json({ data: { status: false, message: 'You must join this tribe to view its posts.' } }, { status: 403 });
        }
        const limit = parseInt(searchParams.get('limit') || '10', 10);
        let cursor = searchParams.get('cursor');
        let cursorId = searchParams.get('cursorId');
        if (cursor === '' || cursor === 'null' || cursor == null) cursor = null;
        if (cursorId === '' || cursorId === 'null' || cursorId == null) cursorId = null;
        let sort = 'createdAt';
        let matchStage: any = { isDeleted: false, isActive: true, tribe: new mongoose.Types.ObjectId(tribeId) };
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
        console.error('Error listing tribe posts:', error);
        const message = (error instanceof Error) ? error.message : 'Internal server error';
        return NextResponse.json({ data: { status: false, message } }, { status: 500 });
    }
}
