/**
 * @swagger
 * /api/customer/settings/privacy/update:
 *   patch:
 *     summary: Update privacy and activity status settings
 *     description: Update user's profile type (public/private) or activity status visibility (on/off) using type and action fields.
 *     tags:
 *       - Settings
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 example: "65a1234567890abcdef12345"
 *                 description: The user's unique identifier.
 *               type:
 *                 type: integer
 *                 enum: [1, 2]
 *                 example: 1
 *                 description: 1 = profileType (public/private), 2 = showActivityStatus (on/off)
 *               action:
 *                 type: integer
 *                 enum: [0, 1]
 *                 example: 1
 *                 description: For type=1, 1 means public and 0 means private. For type=2, 1 means ON and 0 means OFF.
 *     responses:
 *       200:
 *         description: Settings updated successfully
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
 *                       example: true
 *                     message:
 *                       type: string
 *                       example: Settings updated
 *                     user:
 *                       type: object
 *                       properties:
 *                         profileType:
 *                           type: string
 *                           example: private
 *                         showActivityStatus:
 *                           type: boolean
 *                           example: true
 */

import { NextRequest, NextResponse } from 'next/server';
import User from '@/models/User';
import connectDB from '@/lib/db';

// PATCH /api/customer/settings/privacy
export async function PATCH(req: NextRequest) {
    try {
        await connectDB();
        const body = await req.json();
        const { userId, type, action } = body;
        if (!userId || !type || (type !== 1 && type !== 2) || (action !== 0 && action !== 1)) {
            return NextResponse.json({ data: { status: false, message: 'Invalid input: userId, type (1 or 2), and action (0 or 1) required' } }, { status: 400 });
        }
        let update: any = {};
        if (type === 1) {
            update.profileType = action === 1 ? 'public' : 'private';
        } else if (type === 2) {
            update.showActivityStatus = action === 1;
        }
        const user = await User.findByIdAndUpdate(userId, update, { new: true });
        if (!user) {
            return NextResponse.json({ data: { status: false, message: 'User not found' } }, { status: 400 });
        }
        return NextResponse.json({
            data: {
                status: true,
                message: 'Settings updated',
                user: {
                    profileType: user.profileType,
                    showActivityStatus: user.showActivityStatus
                }
            }
        });
    } catch (error) {
        console.error('Error updating settings:', error);
        const message = (error instanceof Error) ? error.message : 'Internal server error';
        return NextResponse.json({ data: { status: false, message } }, { status: 500 });
    }
}
