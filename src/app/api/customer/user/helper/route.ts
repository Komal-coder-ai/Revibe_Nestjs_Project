/**
 * @swagger
 * /api/customer/user/helper:
 *   get:
 *     summary: List all tribe categories
 *     description: Retrieve all tribe categories that are not deleted, sorted by creation date descending.
 *     tags:
 *       - User
 *     responses:
 *       200:
 *         description: Tribe categories fetched successfully
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
 *                   example: Tribe categories fetched successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     tribeCategories:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             example: 695e3fe8f63ef1029de0cfe5
 *                           name:
 *                             type: string
 *                             example: Nature
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                             example: 2026-01-07T11:13:44.235Z
 *                           updatedAt:
 *                             type: string
 *                             format: date-time
 *                             example: 2026-01-07T11:13:44.235Z
 *                           isDeleted:
 *                             type: boolean
 *                             example: false
 */

import { NextResponse, NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import TribeCategory from '@/models/TribeCategory';
export async function GET(req: NextRequest) {
    try {
        await connectDB();
        const tribeCategories = await TribeCategory.find({ isDeleted: { $ne: true } }).sort({ createdAt: -1 }).select('name ');
        let ResponseProject = {
            tribeCategories
        };
        return NextResponse.json({ data: ResponseProject, message: 'data fetched successfully', status: true });

    } catch (error) {
        console.log('Error in tribe category route:', error);
        return NextResponse.json({ data: { message: 'Error occurred', status: false } }, { status: 500 });
    }
}