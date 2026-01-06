import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { z } from 'zod';

/**
 * @swagger
 * /api/customer/tribe/joinOrLeave:
 *   post:
 *     summary: Join a tribe
 *     description: Allows a user to join or leave a tribe. Use type join to join and type leave to leave.
 *     tags:
 *       - Tribe
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 description: The user ID joining or leaving the tribe
 *               tribeId:
 *                 type: string
 *                 description: The tribe ID to join or leave
 *               type:
 *                 type: integer
 *                 enum:
 *                   - 1
 *                   - 0
 *                 description: 1 to join, 0 to leave the tribe
 *     responses:
 *       200:
 *         description: Joined tribe successfully
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
 *                   example: Joined tribe
 */

export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const body = await req.json();
        const schema = z.object({
            userId: z.string().min(1),
            tribeId: z.string().min(1),
            type: z.number().int().refine(val => val === 1 || val === 0, { message: 'type must be 1 (join) or 0 (leave)' })
        });
        const parse = schema.safeParse(body);
        if (!parse.success) {
            return NextResponse.json(
                {
                    data: {
                        status: false,
                        message: 'Validation error',
                        errors: parse.error.issues
                    }
                }, { status: 400 });
        }
        const { userId, tribeId, type } = parse.data;
        const Tribe = (await import('@/models/Tribe')).default;
        const TribeMember = (await import('@/models/TribeMember')).default;

        // Check if tribe exists and is not deleted
        const tribe = await Tribe.findOne({ _id: tribeId, isDeleted: { $ne: true } });
        if (!tribe) {
            return NextResponse.json({
                data: {
                    status: false,
                    message: 'Tribe not found or has been deleted'
                }
            }, { status: 404 });
        }

        if (type === 1) {
            // Check if already a member
            const existing = await TribeMember.findOne({ userId, tribeId });
            if (existing) {
                return NextResponse.json(
                    {
                        data: {
                            status: true,
                            message: 'Already a member'
                        }
                    });
            }
            await TribeMember.create({ userId, tribeId, role: 'member' });
            return NextResponse.json({ data: { status: true, message: 'Joined tribe' } });
        } else if (type === 0) {
            // Soft delete membership if exists
            const member = await TribeMember.findOne({ userId, tribeId, isDeleted: { $ne: true } });
            if (member) {
                member.isDeleted = true;
                await member.save();
                return NextResponse.json(
                    {
                        data: {
                            status: true,
                            message: 'Left tribe'
                        }
                    });
            } else {
                return NextResponse.json(
                    {
                        data: {
                            status: false,
                            message: 'Not a member of this tribe'
                        }
                    });
            }
        } else {
            return NextResponse.json(
                {
                    data: {
                        status: false,
                        message: 'Invalid type'
                    }
                }, { status: 400 });
        }
    } catch (error) {
        console.log('Error in joinOrLeave tribe:', error);
        return NextResponse.json({ data: { status: false, message: 'Internal server error' } }, { status: 500 });
    }
}
