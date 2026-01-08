import { NextRequest, NextResponse } from 'next/server';

/**
 * @swagger
 * /api/customer/tribe/detail:
 *   get:
 *     summary: Get tribe details
 *     description: Retrieve details of a specific tribe by its ID.
 *     tags:
 *       - Tribe
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         required: false
 *         description: The user ID to filter tribe for
 *       - in: query
 *         name: tribeId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the tribe to retrieve
 *     responses:
 *       200:
 *         description: Tribe details fetched successfully
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
 *                     tribe:
 *                       type: object
 */
import connectDB from '@/lib/db';
import Tribe from '@/models/Tribe';
import { getTribeMemberCounts, getTribePostCounts } from '@/common/tribeUtils';
import TribeMember from '@/models/TribeMember';


// Get tribe details
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    let userId = searchParams.get('userId') ?? undefined;
    const tribeId = searchParams.get('tribeId');
    if (!tribeId) {
      return NextResponse.json({ data: { status: false, message: 'tribeId is required' } }, { status: 400 });
    }
    const tribe = await Tribe.findOne({ _id: tribeId, isDeleted: false });
    if (!tribe) return NextResponse.json({ data: { status: false, message: 'Tribe not found' } }, { status: 404 });
    if (tribe) {
      // Get member and post counts using utility functions
      const [memberCountMap, postCountMap] = await Promise.all([
        getTribeMemberCounts([tribe._id]),
        getTribePostCounts([tribe._id])
      ]);
      let isJoined = false;
      if (userId) {
        isJoined = !!(await TribeMember.exists({
          userId,
          tribeId: tribe._id,
        }));
      }

      const memberCount = memberCountMap.get(tribe._id.toString()) || 0;
      const postCount = postCountMap.get(tribe._id.toString()) || 0;
      return NextResponse.json({
        data: {
          status: true,
          tribe: {
            tribeId: tribe._id,
            tribeName: tribe.tribeName,
            description: tribe.description,
            category: tribe.category,
            icon: tribe.icon,
            bannerImage: tribe.bannerImage,
            rules: tribe.rules,
            isPublic: tribe.isPublic,
            isOfficial: tribe.isOfficial,
            createdAt: tribe.createdAt,
            updatedAt: tribe.updatedAt,
            memberCount,
            postCount,
            isJoined
          }
        }
      });
    }
  } catch (error) {
    console.log('Error fetching tribe details:', error);
    return NextResponse.json({ data: { status: false, message: 'Internal server error', error: error instanceof Error ? error.message : String(error) } }, { status: 500 });
  }
}
