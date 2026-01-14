/**
 * @swagger
 * /api/admin/feed/status:
 *   put:
 *     summary: Update feed status (1 for active, 0 for inactive)
 *     tags: [Admin - Feeds]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - feedId
 *               - status
 *             properties:
 *               feedId:
 *                 type: string
 *                 description: Feed ID to update
 *               status:
 *                 type: number
 *                 enum: [0, 1]
 *                 description: New status for the feed (1 = Active, 0 = Inactive)
 *     responses:
 *       200:
 *         description: Feed status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     status:
 *                       type: number
 *       400:
 *         description: Bad request
 *       404:
 *         description: Feed not found
 *       500:
 *         description: Internal server error
 */

import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Post from '@/models/Post';

export async function PUT(request: NextRequest) {
  try {
    await connectDB();
    const { feedId, status } = await request.json();

    // Validate input
    if (!feedId || status === undefined || status === null) {
      return NextResponse.json(
        { success: false, message: 'Feed ID and status are required' },
        { status: 400 }
      );
    }

    // Validate status is 0 or 1
    if (![0, 1].includes(Number(status))) {
      return NextResponse.json(
        { success: false, message: 'Invalid status. Must be 0 (Inactive) or 1 (Active)' },
        { status: 400 }
      );
    }
    let isActive = true;
    if (Number(status) == 0) {
      isActive = false;
    } else {
      isActive = true;
    }
    // Update feed status
    const updatedFeed = await Post.findByIdAndUpdate(
      feedId,
      { isActive: isActive },
      { new: true }
    );

    if (!updatedFeed) {
      return NextResponse.json(
        { success: false, message: 'Feed not found or invalid response' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Feed status updated successfully',
        data: {
          id: updatedFeed._id,
          status: updatedFeed.status,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating feed status:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}