/**
 * @swagger
 * /api/admin/tribe/category/activeinactive:
 *   patch:
 *     summary: Update tribe category active/inactive status
 *     description: Set a tribe category as active or inactive by toggling isDeleted in the database.
 *     tags:
 *       - Admin Tribes
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               categoryId:
 *                 type: string
 *                 example: "65a1234567890abcdef12345"
 *               isActive:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Category status updated successfully
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
 *                   example: Category status updated.
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     isDeleted:
 *                       type: boolean
 *                     active:
 *                       type: integer
 *                       example: 1
 *       400:
 *         description: categoryId and isActive are required
 *       404:
 *         description: Category not found
 *       500:
 *         description: Server error
 */

import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import TribeCategory from '@/models/TribeCategory';

// PATCH /api/admin/tribe/category/activeinactive
export async function PATCH(request: NextRequest) {
    try {
        await connectDB();
        const { categoryId, isActive } = await request.json();
        if (!categoryId || typeof isActive !== 'boolean') {
            return NextResponse.json({ success: false, message: 'categoryId and isActive are required.' }, { status: 400 });
        }
        const updated = await TribeCategory.findByIdAndUpdate(
            categoryId,
            { isDeleted: !isActive },
            { new: true }
        );
        if (!updated) {
            return NextResponse.json({ success: false, message: 'Category not found.' }, { status: 404 });
        }
        return NextResponse.json({ success: true, message: 'Category status updated.', data: { _id: updated._id, isDeleted: updated.isDeleted, active: updated.isDeleted ? 0 : 1 } });
    } catch (error) {
        console.error('Error updating category status:', error);
        return NextResponse.json({ success: false, message: 'Failed to update category status', error: error instanceof Error ? error.message : String(error) }, { status: 500 });
    }
}
