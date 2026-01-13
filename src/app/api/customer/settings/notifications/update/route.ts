/**
 * @swagger
 * /api/customer/settings/notifications/update:
 *   patch:
 *     summary: Update notification settings
 *     description: Update the user's notification preferences.
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
 *               notificationSettings:
 *                 type: object
 *                 properties:
 *                   pauseAll:
 *                     type: boolean
 *                   postLikes:
 *                     type: boolean
 *                   comments:
 *                     type: boolean
 *                   newFollowers:
 *                     type: boolean
 *                   directMessages:
 *                     type: boolean
 *                   email:
 *                     type: boolean
 *                   sms:
 *                     type: boolean
 *     responses:
 *       200:
 *         description: Notification settings updated
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
 *                   example: "Notification settings updated"
 *                 notificationSettings:
 *                   type: object
 */
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import NotificationSettings from '@/models/NotificationSettings';
import { notificationSettingsSchema } from '../../validator/schema';

export async function PATCH(req: NextRequest) {
    try {
        await connectDB();
        const { userId, notificationSettings } = await req.json();
        if (!userId || !notificationSettings) {
            return NextResponse.json({ data: { status: false, message: 'userId and notificationSettings required' } }, { status: 400 });
        }
        // Validate notificationSettings with Zod
        const parse = notificationSettingsSchema.safeParse(notificationSettings);
        if (!parse.success) {
            return NextResponse.json({ data: { status: false, message: 'Invalid notification settings', errors: parse.error.issues } }, { status: 400 });
        }
        // Upsert notification settings for the user
        const updated = await NotificationSettings.findOneAndUpdate(
            { userId },
            { $set: notificationSettings },
            { new: true }
        );
        return NextResponse.json({ data: { status: true, message: 'Notification settings updated', notificationSettings: updated } });
    } catch (error) {
        console.error('Error updating notification settings:', error);
        const message = (error instanceof Error) ? error.message : 'Internal server error';
        return NextResponse.json({ data: { status: false, message } }, { status: 500 });
    }
}
