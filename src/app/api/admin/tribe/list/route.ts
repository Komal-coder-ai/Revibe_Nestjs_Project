import { NextRequest, NextResponse } from 'next/server';
import Tribe from '@/models/Tribe';
import User from '@/models/User';
import TribeMember from '@/models/TribeMember';
import Post from '@/models/Post';
import TribeCategory from '@/models/TribeCategory';
import connectDB from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();
    const { limit = 10, offset = 0 } = body;


    // Get total count for pagination
    const total = await Tribe.countDocuments({ isDeleted: { $ne: true } });

    const tribes = await Tribe.find({ isDeleted: { $ne: true } })
      .skip(offset)
      .limit(limit)
      .lean();
    const tribeIds = tribes.map((tribe: any) => tribe._id);

    const [memberCounts, postCounts] = await Promise.all([
      TribeMember.aggregate([
        { $match: { tribeId: { $in: tribeIds }, isDeleted: { $ne: true } } },
        { $group: { _id: '$tribeId', count: { $sum: 1 } } },
      ]),
      Post.aggregate([
        { $match: { tribe: { $in: tribeIds }, isDeleted: { $ne: true } } },
        { $group: { _id: '$tribe', count: { $sum: 1 } } },
      ]),
    ]);

    console.log('Tribe IDs:', tribeIds);
    console.log('Member Counts:', memberCounts);
    console.log('Post Counts:', postCounts);

    if (!tribeIds || tribeIds.length === 0) {
      console.error('No tribe IDs found');
      return NextResponse.json({ error: 'No tribes available' }, { status: 404 });
    }

    const memberCountMap = new Map(memberCounts.map((m: any) => [m._id.toString(), m.count]));
    const postCountMap = new Map(postCounts.map((p: any) => [p._id.toString(), p.count]));

    const tribeList = await Promise.all(
      tribes.map(async (tribe: any) => {
        const createdBy = await User.findById(tribe.owner).select('name _id');
        let categoryName = '';
        if (tribe.category) {
          const categoryDoc = await TribeCategory.findById(tribe.category).select('name');
          categoryName = categoryDoc ? categoryDoc.name : '';
        }
        // Return all fields from the tribe document, plus computed fields
        return {
          ...tribe,
          tribeId: tribe._id,
          tribeName: tribe.tribeName,
          category: tribe.category,
          categoryName,
          createdDate: tribe.createdAt,
          createdBy: createdBy ? createdBy.name || createdBy._id : 'Unknown',
          totalMembers: memberCountMap.get(tribe._id.toString()) || 0,
          totalPosts: postCountMap.get(tribe._id.toString()) || 0,
          icon: tribe.icon?.thumbUrl || '',
          coverImage: tribe.bannerImage?.thumbUrl || '',
          isActive: !tribe.isDeleted,
        };
      })
    );

    return NextResponse.json({
      data: tribeList,
      total,
      limit,
      offset
    });
  } catch (error) {
    console.error('Error fetching tribe list:', error);
    return NextResponse.json({ error: 'Failed to fetch tribe list' }, { status: 500 });
  }
}