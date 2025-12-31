/**
 * @swagger
 * /api/customer/follow/request:
 *   patch:
 *     summary: Accept or reject follow request
 *     description: Allows a user to accept or reject a follow request.
 *     tags:
 *       - Follow
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               requestId:
 *                 type: string
 *                 example: "65a1234567890abcdef12345"
 *               action:
 *                 type: string
 *                 enum: ["1", "2", "3"]
 *                 example: "1"
 *                 description: "1 = accept, 2 = reject, 3 = cancel"
 *               userId:
 *                 type: string
 *                 example: "65a1234567890abcdef67890"
 *     responses:
 *       200:
 *         description: Request action successful
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
 *                   example: "Request accepted"
 */
// Accept/reject follow request API
import { NextRequest, NextResponse } from 'next/server';
// JWT import removed
import connectDB  from '@/lib/db';
import Follow from '@/models/Follow';
import { followRequestActionSchema } from '../validator/schemas';

export async function PATCH(req: NextRequest) {
    try {
        // JWT and authorization header removed: public access
        await connectDB();
        const body = await req.json();
        const parse = followRequestActionSchema.safeParse(body);
        if (!parse.success) return NextResponse.json({ data: { status: false, message: 'Validation error', errors: parse.error.issues } }, { status: 400 });
        const { requestId, action, userId } = parse.data;
        const follow = await Follow.findById(requestId);
        if (!follow || follow.status !== 'pending' || follow.isDeleted) {
            return NextResponse.json({ data: { status: false, message: 'Request not found' } }, { status: 404 });
        }
        // Only the user being followed can accept/reject
        if (follow.following.toString() !== userId) {
            return NextResponse.json({ data: { status: false, message: 'Unauthorized: userId does not match the follow target' } }, { status: 403 });
        }
        if (action === "1") {
            follow.status = "accepted";
            await follow.save();
            return NextResponse.json({ data: { status: true, message: "Request accepted" } });
        } else if (action === "2") {
            follow.status = "rejected";
            await follow.save();
            return NextResponse.json({ data: { status: true, message: "Request rejected" } });
        } else {
            return NextResponse.json({ data: { status: false, message: "Invalid action" } }, { status: 400 });
        }
    } catch (error) {
        console.log('Error in accepting/rejecting follow request:', error);
        const message = (error instanceof Error) ? error.message : 'Internal server error';
        return NextResponse.json({ data: { status: false, message } }, { status: 500 });
    }
}
