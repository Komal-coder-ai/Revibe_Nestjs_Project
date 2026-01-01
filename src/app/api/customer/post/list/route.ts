/**
 * @swagger
 * /api/customer/post/list:
 *   get:
 *     summary: List posts
 *     description: Retrieves a paginated list of posts with filtering, sorting, and feed options.
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
 *         name: targetUserId
 *         required: false
 *         schema:
 *           type: string
 *           example: "65a1234567890abcdef67890"
 *       - in: query
 *         name: feed
 *         required: false
 *         schema:
 *           type: boolean
 *           example: true
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *           example: 1
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           example: 10
 *       - in: query
 *         name: sort
 *         required: false
 *         schema:
 *           type: string
 *           example: "createdAt"
 *       - in: query
 *         name: type
 *         required: false
 *         schema:
 *           type: string
 *           example: ""
 *       - in: query
 *         name: hashtag
 *         required: false
 *         schema:
 *           type: string
 *           example: ""
 *     responses:
 *       200:
 *         description: Posts fetched successfully
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
 *                 total:
 *                   type: integer
 *                 page:
 *                   type: integer
 *                 limit:
 *                   type: integer
 */

import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Post from '@/models/Post';
import Hashtag from '@/models/Hashtag';
import mongoose from 'mongoose';
import Comment from '@/models/Comment';
import Vote from '@/models/Vote';
import Like from '@/models/Like';
import Follow from '@/models/Follow';

