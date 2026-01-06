import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Tribe from '@/models/Tribe';
import { z } from 'zod';

/**
 * @swagger
 * /api/customer/tribe/delete:
 *   patch:
 *     summary: Soft delete a tribe
 *     description: Soft deletes a tribe by setting isDeleted to true. Only the owner or admin can delete.
 *     tags:
 *       - Tribe
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tribeId:
 *                 type: string
 *                 description: The ID of the tribe to delete
 *               userId:
 *                 type: string
 *                 description: The user ID performing the delete
 *     responses:
 *       200:
 *         description: Tribe soft deleted successfully
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
 *                   example: Tribe deleted
 */

export async function PATCH(req: NextRequest) {
    try {
        await connectDB();
        const body = await req.json();
        const schema = z.object({
            tribeId: z.string().min(1),
            userId: z.string().min(1),
        });
        const parse = schema.safeParse(body);
        if (!parse.success) {
            return NextResponse.json({ data: { status: false, message: 'Validation error', errors: parse.error.issues } }, { status: 400 });
        }
        const { tribeId, userId } = parse.data;
        // Check if user is owner or admin
        const TribeMember = (await import('@/models/TribeMember')).default;
        const member = await TribeMember.findOne({ tribeId, userId });
        if (!member || (member.role !== 'owner' && member.role !== 'admin')) {
            return NextResponse.json({
                data: {
                    status: false,
                    message: 'You are not authorized to delete this tribe.'
                }
            }, { status: 403 });
        }
        // Soft delete tribe and record who deleted
        const tribe = await Tribe.findByIdAndUpdate(
            tribeId,
            { isDeleted: true, deletedBy: userId },
            { new: true }
        );
        if (!tribe) {
            return NextResponse.json({ data: { status: false, message: 'Tribe not found' } }, { status: 404 });
        }
        return NextResponse.json({ data: { status: true, message: 'Tribe deleted' } });
    } catch (error) {
        console.log('Error deleting tribe:', error);
        return NextResponse.json({
            data: {
                status: false,
                message: error instanceof Error ? error.message : 'Error deleting tribe'
            }
        }, { status: 500 });
    }
}
