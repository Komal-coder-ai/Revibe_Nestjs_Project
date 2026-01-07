import { NextRequest, NextResponse } from 'next/server';

/**
 * @swagger
 * /api/customer/tribe/list:
 *   get:
 *     summary: List or search tribes
 *     description: Retrieve a list of tribes, optionally filtered by a search query.
 *     tags:
 *       - Tribe
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: The user ID to filter tribes for
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         required: false
 *         description: Search query for tribe name
 *       - in: query
 *         name: cursor
 *         schema:
 *           type: string
 *         required: false
 *         description: The _id of the last tribe from the previous page
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         required: false
 *         description: Number of tribes to return per page
 *         default: 20
 *     responses:
 *       200:
 *         description: Tribes fetched successfully
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
 *                     tribes:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           isJoined:
 *                             type: boolean
 *                             description: Whether the user has joined (is a follower of) the tribe
 *                     nextCursor:
 *                       type: string
 *                       description: The cursor for the next page
 *                     allTribesCount:
 *                       type: integer
 *                       description: Total number of tribes in the current query
 *                     joinedTribesCount:
 *                       type: integer
 *                       description: Number of tribes joined by the user in the current page
 *                     notJoinedTribesCount:
 *                       type: integer
 *                       description: Number of tribes not joined by the user in the current page
 */
import connectDB from '@/lib/db';
import Tribe from '@/models/Tribe';
import TribeMember from '@/models/TribeMember';
import { getTribePostCounts, getTribeMemberCounts } from '@/common/tribeUtils';

// List/search tribes
export async function GET(req: NextRequest) {
  try {

    await connectDB();
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    if (!userId) {
      return NextResponse.json({ data: { status: false, message: 'userId is required' } }, { status: 400 });
    }
    const q = searchParams.get('q') || '';
    const cursor = searchParams.get('cursor');
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const filter: any = { isDeleted: { $ne: true } };
    if (q) {
      filter.tribeName = { $regex: q, $options: 'i' };
    }
    if (cursor) {
      filter._id = { $gt: cursor };
    }
    const tribes = await Tribe.find(filter).sort({ _id: 1 }).limit(limit).lean();
    // Get all tribe IDs
    const tribeIds = tribes.map((tribe: any) => tribe._id);
    // Find memberships for this user
    const memberships = await TribeMember.find({ userId, tribeId: { $in: tribeIds } }).lean();
    const joinedSet = new Set(memberships.map((m: any) => m.tribeId.toString()));
    // Get post counts and member counts for each tribe using utility
    const postCountMap = await getTribePostCounts(tribeIds);
    const memberCountMap = await getTribeMemberCounts(tribeIds);

    const tribesWithJoined = tribes.map((tribe: any) => ({
      tribeId: tribe._id,
      tribeName: tribe.tribeName,
      description: tribe.description,
      category: tribe.category,
      icon: tribe.icon,
      bannerImage: tribe.bannerImage,
      rules: tribe.rules,
      isPublic: tribe.isPublic,
      createdAt: tribe.createdAt,
      updatedAt: tribe.updatedAt,
      isJoined: joinedSet.has(tribe._id.toString()),
      isOfficial: tribe.isOfficial,
      postCount: postCountMap.get(tribe._id.toString()) || 0,
      memberCount: memberCountMap.get(tribe._id.toString()) || 0,
    }));
    // Determine next cursor
    const nextCursor = tribesWithJoined.length > 0 ? tribesWithJoined[tribesWithJoined.length - 1].tribeId : null;

    // Calculate counts
    const allTribesCount = await Tribe.countDocuments(filter);
    const joinedTribesCount = tribesWithJoined.filter(t => t.isJoined).length;
    const notJoinedTribesCount = tribesWithJoined.filter(t => !t.isJoined).length;

    return NextResponse.json({
      data: {
        status: true,
        tribes: tribesWithJoined,
        nextCursor,
        allTribesCount,
        joinedTribesCount,
        notJoinedTribesCount,
      }
    });

  } catch (error) {
    console.error('Error fetching tribes:', error);
    return NextResponse.json({ data: { status: false, message: error instanceof Error ? error.message : 'Error fetching tribes' } }, { status: 500 });
  }
}
