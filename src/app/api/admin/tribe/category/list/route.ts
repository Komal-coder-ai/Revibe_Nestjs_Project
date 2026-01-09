/**
 * @swagger
 * /api/admin/tribe/category/list:
 *   post:
 *     summary: Get tribe category list
 *     description: Fetch all tribe categories with pagination, search, and sorting. Accepts all filters, pagination, and sorting in the payload.
 *     tags:
 *       - Admin Tribes
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               page:
 *                 type: integer
 *                 example: 1
 *               limit:
 *                 type: integer
 *                 example: 10
 *               sort:
 *                 type: object
 *                 description: MongoDB sort object
 *     responses:
 *       200:
 *         description: Tribe categories fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: "65a1234567890abcdef12345"
 *                       name:
 *                         type: string
 *                         example: "Music"
 *                       isDeleted:
 *                         type: boolean
 *                         example: false
 *                       active:
 *                         type: integer
 *                         description: 1 for active, 0 for inactive
 *                         example: 1
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     current:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *       500:
 *         description: Server error
 */
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import TribeCategory from '@/models/TribeCategory';

// POST /api/admin/category/list
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const payload = await request.json();
    // Only show active (not deleted) categories
    const page = parseInt(payload.page, 10) || 1;
    const limit = parseInt(payload.limit, 10) || 10;
    const skip = (page - 1) * limit;
    const sort = payload.sort || { createdAt: -1 };

    const categoriesRaw = await TribeCategory.find({ isDeleted: false })
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();

    const categories = categoriesRaw.map((cat: any) => ({
      _id: cat._id,
      name: cat.name,
      active: cat.isDeleted ? 0 : 1,
    }));

    const total = await TribeCategory.countDocuments({ isDeleted: false });
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data: categories,
      pagination: {
        current: page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch categories',
      error: error instanceof Error ? error.message : String(error),
    }, { status: 500 });
  }
}
