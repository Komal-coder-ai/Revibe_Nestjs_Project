/**
 * @swagger
 * /api/customer/tribe/list:
 *   get:
 *     summary: List or search tribes
 *     description: >
 *       Retrieve a list of tribes with pagination, search, and join status.
 *       Supports filtering by all tribes, joined tribes, and not joined tribes.
 *     tags:
 *       - Tribe
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         required: false
 *         description: Logged-in user ID used to calculate join status
 *
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         required: false
 *         description: Search tribes by name (case-insensitive)
 *
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: ["1", "2", "3"]
 *           default: "1"
 *         required: false
 *         description: |
 *           Tribe filter type:
 *           1 = All tribes
 *           2 = Joined tribes
 *           3 = Not joined tribes
 *
 *       - in: query
 *         name: cursor
 *         schema:
 *           type: string
 *         required: false
 *         description: The _id of the last tribe from the previous page (cursor pagination)
 *
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         required: false
 *         description: Number of tribes to return per page
 *
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
 *
 *                     tribes:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           tribeId:
 *                             type: string
 *                             example: "65b8f1e6d3a9c9a9f1b1c123"
 *                           tribeName:
 *                             type: string
 *                             example: "Developers Hub"
 *                           description:
 *                             type: string
 *                             example: "A tribe for software developers"
 *                           category:
 *                             type: string
 *                             example: "Technology"
 *                           icon:
 *                             type: string
 *                             example: "https://cdn.example.com/icon.png"
 *                           bannerImage:
 *                             type: string
 *                             example: "https://cdn.example.com/banner.png"
 *                           rules:
 *                             type: string
 *                             example: "Be respectful"
 *                           isPublic:
 *                             type: boolean
 *                             example: true
 *                           isOfficial:
 *                             type: boolean
 *                             example: false
 *                           isJoined:
 *                             type: boolean
 *                             description: Whether the user has joined the tribe
 *                             example: true
 *                           postCount:
 *                             type: integer
 *                             example: 25
 *                           memberCount:
 *                             type: integer
 *                             example: 150
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                           updatedAt:
 *                             type: string
 *                             format: date-time
 *
 *                     nextCursor:
 *                       type: string
 *                       nullable: true
 *                       description: Cursor value for fetching the next page
 *
 *                     allTribesCount:
 *                       type: integer
 *                       description: Total number of tribes
 *                       example: 120
 *
 *                     joinedTribesCount:
 *                       type: integer
 *                       description: Total number of tribes joined by the user
 *                       example: 10
 *
 *                     notJoinedTribesCount:
 *                       type: integer
 *                       description: Total number of tribes not joined by the user
 *                       example: 110
 */


import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Tribe from '@/models/Tribe';
import TribeMember from '@/models/TribeMember';
import TribeCategory from '@/models/TribeCategory';
import { getTribePostCounts, getTribeMemberCounts } from '@/common/tribeUtils';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);

    const userId = searchParams.get('userId') || undefined;
    let search = searchParams.get('search') || '';
    if (search === '""') search = '';
    const type = searchParams.get('type') || '1'; // 1=all, 2=joined, 3=not joined
    let cursor = searchParams.get('cursor');
    if (cursor === '' || cursor === '""') cursor = null;
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    /* ----------------------------------------
       BASE FILTER
    ---------------------------------------- */
    const tribeFilter: any = {
      isDeleted: { $ne: true },
    };

    if (search) {
      tribeFilter.tribeName = { $regex: search, $options: 'i' };
    }

    if (cursor) {
      tribeFilter._id = { $gt: cursor };
    }

    /* ----------------------------------------
       TYPE LOGIC
    ---------------------------------------- */
    let joinedIds: any[] = [];

    if (userId) {
      const joinedDocs = await TribeMember.find({ userId })
        .select('tribeId')
        .lean();
      joinedIds = joinedDocs.map(d => d.tribeId);
    }

    if (type === '2') {
      // Joined
      if (!userId) {
        return NextResponse.json({
          data: {
            status: true,
            tribes: [],
            nextCursor: null,
            allTribesCount: await Tribe.countDocuments({ isDeleted: { $ne: true } }),
            joinedTribesCount: 0,
            notJoinedTribesCount: 0,
          },
        });
      }

      tribeFilter._id = {
        ...(tribeFilter._id || {}),
        $in: joinedIds.length ? joinedIds : [],
      };
    }

    if (type === '3' && userId) {
      tribeFilter._id = {
        ...(tribeFilter._id || {}),
        $nin: joinedIds,
      };
    }

    /* ----------------------------------------
       FETCH TRIBES
    ---------------------------------------- */
    // Use aggregation to join category details
    const tribes = await Tribe.aggregate([
      { $match: tribeFilter },
      { $sort: { _id: -1 } }, // Latest first
      { $limit: limit },
      {
        $lookup: {
          from: 'tribecategories',
          localField: 'category',
          foreignField: '_id',
          as: 'categoryDetails'
        }
      },
      {
        $addFields: {
          category: { $arrayElemAt: ['$categoryDetails', 0] }
        }
      },
      {
        $project: {
          categoryDetails: 0
        }
      }
    ]);

    const tribeIds = tribes.map(t => t._id);

    /* ----------------------------------------
       MEMBERSHIP FLAG
    ---------------------------------------- */
    const joinedSet = new Set(joinedIds.map(id => id.toString()));

    const postCountMap = await getTribePostCounts(tribeIds);
    const memberCountMap = await getTribeMemberCounts(tribeIds);

    const responseTribes = tribes.map((tribe: any) => ({
      tribeId: tribe._id,
      tribeName: tribe.tribeName,
      description: tribe.description,
      category: tribe.category && typeof tribe.category === 'object' ? {
        id: tribe.category._id,
        name: tribe.category.name
      } : tribe.category,
      icon: tribe.icon,
      bannerImage: tribe.bannerImage,
      rules: tribe.rules,
      isPublic: tribe.isPublic,
      isOfficial: tribe.isOfficial,
      createdAt: tribe.createdAt,
      updatedAt: tribe.updatedAt,
      isJoined: joinedSet.has(tribe._id.toString()),
      postCount: postCountMap.get(tribe._id.toString()) || 0,
      memberCount: memberCountMap.get(tribe._id.toString()) || 0,
    }));

    /* ----------------------------------------
       CURSOR
    ---------------------------------------- */
    const nextCursor =
      tribes.length > 0 ? tribes[tribes.length - 1]._id : null;

    /* ----------------------------------------
       COUNTS (GLOBAL)
    ---------------------------------------- */
    const allTribesCount = await Tribe.countDocuments({
      isDeleted: { $ne: true },
    });

    const joinedTribesCount = userId
      ? joinedIds.length
      : 0;

    const notJoinedTribesCount = userId
      ? allTribesCount - joinedTribesCount
      : allTribesCount;

    return NextResponse.json({
      data: {
        status: true,
        tribes: responseTribes,
        nextCursor,
        allTribesCount,
        joinedTribesCount,
        notJoinedTribesCount,
      },
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { data: { status: false, message: 'Error fetching tribes' } },
      { status: 500 }
    );
  }
}


