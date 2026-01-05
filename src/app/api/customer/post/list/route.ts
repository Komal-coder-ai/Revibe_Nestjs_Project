// Helper to add computed fields to posts (used for both feed and non-feed)

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
 *         description: "The createdAt value of the last post from the previous page. Used for cursor-based pagination. Must be used together with cursorId."
 *       - in: query
 *         name: cursorId
 *         required: false
 *         schema:
 *           type: string
 *           example: "65a1234567890abcdef12345"
 *         description: "The postId (or _id) of the last post from the previous page. Used for cursor-based pagination. Must be used together with cursor."
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
 *                   example: "Posts fetched"
 *                 posts:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       postId:
 *                         type: string
 *                         example: "65a1234567890abcdef12345"
 *                       user:
 *                         type: object
 *                       userVoted:
 *                         type: boolean
 *                         description: "True if the logged-in user has voted on this poll/quiz post, false otherwise. Always present."
 *                         example: false
 *                       userVoteOption:
 *                         type: integer
 *                         nullable: true
 *                         description: "The index of the option the user selected, or null if not voted. Always present."
 *                         example: 2
 *                       taggedUsers:
 *                         type: array
 *                         items:
 *                           type: object
 *                       type:
 *                         type: string
 *                       media:
 *                         type: array
 *                         items:
 *                           type: object
 *                       text:
 *                         type: string
 *                       caption:
 *                         type: string
 *                       location:
 *                         type: string
 *                       hashtags:
 *                         type: array
 *                         items:
 *                           type: string
 *                       options:
 *                         type: array
 *                         items:
 *                           type: object
 *                       correctOption:
 *                         type: integer
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                       commentCount:
 *                         type: integer
 *                       likeCount:
 *                         type: integer
 *                       shareCount:
 *                         type: integer
 *                       userLike:
 *                         type: boolean
 *                       totalVotes:
 *                         type: integer
 *                         nullable: true
 *                       isLoggedInUser:
 *                         type: boolean
 *                       followStatusCode:
 *                         type: integer
 *                         description: "Follow/friend status code between logged-in user and post's user. 0 = no relation, 1 = pending, 2 = accepted, 3 = rejected, 4 = self."
 *                         example: 2
 *                 trending:
 *                   type: array
 *                   description: Trending hashtags (only present when feed=true)
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
 *                       description: "The createdAt value of the last post in the current page. Use this as the cursor for the next request."
 *                     nextCursorId:
 *                       type: string
 *                       nullable: true
 *                       example: "65a1234567890abcdef12345"
 *                       description: "The postId (or _id) of the last post in the current page. Use this as the cursorId for the next request."
 */

import { NextRequest, NextResponse } from 'next/server';
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
