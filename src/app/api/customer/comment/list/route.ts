/**
 * @swagger
 * /api/customer/comment/list:
 *   get:
 *     summary: List comments for a post
 *     description: Retrieves a paginated list of comments for a given post, including user info, likes, and replies.
 *     tags:
 *       - Comment
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
 *           example: "65a1234567890abcdef12345"
 *       - in: query
 *         name: cursor
 *         required: false
 *         schema:
 *           type: string
 *           example: "2024-12-31T23:59:59.999Z"
 *         description: "The createdAt value of the last comment from the previous page. Used for cursor-based pagination. Must be used together with cursorId."
 *       - in: query
 *         name: cursorId
 *         required: false
 *         schema:
 *           type: string
 *           example: "65a1234567890abcdef12345"
 *         description: "The commentId (or _id) of the last comment from the previous page. Used for cursor-based pagination. Must be used together with cursor."
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           example: 10
 *     responses:
 *       200:
 *         description: Comments fetched successfully
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
 *                   example: "Comments fetched"
 *                 comments:
 *                   type: array
 *                   items:
 *                     type: object
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
 *                       description: "The createdAt value of the last comment in the current page. Use this as the cursor for the next request."
 *                     nextCursorId:
 *                       type: string
 *                       nullable: true
 *                       example: "65a1234567890abcdef12345"
 *                       description: "The commentId (or _id) of the last comment in the current page. Use this as the cursorId for the next request."
 */
import { z } from 'zod';



import { NextRequest, NextResponse } from 'next/server';
import Comment from '@/models/Comment';
import connectDB from '@/lib/db';
import mongoose from 'mongoose';
import Like from '@/models/Like';

type UserProfile = {
  name?: string;
  username?: string;
  profileImage?: any;
};

type CommentDoc = {
  commentId: any;
  postId: any;
  userId: any;
  content: string;
  mentions: any[];
  parentId?: any;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  userProfile?: UserProfile | null;
  replies?: CommentDoc[];
  likeCount?: number;
};


export async function GET(request: NextRequest) {
  await connectDB();
  try {
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('postId');
    const userId = searchParams.get('userId');
    let cursor = searchParams.get('cursor');
    let cursorId = searchParams.get('cursorId');
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    if (!postId || postId.length !== 24) {
      return NextResponse.json({
        data: {
          status: false,
          message: 'Invalid postId'
        }
      }, { status: 400 });
    }
    // Build filter for top-level comments
    let filter: any = { postId, isDeleted: false, parentId: null };
    // Cursor-based pagination for top-level comments
    if (cursor && cursorId) {
      filter.$or = [
        { createdAt: { $lt: new Date(cursor) } },
        { createdAt: new Date(cursor), _id: { $lt: mongoose.Types.ObjectId.isValid(cursorId) ? new mongoose.Types.ObjectId(cursorId) : cursorId } }
      ];
    } else if (cursor) {
      filter.createdAt = { $lt: new Date(cursor) };
    }
    // Fetch top-level comments with cursor-based pagination
    const rawComments = await Comment.find(filter).sort({ createdAt: -1, _id: -1 }).limit(limit).lean();
    // Map raw comments to CommentDoc and ensure _id is string
    const allComments: CommentDoc[] = rawComments.map((c: any) => ({
      commentId: c._id?.toString?.() ?? String(c._id),
      postId: c.postId,
      userId: c.userId,
      content: c.content,
      mentions: c.mentions ?? [],
      parentId: c.parentId,
      isDeleted: c.isDeleted,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
      userProfile: null,
      replies: [],
      likeCount: 0
    }));
    // Get like counts for all comments
    const commentIds = allComments.map(c => c.commentId);
    // Convert commentIds to ObjectId for aggregation
    const objectCommentIds = commentIds.map(id =>
      typeof id === 'string' ? new mongoose.Types.ObjectId(id) : id
    );
    const likeCountsArr = await Like.aggregate([
      { $match: { targetId: { $in: objectCommentIds }, targetType: 'comment', isDeleted: false } },
      { $group: { _id: '$targetId', count: { $sum: 1 } } }
    ]);
    const likeCounts: Record<string, number> = {};
    likeCountsArr.forEach((l: any) => {
      likeCounts[l._id.toString()] = l.count;
    });
    // Get like status for each comment for the current user (userId)
    let userLikesMap: Record<string, boolean> = {};
    if (userId) {
      const userLikes = await Like.find({ targetId: { $in: commentIds }, targetType: 'comment', user: userId, isDeleted: false }).select('targetId');
      userLikesMap = userLikes.reduce((acc: Record<string, boolean>, like: any) => {
        acc[like.targetId.toString()] = true;
        return acc;
      }, {});
    }
    // Fetch all users for these comments
    const userIds = [...new Set(allComments.map(c => c.userId.toString()))];
    const users = await mongoose.connection.collection('users').find({ _id: { $in: userIds.map(id => new mongoose.Types.ObjectId(id)) } }).toArray();
    const userMap: Record<string, UserProfile> = {};
    users.forEach((u: any) => {
      userMap[u._id.toString()] = {
        name: u.name,
        username: u.username,
        profileImage: Array.isArray(u.profileImage) ? (u.profileImage[0] ?? null) : null
      };
    });
    // Attach user info and commentLike to each comment
    allComments.forEach((c) => {
      c.userProfile = userMap[c.userId.toString()] || null;
      const commentIdStr = c.commentId.toString();
      const count = likeCounts[commentIdStr] || 0;
      c.likeCount = count;
      (c as any).commentLike = userLikesMap[commentIdStr] || false;
    });
    // For each top-level comment, fetch its replies (not paginated)
    const topLevelIds = allComments.map(c => c.commentId);
    const repliesRaw = await Comment.find({ postId, isDeleted: false, parentId: { $in: topLevelIds.map(id => new mongoose.Types.ObjectId(id)) } }).sort({ createdAt: 1 }).lean();
    const repliesMap: Record<string, CommentDoc[]> = {};
    repliesRaw.forEach((c: any) => {
      const reply: CommentDoc = {
        commentId: c._id?.toString?.() ?? String(c._id),
        postId: c.postId,
        userId: c.userId,
        content: c.content,
        mentions: c.mentions ?? [],
        parentId: c.parentId,
        isDeleted: c.isDeleted,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
        userProfile: userMap[c.userId.toString()] || null,
        replies: [],
        likeCount: likeCounts[c._id.toString()] || 0
      };
      if (!repliesMap[c.parentId.toString()]) repliesMap[c.parentId.toString()] = [];
      repliesMap[c.parentId.toString()].push(reply);
    });
    allComments.forEach((c) => {
      c.replies = repliesMap[c.commentId] || [];
    });
    // Prepare pagination info
    const nextCursor = allComments.length ? allComments[allComments.length - 1].createdAt : null;
    const nextCursorId = allComments.length ? allComments[allComments.length - 1].commentId : null;
    return NextResponse.json({
      data: {
        status: true,
        message: 'Comments fetched',
        comments: allComments,
        pagination: {
          limit,
          nextCursor,
          nextCursorId
        }
      }
    });
  } catch (error: any) {
    console.log(error);
    return NextResponse.json({
      data: {
        status: false,
        message: error.message
      }
    }, { status: 500 });
  }
}
