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
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
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
 *                             properties:
 *                               _id: { type: string }
 *                               username: { type: string }
 *                               name: { type: string }
 *                               profileImage: { type: array, items: { type: object } }
 *                               followersCount: { type: integer }
 *                           taggedUsers:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 _id: { type: string }
 *                                 username: { type: string }
 *                                 name: { type: string }
 *                                 profileImage: { type: array, items: { type: object } }
 *                           type: { type: string }
 *                           media: { type: array, items: { type: object } }
 *                           text: { type: string }
 *                           caption: { type: string }
 *                           location: { type: string }
 *                           hashtags: { type: array, items: { type: string } }
 *                           options: { type: array, items: { type: object } }
 *                           correctOption: { type: integer }
 *                           createdAt: { type: string, format: date-time }
 *                           updatedAt: { type: string, format: date-time }
 *                           commentCount: { type: integer }
 *                           likeCount: { type: integer }
 *                           userLike: { type: boolean }
 *                           totalVotes: { type: integer, nullable: true }
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page: { type: integer }
 *                         limit: { type: integer }
 *                         total: { type: integer }
 *                         totalPages: { type: integer }
 */
import { NextRequest, NextResponse } from 'next/server';
import SavedPost from '@/models/SavedPost';
import connectDB from '@/lib/db';
import mongoose from 'mongoose';
import Post from '@/models/Post';
import Comment from '@/models/Comment';
import Vote from '@/models/Vote';
import Like from '@/models/Like';
import Follow from '@/models/Follow';
import { getFollowStatusMap } from '@/common/getFollowStatusMap';


