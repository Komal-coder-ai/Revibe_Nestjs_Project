import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import NotificationSettings from '@/models/NotificationSettings';

/**
 * @swagger
 * /api/customer/settings/notifications/settings:
 *   get:
 *     summary: Get user's notification settings
 *     description: Returns the notification settings for the given userId.
 *     tags:
 *       - Settings
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: true
 *         description: The user ID whose notification settings to fetch.
 *         schema:
 *           type: string
 *           example: "65a1234567890abcdef12345"
 *     responses:
 *       200:
 *         description: Notification settings fetched
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 notificationSettings:
 *                   type: object
 *       404:
 *         description: User notification settings not found
 */

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url!);
    const userId = searchParams.get('userId');
    if (!userId) {
      return NextResponse.json({ status: false, message: 'userId required' }, { status: 400 });
    }
    const settings = await NotificationSettings.findOne({ userId });
    if (!settings) {
      return NextResponse.json({ status: false, message: 'Notification settings not found' }, { status: 404 });
    }
    return NextResponse.json({ status: true, notificationSettings: settings });
  } catch (error) {
    console.error('Error fetching notification settings:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ status: false, message }, { status: 500 });
  }
}
