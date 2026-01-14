// Support PUT as an alias for PATCH
export async function PUT(request: NextRequest) {
	// Delegate to PATCH handler
	return PATCH(request);
}

/**
 * @swagger
 * /api/admin/tribe/activeinactive:
 *   patch:
 *     summary: Update tribe active/inactive status
 *     description: Set a tribe as active or inactive by toggling isDeleted in the database.
 *     tags:
 *       - Admin Tribes
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tribeId:
 *                 type: string
 *                 example: "65a1234567890abcdef12345"
 *               isActive:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Tribe status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Tribe status updated.
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     isDeleted:
 *                       type: boolean
 *       400:
 *         description: tribeId and isActive are required
 *       404:
 *         description: Tribe not found
 *       500:
 *         description: Server error
 */
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Tribe from '@/models/Tribe';

export async function PATCH(request: NextRequest) {
	try {
		await connectDB();
		const { tribeId, isActive } = await request.json();
		if (!tribeId || typeof isActive !== 'boolean') {
			return NextResponse.json({ success: false, message: 'tribeId and isActive are required.' }, { status: 400 });
		}
		const updated = await Tribe.findByIdAndUpdate(
			tribeId,
			{ isActive: isActive },
			{ new: true }
		);
		if (!updated) {
			return NextResponse.json({ success: false, message: 'Tribe not found.' }, { status: 404 });
		}
		return NextResponse.json({
			success: true,
			message: 'Tribe status updated.',
			data: {
				_id: updated._id,
				isDeleted: updated.isDeleted,
				active: updated.isDeleted ? 0 : 1
			}
		});
	} catch (error) {
		console.error('Error updating tribe status:', error);
		return NextResponse.json({ success: false, message: 'Failed to update tribe status', error: error instanceof Error ? error.message : String(error) }, { status: 500 });
	}
}
