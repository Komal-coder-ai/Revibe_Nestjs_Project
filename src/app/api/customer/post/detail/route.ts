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
import Post from '@/models/Post';
import User from '@/models/User';
import { processPostsWithStats } from '@/common/processPostsWithStats';
export async function GET(request: NextRequest) {
    await connectDB();
    try {
        const { searchParams } = new URL(request.url);
        const postId = searchParams.get('postId');
        let userId = searchParams.get('userId');
        if (!postId || postId.length !== 24) {
            return NextResponse.json({ data: { status: false, message: 'Invalid postId' } }, { status: 400 });
        }
        const post = await Post.findById(postId).lean();
        if (!post || Array.isArray(post) || (post as any).isDeleted) {
            return NextResponse.json({ data: { status: false, message: 'Post not found' } }, { status: 404 });
        }
        // Populate user and taggedUsers fields to match list API aggregation
        let user = null;
        if ((post as any).user) {
            user = await User.findById((post as any).user).lean();
            if (Array.isArray(user)) {
                user = user.length > 0 ? user[0] : null;
            }
        }
        (post as any).user = user ? {
            _id: (user as any)._id,
            name: (user as any).name,
            username: (user as any).username,
            profileImage: (user as any).profileImage || []
        } : null;
        if (Array.isArray((post as any).taggedUsers) && (post as any).taggedUsers.length > 0) {
            const tagged = await User.find({ _id: { $in: (post as any).taggedUsers } }).lean();
            (post as any).taggedUsers = tagged.map((u: any) => ({
                _id: u._id,
                name: u.name,
                username: u.username,
                profileImage: u.profileImage || []
            }));
        } else {
            (post as any).taggedUsers = [];
        }
        // Use processPostsWithStats for a single post
        if (!userId) userId = '';
        const [responsePost] = await processPostsWithStats([post], userId);
        return NextResponse.json({ data: { status: true, post: responsePost } });
    } catch (error: any) {
        console.error(error);
        return NextResponse.json({ data: { status: false, message: error.message } },
            { status: 500 });
    }
}
