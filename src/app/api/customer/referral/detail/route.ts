/**
 * @swagger
 * /api/customer/referral/detail:
 *   get:
 *     summary: Get referral details and joined user count for a user
 *     description: Returns referral code, referrer info, and how many users joined via this user's referral (using Referral model).
 *     tags:
 *       - Referral
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: The user ID of the referrer
 *     responses:
 *       200:
 *         description: Referral details and joined count
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
 *                       example: Referral details fetched successfully
 *                     userId:
 *                       type: string
 *                     referralCode:
 *                       type: string
 *                     joinedCount:
 *                       type: integer
 *                       example: 5
 *                     rewardEarned:
 *                       type: integer
 *                       example: 0
 *       400:
 *         description: userId is required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import Referral from '@/models/Referral';

// GET /api/customer/referral/detail?userId=xxxx
export async function GET(req: NextRequest) {
    try {
        await connectDB();
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');
        if (!userId) {
            return NextResponse.json({
                data: {
                    status: false,
                    message: 'userId is required.'
                }
            }, { status: 400 });
        }

        // Find the user by userId
        const referrer = await User.findById(userId);
        if (!referrer) {
            return NextResponse.json({
                data: {
                    status: false,
                    message: 'User not found.'
                }
            }, { status: 404 });
        }

        // Count how many users joined via this user's referral using Referral model
        const joinedCount = await Referral.countDocuments({ referredBy: referrer._id });

        // Optionally, get the list of users who joined via this user using Referral model
        // const joinedUsers = await Referral.find({ referredBy: referrer._id }).populate('referredUser');

        return NextResponse.json({
            data: {
                status: true,
                message: 'Referral details fetched successfully',
                userId,
                referralCode: referrer.referralCode,
                joinedCount,
                rewardEarned: 0,
                // joinedUsers, // Uncomment if you want to return the list
            }
        });
    } catch (error) {
        console.log('Error in GET /api/customer/referral/detail:', error);
        return NextResponse.json({
            data: {
                status: false,
                message: 'Server error',
                error: (error as Error).message
            }
        }, { status: 500 });
    }
}
