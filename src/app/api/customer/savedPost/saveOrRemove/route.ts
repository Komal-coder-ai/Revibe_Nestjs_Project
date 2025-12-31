/**
 * @openapi
 * /api/customer/savedPost/saveOrRemove:
 *   post:
 *     summary: Save or remove a post from saved posts
 *     description: Save a post (type=1) or remove a post from saved (type=0) for a user. Uses soft delete for removal.
 *     tags:
 *       - SavedPost
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 description: The ID of the user
 *               postId:
 *                 type: string
 *                 description: The ID of the post
 *               type:
 *                 type: integer
 *                 enum: [0, 1]
 *                 description: 1 to save, 0 to remove from saved
 *             required:
 *               - userId
 *               - postId
 *               - type
 *     responses:
 *       200:
 *         description: Save or remove result
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
 *                     action:
 *                       type: string
 *                       description: saved or removed
 *                     saved:
 *                       type: object
 *                       nullable: true
 *                       description: Saved post object (for save action)
 *                     softDeleted:
 *                       type: boolean
 *                       nullable: true
 *                       description: true if remove (soft delete) was successful
 *       400:
 *         description: Invalid input or type value
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
 *                     message:
 *                       type: string
 */

import { NextRequest, NextResponse } from 'next/server';
import SavedPost from '@/models/SavedPost';
import connectDB  from '@/lib/db';
import mongoose from 'mongoose';


// Combined save/remove API
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { userId, postId, type } = await req.json();
    if (typeof type !== 'number' || !userId || !postId) {
      return NextResponse.json({ data: { status: false, message: 'userId, postId, and type are required' } }, { status: 400 });
    }
    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(postId)) {
      return NextResponse.json({ data: { status: false, message: 'Invalid userId or postId' } }, { status: 400 });
    }
    if (type === 1) {
      // Save post (reactivate if soft-deleted, else create new)
      let saved = await SavedPost.findOne({ userId, postId });
      if (saved) {
        if (saved.isDeleted) {
          saved.isDeleted = false;
          saved.savedAt = new Date();
          await saved.save();
        }
      } else {
        saved = await SavedPost.create({ userId, postId });
      }
      return NextResponse.json({ data: { status: true, action: 'saved', saved } });
    } else if (type === 0) {
      // Remove from saved (soft delete)
      const result = await SavedPost.findOneAndUpdate(
        { userId, postId, isDeleted: false },
        { isDeleted: true },
        { new: true }
      );
      return NextResponse.json({ data: { status: true, action: 'removed', softDeleted: !!result } });
    } else {
      return NextResponse.json({ data: { status: false, message: 'Invalid type value' } }, { status: 400 });
    }
  } catch (error) {
    console.error('Error in saveOrRemove saved post:', error);
    const message = (error instanceof Error) ? error.message : 'Internal server error';
    return NextResponse.json({ data: { status: false, message } }, { status: 500 });
  }
}

