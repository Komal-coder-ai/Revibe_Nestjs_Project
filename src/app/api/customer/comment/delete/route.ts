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
    const parsed = commentIdSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({
        data: {
          status: false,
          message: 'Validation error',
          errors: parsed.error.issues
        }
      }, { status: 400 });
    }
    const { commentId } = parsed.data;
    const comment = await Comment.findByIdAndUpdate(commentId, { isDeleted: true }, { new: true });
    if (!comment) {
      return NextResponse.json({
        data: {
          status: false,
          message: 'Comment not found'
        }
      }, { status: 404 });
    }
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
