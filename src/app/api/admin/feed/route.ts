/**
 * @swagger
 * /api/admin/feed:
 *   post:
 *     summary: Create admin feed list
 *     description: Retrieves a paginated list of all posts from the platform with engagement metrics and filtering options. Admin-only endpoint.
 *     tags:
 *       - Admin Feed
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               page:
 *                 type: integer
 *                 default: 1
 *                 example: 1
 *               limit:
 *                 type: integer
 *                 default: 10
 *                 example: 10
 *               sort:
 *                 type: string
 *                 default: "createdAt"
 *                 example: "createdAt"
 *               type:
 *                 type: string
 *                 enum: ["image", "video", "text", "carousel", "poll", "quiz", "reel"]
 *                 example: "image"
 *               search:
 *                 type: string
 *                 example: "hashtag or text search"
 *               userId:
 *                 type: string
 *                 example: "65a1234567890abcdef12345"
 *               includeDeleted:
 *                 type: boolean
 *                 default: false
 *                 example: false
 *     responses:
 *       200:
 *         description: Feed list fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Feed list fetched successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       postId:
 *                         type: string
 *                       user:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           username:
 *                             type: string
 *                           name:
 *                             type: string
 *                           email:
 *                             type: string
 *                           profileImage:
 *                             type: array
 *                       type:
 *                         type: string
 *                         enum: ["image", "video", "text", "carousel", "poll", "quiz", "reel"]
 *                       media:
 *                         type: array
 *                       text:
 *                         type: string
 *                       caption:
 *                         type: string
 *                       location:
 *                         type: string
 *                       hashtags:
 *                         type: array
 *                       taggedUsers:
 *                         type: array
 *                       commentCount:
 *                         type: integer
 *                       likeCount:
 *                         type: integer
 *                       isDeleted:
 *                         type: boolean
 *                       createdAt:
 *                         type: string
 *                       updatedAt:
 *                         type: string
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                     hasNextPage:
 *                       type: boolean
 *                       description: Whether there is a next page
 *                     hasPrevPage:
 *                       type: boolean
 *                       description: Whether there is a previous page
 *                 filters:
 *                   type: object
 *                   description: All applied filters and query parameters
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     sort:
 *                       type: string
 *                     userId:
 *                       type: string
 *                       nullable: true
 *                     search:
 *                       type: string
 *                       nullable: true
 *                     type:
 *                       type: string
 *                       nullable: true
 *                     includeDeleted:
 *                       type: boolean
 *                 meta:
 *                   type: object
 *                   description: Metadata about the response
 *                   properties:
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *                       description: When the response was generated
 *                     totalFetched:
 *                       type: integer
 *                       description: Number of posts in this response
 *                     filteredCount:
 *                       type: integer
 *                       description: Total posts matching the filters
 *       500:
 *         description: Server error
 */

import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Post from '@/models/Post';
import Like from '@/models/Like';
import Comment from '@/models/Comment';
import mongoose from 'mongoose';

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();
    const {
      page = 1,
      limit = 10,
      sort = 'createdAt',
      type,
      search,
      userId,
      includeDeleted = false,
    } = body;

    // Validate page and limit
    const validPage = Math.max(1, parseInt(page, 10));
    const validLimit = Math.max(1, Math.min(100, parseInt(limit, 10)));

    // Build filter
    const filter: any = {};

    // Handle deleted posts
    if (!includeDeleted) {
      filter.isDeleted = false;
    }

    // Filter by post type if provided
    if (type) {
      filter.type = type;
    }

    // Filter by user if provided
    if (userId) {
      try {
        filter.user = new mongoose.Types.ObjectId(userId);
      } catch (error) {
        return NextResponse.json(
          {
            success: false,
            message: 'Invalid userId format',
          },
          { status: 400 }
        );
      }
    }

    // Search in text, caption, hashtags, or location
    if (search) {
      filter.$or = [
        { text: { $regex: search, $options: 'i' } },
        { caption: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { hashtags: { $regex: search, $options: 'i' } },
      ];
    }

    // Fetch posts with aggregation pipeline
    const posts = await Post.aggregate([
      { $match: filter },
      { $sort: { [sort]: -1 } },
      { $skip: (validPage - 1) * validLimit },
      { $limit: validLimit },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'users',
          localField: 'taggedUsers',
          foreignField: '_id',
          as: 'taggedUsers',
        },
      },
      {
        $project: {
          user: { username: 1, name: 1, email: 1, profileImage: 1, _id: 1 },
          taggedUsers: { username: 1, name: 1, profileImage: 1, _id: 1 },
          type: 1,
          media: 1,
          text: 1,
          caption: 1,
          location: 1,
          hashtags: 1,
          options: 1,
          correctOption: 1,
          isDeleted: 1,
          createdAt: 1,
          updatedAt: 1,
        },
      },
    ]);

    const postIds = posts.map((p: any) => p._id);

    // Get comment counts
    const commentCountsArr = await Comment.aggregate([
      { $match: { postId: { $in: postIds }, isDeleted: false } },
      { $group: { _id: '$postId', count: { $sum: 1 } } },
    ]);

    const commentCounts: Record<string, number> = {};
    commentCountsArr.forEach((c: any) => {
      commentCounts[c._id.toString()] = c.count;
    });

    // Get like counts
    const likeCountsArr = await Like.aggregate([
      { $match: { targetId: { $in: postIds }, targetType: 'post', isDeleted: false } },
      { $group: { _id: '$targetId', count: { $sum: 1 } } },
    ]);

    const likeCounts: Record<string, number> = {};
    likeCountsArr.forEach((l: any) => {
      likeCounts[l._id.toString()] = l.count;
    });

    // Format response
    const feedData = posts.map((post: any) => {
      const { _id, ...rest } = post;
      const postIdStr = _id.toString();

      return {
        ...rest,
        postId: _id,
        commentCount: commentCounts[postIdStr] || 0,
        likeCount: likeCounts[postIdStr] || 0,
        status: post.isDeleted ? 0 : 1, // Update status to 0/1 format
      };
    });

    // Get total count for pagination
    const total = await Post.countDocuments(filter);

    return NextResponse.json(
      {
        success: true,
        message: 'Feed list fetched successfully',
        data: feedData,
        pagination: {
          page: validPage,
          limit: validLimit,
          total,
          totalPages: Math.ceil(total / validLimit),
          hasNextPage: validPage < Math.ceil(total / validLimit),
          hasPrevPage: validPage > 1,
        },
        filters: {
          page: validPage,
          limit: validLimit,
          sort,
          userId: userId || null,
          search: search || null,
          type: type || null,
          includeDeleted,
        },
        meta: {
          timestamp: new Date().toISOString(),
          totalFetched: feedData.length,
          filteredCount: total,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching feed:', error);
    const message = error instanceof Error ? error.message : 'Failed to fetch feed list';
    return NextResponse.json(
      {
        success: false,
        message,
      },
      { status: 500 }
    );
  }
}
