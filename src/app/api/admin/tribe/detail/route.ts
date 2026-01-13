import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Tribe from '@/models/Tribe';
import TribeCategory from '@/models/TribeCategory';
import mongoose from 'mongoose';
/**
 * @swagger
 * /api/admin/tribe/detail:
 *   get:
 *     summary: Get tribe details by ID
 *     description: Fetch complete tribe profile information including all fields from database
 *     tags:
 *       - Admin Tribes
 *     parameters:
 *       - in: query
 *         name: tribeId
 *         schema:
 *           type: string
 *         required: true
 *         description: Tribe ID to fetch
 *         example: "12345abcde"
 *     responses:
 *       200:
 *         description: Tribe details fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     category:
 *                       type: string
 *                     createdDate:
 *                       type: string
 *                     createdBy:
 *                       type: string
 *                     totalMembers:
 *                       type: number
 *                     totalPosts:
 *                       type: number
 *                     icon:
 *                       type: string
 *                     coverImage:
 *                       type: string
 *                     isActive:
 *                       type: boolean
 *       400:
 *         description: Bad request - tribeId required
 *       404:
 *         description: Tribe not found
 *       500:
 *         description: Server error
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const tribeId = searchParams.get('tribeId');
  console.log('Received tribeId:', tribeId);

  try {
    await connectDB();
    console.log('Database connected successfully');

    if (!tribeId) {
      console.error('Tribe ID is missing');
      return NextResponse.json(
        { success: false, message: 'Tribe ID is required' },
        { status: 400 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(tribeId)) {
      console.error(`Invalid Tribe ID format: ${tribeId}`);
      return NextResponse.json(
        { success: false, message: 'Invalid Tribe ID format' },
        { status: 400 }
      );
    }

    try {
      const tribe = await Tribe.findById(tribeId).lean() as (typeof Tribe.schema extends mongoose.Schema<infer T> ? T : any) & { createdAt?: Date };
      console.log(`Query result for Tribe ID ${tribeId}:`, tribe);

      if (!tribe) {
        console.error(`No tribe found for ID: ${tribeId}`);
        return NextResponse.json(
          { success: false, message: 'Tribe not found' },
          { status: 404 }
        );
      }

      // Fetch category name
      let categoryName = '';
      if (tribe.category) {
        const categoryDoc = await TribeCategory.findById(tribe.category).select('name');
        categoryName = categoryDoc ? categoryDoc.name : '';
      }
      // Return all fields from the tribe document, plus id as string and categoryName
      const allFields = {
        ...tribe,
        id: tribe._id.toString(),
        categoryName,
      };

      return NextResponse.json({ success: true, data: allFields });
    } catch (error) {
      console.error(`Error fetching tribe details for ID ${tribeId}:`, error);
      return NextResponse.json(
        { success: false, message: 'Server error' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Database connection error:', error);
    return NextResponse.json(
      { success: false, message: 'Database connection error' },
      { status: 500 }
    );
  }
}