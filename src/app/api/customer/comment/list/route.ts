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
 *                 total:
 *                   type: integer
 *                 page:
 *                   type: integer
 *                 limit:
 *                   type: integer
 */
import { z } from 'zod';



import { NextRequest, NextResponse } from 'next/server';
import Comment from '@/models/Comment';
import connectDB  from '@/lib/db';
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
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    if (!postId || postId.length !== 24) {
      return NextResponse.json({
        data: {
          status: false,
          message: 'Invalid postId'
        }
      }, { status: 400 });
    }
    // Fetch all comments for the post
    const rawComments = await Comment.find({ postId, isDeleted: false }).sort({ createdAt: 1 }).lean();
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
    const likeCountsArr = await Like.aggregate([
      { $match: { targetId: { $in: commentIds }, targetType: 'comment', isDeleted: false } },
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
      c.likeCount = likeCounts[c.commentId] || 0;
      (c as any).commentLike = userLikesMap[c.commentId] || false;
    });
    // Build a map of comments by _id
    const commentMap: Record<string, CommentDoc> = {};
    allComments.forEach((c) => { commentMap[c.commentId] = c; });
    // Build tree: attach each comment to its parent
    const roots: CommentDoc[] = [];
    allComments.forEach((c) => {
      if (c.parentId) {
        const parent = commentMap[c.parentId.toString()];
        if (parent) parent.replies!.push(c);
      } else {
        roots.push(c);
      }
    });
    // Pagination for top-level comments
    const total = roots.length;
    const pagedRoots = roots.slice((page - 1) * limit, page * limit);
    return NextResponse.json({
      data: {
        status: true,
        message: 'Comments fetched',
        comments: pagedRoots,
        total,
        page,
        limit
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
