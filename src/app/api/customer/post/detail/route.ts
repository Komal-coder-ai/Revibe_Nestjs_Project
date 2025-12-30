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
import connectDB  from '@/lib/db';
import Post from '@/models/Post';
import User from '@/models/User';
import Comment from '@/models/Comment';
import Like from '@/models/Like';
export async function GET(request: NextRequest) {
    await connectDB();
    try {
        const { searchParams } = new URL(request.url);
        const postId = searchParams.get('postId');
        const userId = searchParams.get('userId');
        if (!postId || postId.length !== 24) {
            return NextResponse.json({ data: { status: false, message: 'Invalid postId' } }, { status: 400 });
        }
        const post = await Post.findById(postId).lean() as any;
        if (!post || post.isDeleted) {
            return NextResponse.json({ data: { status: false, message: 'Post not found' } }, { status: 404 });
        }
        // Populate user info
        const user = await User.findById(post.user).lean() as any;
        const userObj = user ? {
            _id: user._id,
            name: user.name,
            username: user.username,
            profileImage: user.profileImage || []
        } : null;
        // Populate tagged users
        let taggedUsers: any[] = [];
        if (Array.isArray(post.taggedUsers) && post.taggedUsers.length > 0) {
            const tagged = await User.find({ _id: { $in: post.taggedUsers } }).lean();
            taggedUsers = tagged.map(u => ({
                _id: u._id,
                name: u.name,
                username: u.username,
                profileImage: u.profileImage || []
            }));
        }
        // Get comment count for this post
        const commentCount = await Comment.countDocuments({ postId, isDeleted: false });
        // Get like count for this post
        const likeCount = await Like.countDocuments({ targetId: post._id, targetType: 'post', isDeleted: false });
        // Get userLike status
        let userLike = false;
        if (userId) {
            const like = await Like.findOne({ targetId: post._id, targetType: 'post', user: userId, isDeleted: false });
            userLike = !!like;
        }
        // Format poll/quiz options and totalVotes if needed
        let options = post.options;
        let totalVotes = undefined;
        if ((post.type === 'poll' || post.type === 'quiz') && Array.isArray(post.options)) {
            // Aggregate votes for poll/quiz
            const Vote = (await import('@/models/Vote')).default;
            const votes = await Vote.find({ post: post._id });
            totalVotes = votes.length;
        }
        // Fetch comments with commentLike for this post
        let comments = [];
        try {
            const commentApiUrl = `${request.nextUrl.origin || ''}/api/comment/list?postId=${postId}${userId ? `&userId=${userId}` : ''}`;
            const commentRes = await fetch(commentApiUrl);
            const commentJson = await commentRes.json();
            if (commentJson?.data?.comments) {
                comments = commentJson.data.comments;
            }
        } catch (e) {
            // fallback: comments empty
        }
        // Build response object to match post list
        const responsePost = {
            postId: post._id,
            user: userObj,
            taggedUsers,
            type: post.type,
            media: post.media,
            text: post.text,
            caption: post.caption,
            location: post.location,
            hashtags: post.hashtags,
            options,
            correctOption: post.correctOption,
            createdAt: post.createdAt,
            updatedAt: post.updatedAt,
            commentCount,
            likeCount,
            userLike,
            totalVotes,
            comments
        };
        return NextResponse.json({ data: { status: true, post: responsePost } });
    } catch (error: any) {
        console.error(error);
        return NextResponse.json({ data: { status: false, message: error.message } }, { status: 500 });
    }
}
