/**
 * @swagger
 * /api/customer/comment/delete:
 *   post:
 *     summary: Delete a comment
 *     description: Deletes a comment by its ID.
 *     tags:
 *       - Comment
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               commentId:
 *                 type: string
 *                 example: "65a1234567890abcdef12345"
 *               userId:
 *                 type: string
 *                 example: "65a1234567890abcdef67890"
 *     responses:
 *       200:
 *         description: Comment deleted successfully
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
 *                   example: "Comment deleted"
 */
import { NextRequest, NextResponse } from 'next/server';
import Comment from '@/models/Comment';
import { commentIdSchema, updateCommentSchema } from '../validator/schemas';
import connectDB from '@/lib/db';

export async function POST(request: NextRequest) {
  await connectDB();
  try {
    const body = await request.json();
    const { commentId, userId } = body;
    if (!commentId || !userId) {
      return NextResponse.json({
        data: {
          status: false,
          message: 'commentId and userId are required'
        }
      }, { status: 400 });
    }
    // Validate userId and commentId format
    if (!/^[a-fA-F0-9]{24}$/.test(commentId) || !/^[a-fA-F0-9]{24}$/.test(userId)) {
      return NextResponse.json({
        data: {
          status: false,
          message: 'Invalid commentId or userId format'
        }
      }, { status: 400 });
    }
    // Find the comment and check ownership
    const comment = await Comment.findOne({ _id: commentId, isDeleted: false });
    if (!comment) {
      return NextResponse.json({
        data: {
          status: false,
          message: 'Comment not found'
        }
      }, { status: 404 });
    }
    if (comment.userId.toString() !== userId) {
      return NextResponse.json({
        data: {
          status: false,
          message: 'You are not authorized to delete this comment'
        }
      }, { status: 403 });
    }
    comment.isDeleted = true;
    await comment.save();
    return NextResponse.json({
      data: {
        status: true,
        message: 'Comment deleted',
        comment
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
