/**
 * @swagger
 * /api/customer/comment/update:
 *   post:
 *     summary: Update a comment
 *     description: Updates the content and mentions of a comment by its ID.
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
 *               content:
 *                 type: string
 *                 example: "Updated comment content"
 *               mentions:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Comment updated successfully
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
 *                   example: "Comment updated"
 *                 comment:
 *                   type: object
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
    const idParsed = commentIdSchema.safeParse({ commentId });
    const updateParsed = updateCommentSchema.safeParse({ content: body.content, mentions: body.mentions });
    if (!idParsed.success || !updateParsed.success) {
      return NextResponse.json({
        data: {
          status: false,
          message: 'Validation error',
          errors: [idParsed.error?.issues, updateParsed.error?.issues]
        }
      }, { status: 400 });
    }
    if (!userId || !/^[a-fA-F0-9]{24}$/.test(userId)) {
      return NextResponse.json({
        data: {
          status: false,
          message: 'Valid userId is required'
        }
      }, { status: 400 });
    }
    const { content, mentions = [] } = updateParsed.data;
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
          message: 'You are not authorized to update this comment'
        }
      }, { status: 403 });
    }
    comment.content = content;
    comment.mentions = mentions;
    await comment.save();
    return NextResponse.json({
      data: {
        status: true,
        message: 'Comment updated',
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