// GET /api/post/list?user=...&page=1&limit=10&sort=createdAt
// GET /api/post/list?feed=true&userId=...&page=1&limit=10&sort=createdAt
// feed=true returns main feed, userId returns user profile posts, both omitted returns all posts (admin/explore)
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    // userId: currently logged-in user (for like/feed info), targetUserId: whose posts to fetch
    const userId = searchParams.get('userId');
    const targetUserId = searchParams.get('targetUserId');
    if (!userId) {
      return NextResponse.json({ data: { status: false, message: 'userId is required' } }, { status: 400 });
    }
    const feed = searchParams.get('feed') === 'true';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const sort = searchParams.get('sort') || 'createdAt';
    const type = searchParams.get('type');
    const hashtag = searchParams.get('hashtag');
    // console.log(type);'=

    let filter: any = { isDeleted: false };
    // Filter out posts from blocked users and blocked/reported posts
    const { getBlockedAndReportedFilters } = await import('./filterBlockedAndReported');
    const { blockedUserIds, blockedPostIds } = await getBlockedAndReportedFilters(userId);
    if (blockedUserIds.length > 0) {
      filter.user = filter.user ? filter.user : { $nin: blockedUserIds.map(id => new mongoose.Types.ObjectId(id.toString())) };
    }
    if (blockedPostIds.length > 0) {
      filter._id = filter._id ? filter._id : { $nin: blockedPostIds.map(id => new mongoose.Types.ObjectId(id.toString())) };
    }
    // If targetUserId is provided, fetch posts for that user (profile view)
    if (targetUserId) {
      filter.user = new mongoose.Types.ObjectId(targetUserId.toString());
    } else if (feed) {
      // TODO: Add logic for following users, algorithmic feed, etc.
      // For now, just return all posts (could filter by following in future)
    }
    // If not profile view, but userId is provided, you can use it for feed logic or personalization
    if (type) {
      filter.type = type;
    }
    if (hashtag) {
      filter.hashtags = hashtag.toLowerCase();
    }
    const posts = await Post.aggregate([
      { $match: filter },
      { $sort: { [sort]: -1 } },
      { $skip: (page - 1) * limit },
      { $limit: limit },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'user',
        }
      },
      { $unwind: { path: '$user', preserveNullAndEmptyArrays: false } },
      // Filter out posts where user is not active
      { $match: { 'user.isActive': true } },
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
    const postIds = posts.map((p: any) => p._id);
    const votes = await Vote.find({ post: { $in: postIds } });

    // Aggregate comment counts for each post
    const commentCountsArr = await Comment.aggregate([
      { $match: { postId: { $in: postIds }, isDeleted: false } },
      { $group: { _id: '$postId', count: { $sum: 1 } } }
    ]);
    const commentCounts: Record<string, number> = {};
    commentCountsArr.forEach((c: any) => {
      commentCounts[c._id.toString()] = c.count;
    });

    // Use like list API for likeCount and userLike for each post
    const likeResults: Record<string, { likeCount: number, userLike: boolean }> = {};
    // Get like counts for all posts in one query
    const likeCountsArr = await Like.aggregate([
      { $match: { targetId: { $in: postIds }, targetType: 'post', isDeleted: false } },
      { $group: { _id: '$targetId', count: { $sum: 1 } } }
    ]);
    likeCountsArr.forEach((l: any) => {
      likeResults[l._id.toString()] = { likeCount: l.count, userLike: false };
    });

    // Get userLike for all posts in one query
    const userLikesArr = await Like.find({ targetId: { $in: postIds }, targetType: 'post', user: userId, isDeleted: false }).select('targetId');
    userLikesArr.forEach((ul: any) => {
      const postIdStr = ul.targetId.toString();
      if (likeResults[postIdStr]) {
        likeResults[postIdStr].userLike = true;
      } else {
        likeResults[postIdStr] = { likeCount: 0, userLike: true };
      }
    });
    // Get followers count for all post users
    const userIds = posts.map((p: any) => p.user?._id).filter(Boolean);
    const followersArr = await Follow.aggregate([
      { $match: { following: { $in: userIds }, status: 'accepted', isDeleted: false } },
      { $group: { _id: '$following', count: { $sum: 1 } } }
    ]);
    const followersCountMap: Record<string, number> = {};
    followersArr.forEach((f: any) => {
      followersCountMap[f._id.toString()] = f.count;
    });

    // Aggregate share counts for each post
    const Share = (await import('@/models/Share')).default;
    const shareCountsArr = await Share.aggregate([
      { $match: { postId: { $in: postIds }, type: "share" } },
      { $group: { _id: '$postId', count: { $sum: 1 } } }
    ]);
    const shareCounts: Record<string, number> = {};
    shareCountsArr.forEach((s: any) => {
      shareCounts[s._id.toString()] = s.count;
    });

    const postsWithPollStats = posts.map(post => {
      // Convert _id to postId for all posts
      const { _id, ...rest } = post;
      let basePost = { ...rest, postId: _id };
      // Add commentCount, likeCount, shareCount
      const commentCount = commentCounts[_id.toString()] || 0;
      const likeCount = likeResults[_id.toString()]?.likeCount || 0;
      const shareCount = shareCounts[_id.toString()] || 0;
      // Add followersCount to user
      if (basePost.user && basePost.user._id) {
        basePost.user.followersCount = followersCountMap[basePost.user._id.toString()] || 0;
      }
      // Add userLike status for the current user
      const userLike = likeResults[_id.toString()]?.userLike || false;
      // Add isLoggedInUser flag
      const isLoggedInUser = basePost.user && basePost.user._id && basePost.user._id.toString() === userId;
      if ((post.type === 'poll' || post.type === 'quiz') && Array.isArray(post.options)) {
        const postVotes = votes.filter((v: any) => v.post.toString() === post._id.toString());
        const totalVotes = postVotes.length;
        const optionCounts: Record<number, number> = {};
        postVotes.forEach((v: any) => {
          optionCounts[v.optionIndex] = (optionCounts[v.optionIndex] || 0) + 1;
        });
        const pollResults = post.options.map((opt: any, idx: number) => ({
          optionIndex: idx,
          text: opt.text,
          count: typeof optionCounts[idx] === 'number' ? optionCounts[idx] : 0,
          percent: totalVotes > 0 && typeof optionCounts[idx] === 'number'
            ? Math.round((optionCounts[idx] / totalVotes) * 100)
            : 0
        }));
        // Remove original options from response, send as 'options' key
        return { ...basePost, totalVotes, options: pollResults, commentCount, likeCount, shareCount, userLike, isLoggedInUser };
      }
      return { ...basePost, commentCount, likeCount, shareCount, userLike, isLoggedInUser };
    });
    const total = await Post.countDocuments(filter);
    let trending = [];
    if (feed) {
      trending = await Hashtag.find({}).sort({ count: -1 }).limit(10).select('tag count -_id');
    }
    return NextResponse.json({
      data: {
        status: true,
        message: 'Posts fetched',
        posts: postsWithPollStats,
        trending,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error listing posts:', error);
    const message = (error instanceof Error) ? error.message : 'Internal server error';
    return NextResponse.json({ data: { status: false, message } }, { status: 500 });
  }
}
