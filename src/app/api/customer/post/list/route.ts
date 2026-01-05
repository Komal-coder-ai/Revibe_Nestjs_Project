
import { NextRequest, NextResponse } from 'next/server';
/**
 * @swagger
 * /api/customer/post/list:
 *   get:
 *     summary: List posts
 *     description: Retrieves a paginated list of feed posts for the user (following + public accounts), with filtering and cursor-based pagination.
 *     tags:
 *       - Post
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           example: "65a1234567890abcdef12345"
 *       - in: query
 *         name: cursor
 *         required: false
 *         schema:
 *           type: string
 *           example: "2024-12-31T23:59:59.999Z"
 *         description: The createdAt value of the last post from the previous page. Used for cursor-based pagination. Must be used together with cursorId.
 *       - in: query
 *         name: cursorId
 *         required: false
 *         schema:
 *           type: string
 *           example: "65a1234567890abcdef12345"
 *         description: The postId (or _id) of the last post from the previous page. Used for cursor-based pagination. Must be used together with cursor.
 *       - in: query
 *         name: limit
 *         required: false
 *         description: Number of posts to return per page (pagination limit).
 *         schema:
 *           type: integer
 *           default: 10
 *           example: 10
 *       - in: query
 *         name: type
 *         required: false
 *         description: Filter posts by type. Use "all" for all post types, or specify a type (e.g., "video", "image").
 *         schema:
 *           type: string
 *           enum:
 *             - all
 *             - video
 *             - image
 *             - text
 *             - carousel
 *             - poll
 *             - quiz
 *             - reel
 *           default: all
 *       - in: query
 *         name: hashtag
 *         required: false
 *         schema:
 *           type: string
 *           example: ""
 *     responses:
 *       200:
 *         description: Feed posts fetched successfully
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
 *                   example: Posts fetched
 *                 posts:
 *                   type: array
 *                   items:
 *                     type: object
 *                 trending:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       tag:
 *                         type: string
 *                       count:
 *                         type: integer
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     limit:
 *                       type: integer
 *                     nextCursor:
 *                       type: string
 *                       format: date-time
 *                       nullable: true
 *                       example: "2024-12-31T23:59:59.999Z"
 *                     nextCursorId:
 *                       type: string
 *                       nullable: true
 *                       example: "65a1234567890abcdef12345"
 */
import connectDB from '@/lib/db';
import { getAggregatedPosts } from '@/common/getAggregatedPosts';
import Hashtag from '@/models/Hashtag';
import mongoose from 'mongoose';
import { processPostsWithStats } from '@/common/processPostsWithStats';


// GET /api/post/list?userId=...&limit=10&sort=createdAt
// Returns the main feed for the user (following + public posts)

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    if (!userId) {
      return NextResponse.json({ data: { status: false, message: 'userId is required' } }, { status: 400 });
    }
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    let cursor = searchParams.get('cursor');
    let cursorId = searchParams.get('cursorId');
    const type = searchParams.get('type') || 'all';
    if (cursor === '' || cursor === 'null' || cursor == null) cursor = null;
    if (cursorId === '' || cursorId === 'null' || cursorId == null) cursorId = null;

    // Always use feed logic
    const { getFeedPosts } = await import('./services/feedService');
    const posts = await getFeedPosts({ userId, cursor: cursor ?? undefined, cursorId: cursorId ?? undefined, limit, type });
    const trending = await Hashtag.find({}).sort({ count: -1 }).limit(10).select('tag count -_id');
    const postsWithPollStats = await processPostsWithStats(posts, userId);

    return NextResponse.json({
      data: {
        status: true,
        message: 'Posts fetched',
        posts: postsWithPollStats,
        trending,
        pagination: {
          limit,
          nextCursor: postsWithPollStats.length ? postsWithPollStats[postsWithPollStats.length - 1].createdAt : null,
          nextCursorId: postsWithPollStats.length ? postsWithPollStats[postsWithPollStats.length - 1].postId || postsWithPollStats[postsWithPollStats.length - 1]._id : null
        }
      }
    });
  } catch (error) {
    console.error('Error listing posts:', error);
    const message = (error instanceof Error) ? error.message : 'Internal server error';
    return NextResponse.json({ data: { status: false, message } }, { status: 500 });
  }
}
