import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import TribeCategory from '@/models/TribeCategory';

/**
 * @swagger
 * /api/admin/tribe/category/addOrUpdate:
 *   post:
 *     summary: Add or update a tribe category
 *     description: Create a new tribe category or update an existing one by providing a name and optional _id.
 *     tags:
 *       - Admin Tribes
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               _id:
 *                 type: string
 *                 example: 695e3fe8f63ef1029de0cfe5
 *                 description: The id of the tribe category (for update)
 *               name:
 *                 type: string
 *                 example: Nature
 *                 description: The name of the tribe category
 *     responses:
 *       200:
 *         description: Category created or updated successfully
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
 *                   example: Category created/updated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 695e3fe8f63ef1029de0cfe5
 *                     name:
 *                       type: string
 *                       example: Nature
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 */

export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const body = await req.json();
        const { _id, name } = body;

        if (!name || name.trim() === '') {
            return NextResponse.json(
                {
                    status: false,
                    message: 'Category name is required',
                },
                { status: 400 }
            );
        }

        let category;
        if (_id) {
            // Update existing category
            category = await TribeCategory.findByIdAndUpdate(
                _id,
                { name: name.trim() },
                { new: true }
            );
            if (!category) {
                return NextResponse.json(
                    {
                        status: false,
                        message: 'Category not found',
                    },
                    { status: 404 }
                );
            }
        } else {
            // Create new category
            category = new TribeCategory({ name: name.trim() });
            await category.save();
        }

        return NextResponse.json(
            {
                status: true,
                message: _id ? 'Category updated successfully' : 'Category added successfully',
                data: category,
            },
            { status: _id ? 200 : 201 }
        );
    } catch (error) {
        return NextResponse.json(
            {
                status: false,
                message: 'Failed to add/update category',
                error: error instanceof Error ? error.message : String(error),
            },
            { status: 500 }
        );
    }
}
