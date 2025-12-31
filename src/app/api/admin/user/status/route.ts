import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';

/**
 * @swagger
 * /api/admin/user/status:
 *   put:
 *     summary: Update user status (1 for active, 0 for inactive)
 *     tags: [Admin - Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - status
 *             properties:
 *               userId:
 *                 type: string
 *                 description: User ID to update
 *               status:
 *                 type: number
 *                 enum: [0, 1]
 *                 description: New status for the user (1 = Active, 0 = Inactive)
 *     responses:
 *       200:
 *         description: User status updated successfully
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
 *         description: User not found
 *       500:
 *         description: Internal server error
 */

export async function PUT(request: NextRequest) {
  try {
    await connectDB();
    const { userId, status } = await request.json();

    console.log('=== STATUS UPDATE REQUEST ===');
    console.log('Received userId:', userId);
    console.log('Received status:', status);
    console.log('Status type:', typeof status);

    // Validate input
    if (!userId || status === undefined || status === null) {
      return NextResponse.json(
        { success: false, message: 'User ID and status are required' },
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

    // Update user status
    console.log('Attempting to update user with ID:', userId, 'to status:', Number(status));
    
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { status: Number(status) },
      { new: true }
    ).lean() as any;

    console.log('Updated user response:', updatedUser);

    if (!updatedUser) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    console.log('Final status in DB:', updatedUser.status);
    console.log('=== END STATUS UPDATE ===');

    // Generate message based on status
    const statusMessage = updatedUser.status === 1 
      ? 'User status activated successfully' 
      : 'User status deactivated successfully';

    return NextResponse.json(
      {
        success: true,
        message: statusMessage,
        data: {
          id: updatedUser._id,
          status: updatedUser.status,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating user status:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
