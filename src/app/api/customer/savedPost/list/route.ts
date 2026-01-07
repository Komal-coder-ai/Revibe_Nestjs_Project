/**
 * @openapi
 * /api/customer/savedPost/list:
 *   get:
 *     summary: Get list of saved posts
 *     description: Returns a list of posts saved by the user (not soft-deleted).
 *     tags:
 *       - SavedPost
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user whose saved posts to fetch
 *       - in: query
 *         name: cursorId
 *         required: false
 *         schema:
 *           type: string
 *           example: "65a1234567890abcdef12345"
 *         description: The _id of the last saved post from the previous page. For the first page, leave empty.
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of posts per page
 *       - in: query
 *         name: search
 *         required: false
 *         schema:
 *           type: string
 *         description: Search keyword to filter posts by text, caption, or hashtags
 *     responses:
 *       200:
 *         description: List of saved posts (same structure as post list API)
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
 *                             description: True if the logged-in user has voted on this poll/quiz post, false otherwise.
 *                           userVoteOption:
 *                             type: integer
 *                             nullable: true
 *                             description: The index of the option the user selected, or null if not voted.
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
 *                     nextCursorId:
 *                       type: string
 *                       nullable: true
 *                       example: "65a1234567890abcdef12345"
 *                     limit:
 *                       type: integer
 * */
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import mongoose from 'mongoose';
import SavedPost from '@/models/SavedPost';
import { getAggregatedPosts } from '@/common/getAggregatedPosts';
import { processPostsWithStats } from '@/common/processPostsWithStats';


// Separate API for saved post list (GET)
export async function GET(req: NextRequest) {
    try {
        await connectDB();
        const userId = req.nextUrl.searchParams.get('userId');
        const cursorId = req.nextUrl.searchParams.get('cursorId');
        const limit = parseInt(req.nextUrl.searchParams.get('limit') || '10', 10);
        if (!userId) {
            return NextResponse.json({ data: { status: false, message: 'userId is required' } }, { status: 400 });
        }
        // Cursor-based pagination for saved posts
        const savedFilter: any = { userId: new mongoose.Types.ObjectId(userId), isDeleted: false };
        if (cursorId) {
            savedFilter._id = { $lt: cursorId };
        }
        const savedDocs = await SavedPost.find(savedFilter)
            .sort({ _id: -1 })
            .limit(limit);
        const postIds = savedDocs.map(doc =>
            typeof doc.postId === 'string' && mongoose.Types.ObjectId.isValid(doc.postId)
                ? new mongoose.Types.ObjectId(doc.postId)
                : doc.postId
        );
        // Build post match filter
        let postMatch: any = { _id: { $in: postIds }, isDeleted: false };
        const search = req.nextUrl.searchParams.get('search');
        if (search) {
            const regex = new RegExp(search, 'i');
            postMatch.$or = [
                { text: regex },
                { caption: regex },
                { hashtags: regex }
            ];
        }
        // Use shared aggregation utility
        const posts = await getAggregatedPosts({ match: postMatch, limit });
        // Use shared post-processing utility for stats, likes, votes, etc.
        const postsWithStats = await processPostsWithStats(posts, userId);
        // Prepare nextCursorId
        let nextCursorId = null;
        if (savedDocs.length === limit) {
            nextCursorId = savedDocs[savedDocs.length - 1]._id.toString();
        }
        return NextResponse.json({
            data: {
                status: true,
                posts: postsWithStats,
                nextCursorId,
                limit
            }
        });
    } catch (error) {
        console.error('Error fetching saved posts:', error);
        const message = (error instanceof Error) ? error.message : 'Internal server error';
        return NextResponse.json({ data: { status: false, message } }, { status: 500 });
    }
}
