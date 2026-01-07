/**
 * @swagger
 * /api/customer/post/detail:
 *   get:
 *     summary: Get post details
 *     description: Retrieves detailed information about a post, including user info, tagged users, comments, and likes.
 *     tags:
 *       - Post
 *     parameters:
 *       - in: query
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *           example: "65a1234567890abcdef12345"
 *       - in: query
 *         name: userId
 *         required: false
 *         schema:
 *           type: string
 *           example: "65a1234567890abcdef67890"
 *     responses:
 *       200:
 *         description: Post details fetched successfully
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
 *                   example: "Post details fetched"
 *                 post:
 *                   type: object
 *                 user:
 *                   type: object
 *                 taggedUsers:
 *                   type: array
 *                   items:
 *                     type: object
 *                 commentCount:
 *                   type: integer
 *                 likeCount:
 *                   type: integer
 *                 userLike:
 *                   type: boolean
 */
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import mongoose from 'mongoose';
import { processPostsWithStats } from '@/common/processPostsWithStats';
import { getAggregatedPosts } from '@/common/getAggregatedPosts';
import { trackPostView } from '@/common/trackPostView';
export async function GET(request: NextRequest) {
    await connectDB();
    try {
        const { searchParams } = new URL(request.url);
        const postId = searchParams.get('postId');
        let userId = searchParams.get('userId');
        if (!userId) {
            return NextResponse.json({ data: { status: false, message: 'userId is required' } }, { status: 400 });
        }
        if (!postId || postId.length !== 24) {
            return NextResponse.json({ data: { status: false, message: 'Invalid postId' } }, { status: 400 });
        }

        // Use getAggregatedPosts for post detail, matching list API
        const posts = await getAggregatedPosts({
            match: {
                _id: new mongoose.Types.ObjectId(postId),
                isDeleted: false
            }, limit: 1
        });
        if (!posts || posts.length === 0) {
            return NextResponse.json({ data: { status: false, message: 'Post not found' } }, { status: 404 });
        }

        // Track post view 
        try {
            await trackPostView(userId, postId);
        } catch (e) {
            // Log but do not block response if view tracking fails
            console.error('Failed to record post view:', e);
        }

        const [responsePost] = await processPostsWithStats(posts, userId);
        return NextResponse.json({ data: { status: true, post: responsePost } });
    } catch (error) {
        console.error(error);
        const message = error instanceof Error ? error.message : 'An unexpected error occurred';
        return NextResponse.json({ data: { status: false, message } },
            { status: 500 });
    }
}
