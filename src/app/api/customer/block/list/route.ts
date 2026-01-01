/**
 * @swagger
 * /api/customer/block/list:
 *   get:
 *     summary: Get blocked accounts list
 *     description: Returns a list of accounts blocked by the user.
 *     tags:
 *       - Block
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user whose blocked accounts to fetch.
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *           example: 1
 *         description: Page number for pagination.
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           example: 10
 *         description: Number of items per page.
 *       - in: query
 *         name: search
 *         required: false
 *         schema:
 *           type: string
 *         description: Optional search string to filter blocked accounts by name or username.
 *     responses:
 *       200:
 *         description: Blocked accounts fetched successfully
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
 *                       example: Blocked accounts fetched
 *                     blockedAccounts:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           userId:
 *                             type: string
 *                             example: "65a1234567890abcdef12345"
 *                           name:
 *                             type: string
 *                             example: "John Doe"
 *                           username:
 *                             type: string
 *                             example: "johndoe"
 *                           email:
 *                             type: string
 *                             example: "john@example.com"
 *                           profileImage:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 imageUrl:
 *                                   type: string
 *                                   example: "https://example.com/profile.jpg"
 *                           isActive:
 *                             type: boolean
 *                             example: true
 *                           blockedAt:
 *                             type: string
 *                             format: date-time
 *                             example: "2026-01-01T12:00:00.000Z"
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                           example: 1
 *                         limit:
 *                           type: integer
 *                           example: 10
 *                         total:
 *                           type: integer
 *                           example: 2
 *                         totalPages:
 *                           type: integer
 *                           example: 1
 */
import { NextRequest, NextResponse } from 'next/server';
import BlockedUser from '@/models/BlockedUser';
import connectDB from '@/lib/db';
import { Types } from 'mongoose';

// GET /api/customer/block/list?userId=...
export async function GET(req: NextRequest) {
    try {
        await connectDB();
        const { searchParams } = new URL(req.url!);
        const userId = searchParams.get('userId');
        if (!userId) {
            return NextResponse.json({ data: { status: false, message: 'userId is required' } }, { status: 400 });
        }
        const search = searchParams.get('search')?.trim();
        const page = parseInt(searchParams.get('page') || '1', 10);
        const limit = parseInt(searchParams.get('limit') || '10', 10);
        const skip = (page - 1) * limit;
        // Aggregation pipeline
        const matchStage = { blockerId: Types.ObjectId.isValid(userId) ? new Types.ObjectId(userId) : userId, isDeleted: false };
        const pipeline: any[] = [
            { $match: matchStage },
            {
                $lookup: {
                    from: 'users',
                    localField: 'blockedId',
                    foreignField: '_id',
                    as: 'blockedUser',
                }
            },
            { $unwind: '$blockedUser' },
        ];
        // Always filter out inactive users
        pipeline.push({ $match: { 'blockedUser.isActive': true } });
        if (search) {
            pipeline.push({
                $match: {
                    $or: [
                        { 'blockedUser.name': { $regex: search, $options: 'i' } },
                        { 'blockedUser.username': { $regex: search, $options: 'i' } }
                    ]
                }
            });
        }
        // Count total after search
        const totalPipeline = [...pipeline, { $count: 'total' }];
        const totalResult = await BlockedUser.aggregate(totalPipeline);
        const total = totalResult[0]?.total || 0;
        // Pagination
        pipeline.push({ $sort: { blockedAt: -1 } });
        pipeline.push({ $skip: skip });
        pipeline.push({ $limit: limit });
        // Project only needed fields
        pipeline.push({
            $project: {
                userId: '$blockedUser._id',
                name: '$blockedUser.name',
                username: '$blockedUser.username',
                email: '$blockedUser.email',
                profileImage: '$blockedUser.profileImage',
                blockedAt: 1,
            }
        });
        const blockedAccounts = await BlockedUser.aggregate(pipeline);
        return NextResponse.json({
            data: {
                status: true,
                message: 'Blocked accounts fetched',
                blockedAccounts,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        console.error('Error fetching blocked accounts:', error);
        const message = (error instanceof Error) ? error.message : 'Internal server error';
        return NextResponse.json({ data: { status: false, message } }, { status: 500 });
    }
}
