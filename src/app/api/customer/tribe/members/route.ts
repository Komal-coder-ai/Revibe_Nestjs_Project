/**
 * @swagger
 * /api/customer/tribe/members:
 *   get:
 *     summary: Get all tribe members
 *     description: Retrieve a paginated list of all members in a specific tribe. Only the tribe owner can access this endpoint.
 *     tags:
 *       - Tribe
 *     parameters:
 *       - in: query
 *         name: tribeId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the tribe
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the requesting user (must be the owner)
 *       - in: query
 *         name: cursor
 *         schema:
 *           type: string
 *         required: false
 *         description: The _id of the last member from the previous page (for cursor pagination)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         required: false
 *         description: Number of members per page (default 10)
 *     responses:
 *       200:
 *         description: Tribe members fetched successfully
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
 *                     members:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             description: User ID
 *                           name:
 *                             type: string
 *                           username:
 *                             type: string
 *                           email:
 *                             type: string
 *                           profileImage:
 *                             type: array
 *                             items:
 *                               type: object
 *                           joinedAt:
 *                             type: string
 *                             format: date-time
 *                     limit:
 *                       type: integer
 *                     nextCursor:
 *                       type: string
 *                       nullable: true
 *                     total:
 *                       type: integer
 *       400:
 *         description: Missing required parameters
 *       403:
 *         description: Access denied (not tribe owner)
*/
import Tribe from '@/models/Tribe';
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import TribeMember from '@/models/TribeMember';
import { PipelineStage } from 'mongoose';
import mongoose from 'mongoose';


export async function GET(req: NextRequest) {
    try {
        await connectDB();
        const { searchParams } = new URL(req.url);
        const tribeId = searchParams.get('tribeId');
        const userId = searchParams.get('userId');
        if (!tribeId) {
            return NextResponse.json({ data: { status: false, message: 'tribeId is required' } }, { status: 400 });
        }
        if (!userId) {
            return NextResponse.json({ data: { status: false, message: 'userId is required' } }, { status: 400 });
        }

        // Validate tribe existence
        const tribe = await Tribe.findOne({ _id: tribeId, isDeleted: false });
        if (!tribe) {
            return NextResponse.json({ data: { status: false, message: 'Tribe not found' } }, { status: 404 });
        }

        // Check if the requesting user is the owner of the tribe
        const owner = await TribeMember.findOne({ tribeId, userId, role: 'owner' });
        if (!owner) {
            return NextResponse.json({ data: { status: false, message: 'Access denied: Only the tribe owner can access this resource.' } }, { status: 403 });
        }

        // Cursor-based pagination with aggregation
        const cursor = searchParams.get('cursor');
        const limit = parseInt(searchParams.get('limit') || '10', 10);
        const matchStage: any = {
            tribeId: new mongoose.Types.ObjectId(tribeId),
            isDeleted: false
        };
        if (cursor) {
            matchStage._id = { $gt: cursor };
        }

        // console.log('DEBUG: matchStage');
        const pipeline: PipelineStage[] = [
            { $match: matchStage },
            { $sort: { _id: 1 } },
            { $limit: limit },
            {
                $lookup: {
                    from: 'users',
                    localField: 'userId',
                    foreignField: '_id',
                    as: 'userInfo',
                },
            },
            { $unwind: { path: '$userInfo' } },
            {
                $project: {
                    _id: '$userInfo._id',
                    name: '$userInfo.name',
                    username: '$userInfo.username',
                    email: '$userInfo.email',
                    profileImage: '$userInfo.profileImage',
                    joinedAt: '$createdAt',
                },
            },
        ];

        const members = await TribeMember.aggregate(pipeline);
        // Get total count of tribe members (not paginated, only not deleted)
        const total = await TribeMember.countDocuments({ tribeId, isDeleted: false });
        const nextCursor = members.length === limit ? members[members.length - 1]._id : null;

        return NextResponse.json({
            data: {
                status: true,
                members,
                limit,
                nextCursor,
                total,
            },
        });
    } catch (error) {
        console.log('Error in fetching tribe members:', error);
        return NextResponse.json({ data: { status: false, message: 'Internal server error' } }, { status: 500 });
    }
}