// Separate API for saved post list (GET)
export async function GET(req: NextRequest) {
    try {
        await connectDB();
        const userId = req.nextUrl.searchParams.get('userId');
        const page = parseInt(req.nextUrl.searchParams.get('page') || '1', 10);
        const limit = parseInt(req.nextUrl.searchParams.get('limit') || '10', 10);
        if (!userId) {
            return NextResponse.json({ data: { status: false, message: 'userId is required' } }, { status: 400 });
        }
        // Get all saved postIds for the user (paginated)
        const savedDocs = await SavedPost.find({ userId: new mongoose.Types.ObjectId(userId), isDeleted: false })
            .skip((page - 1) * limit)
            .limit(limit);
        const postIds = savedDocs.map(doc => doc.postId);
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
        // Get posts
        const posts = await Post.aggregate([
            { $match: postMatch },
            {
                $lookup: {
                    from: 'users',
                    localField: 'user',
                    foreignField: '_id',
                    as: 'user',
                }
            },
            { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'users',
                    localField: 'taggedUsers',
                    foreignField: '_id',
                    as: 'taggedUsers',
                }
            },
            {
                $project: {
                    user: { username: 1, name: 1, profileImage: 1, _id: 1 },
                    taggedUsers: { username: 1, name: 1, profileImage: 1, _id: 1 },
                    type: 1,
                    media: 1,
                    text: 1,
                    caption: 1,
                    location: 1,
                    hashtags: 1,
                    options: 1,
                    correctOption: 1,
                    createdAt: 1,
                    updatedAt: 1
                }
            }
        ]);
        // For poll/quiz posts, aggregate votes from Vote model
        const votes = await Vote.find({ post: { $in: postIds } });
        // Aggregate comment counts for each post
        const commentCountsArr = await Comment.aggregate([
            { $match: { postId: { $in: postIds }, isDeleted: false } },
            { $group: { _id: '$postId', count: { $sum: 1 } } }
        ]);
        const commentCounts: Record<string, number> = {};
        commentCountsArr.forEach((c: any) => { commentCounts[c._id.toString()] = c.count; });
        // Like counts and userLike
        const likeResults: Record<string, { likeCount: number, userLike: boolean }> = {};
        const likeCountsArr = await Like.aggregate([
            { $match: { targetId: { $in: postIds }, targetType: 'post', isDeleted: false } },
            { $group: { _id: '$targetId', count: { $sum: 1 } } }
        ]);
        likeCountsArr.forEach((l) => { likeResults[l._id.toString()] = { likeCount: l.count, userLike: false }; });
        const userLikesArr = await Like.find({ targetId: { $in: postIds }, targetType: 'post', user: userId, isDeleted: false }).select('targetId');
        userLikesArr.forEach((ul: any) => {
            const postIdStr = ul.targetId.toString();
            if (likeResults[postIdStr]) {
                likeResults[postIdStr].userLike = true;
            } else {
                likeResults[postIdStr] = { likeCount: 0, userLike: true };
            }
        });
        // Followers count for all post users
        const userIds = posts.map((p: any) => p.user?._id).filter(Boolean);
        const followersArr = await Follow.aggregate([
            { $match: { following: { $in: userIds }, status: 'accepted', isDeleted: false } },
            { $group: { _id: '$following', count: { $sum: 1 } } }
        ]);
        const followersCountMap: Record<string, number> = {};
        followersArr.forEach((f: any) => { followersCountMap[f._id.toString()] = f.count; });
        // Aggregate share counts for each post
        const Share = (await import('@/models/Share')).default;
        const shareCountsArr = await Share.aggregate([
            { $match: { postId: { $in: postIds }, type: 'share' } },
            { $group: { _id: '$postId', count: { $sum: 1 } } }
        ]);
        const shareCounts: Record<string, number> = {};
        shareCountsArr.forEach((s: any) => { shareCounts[s._id.toString()] = s.count; });

        // Add followStatusCode for each post's user
        const postUserIds = posts.map((p: any) => p.user?._id?.toString()).filter(Boolean);
        const followStatusMap = await getFollowStatusMap(userId, postUserIds);

        // Compose response like post list API
        const postsWithStats = posts.map((post: any) => {
            const { _id, ...rest } = post;
            let basePost = { ...rest, postId: _id };
            const commentCount = commentCounts[_id.toString()] || 0;
            const likeCount = likeResults[_id.toString()]?.likeCount || 0;
            const shareCount = shareCounts[_id.toString()] || 0;
            if (basePost.user && basePost.user._id) {
                basePost.user.followersCount = followersCountMap[basePost.user._id.toString()] || 0;
            }
            const userLike = likeResults[_id.toString()]?.userLike || false;
            // Add followStatusCode
            const followStatusCode = basePost.user && basePost.user._id ? followStatusMap[basePost.user._id.toString()] ?? 0 : 0;
            // Add isLoggedInUser
            const isLoggedInUser = basePost.user && basePost.user._id && basePost.user._id.toString() === userId;
            if ((post.type === 'poll' || post.type === 'quiz') && Array.isArray(post.options)) {
                const postVotes = votes.filter((v: any) => v.post.toString() === post._id.toString());
                const totalVotes = postVotes.length;
                const optionCounts: Record<number, number> = {};
                postVotes.forEach((v: any) => { optionCounts[v.optionIndex] = (optionCounts[v.optionIndex] || 0) + 1; });
                const pollResults = post.options.map((opt: any, idx: number) => ({
                    optionIndex: idx,
                    text: opt.text,
                    count: typeof optionCounts[idx] === 'number' ? optionCounts[idx] : 0,
                    percent: totalVotes > 0 && typeof optionCounts[idx] === 'number'
                        ? Math.round((optionCounts[idx] / totalVotes) * 100)
                        : 0
                }));
                return { ...basePost, totalVotes, options: pollResults, commentCount, likeCount, shareCount, userLike, followStatusCode, isLoggedInUser };
            }
            return { ...basePost, commentCount, likeCount, shareCount, userLike, followStatusCode, isLoggedInUser };
        });
        // Get total count for pagination
        const total = await SavedPost.countDocuments({ userId: new mongoose.Types.ObjectId(userId), isDeleted: false });
        return NextResponse.json({
            data: {
                status: true,
                posts: postsWithStats,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        console.error('Error fetching saved posts:', error);
        const message = (error instanceof Error) ? error.message : 'Internal server error';
        return NextResponse.json({ data: { status: false, message } }, { status: 500 });
    }
}
