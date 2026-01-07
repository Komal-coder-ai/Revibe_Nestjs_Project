// getAggregatedPosts.ts
// Shared utility for post aggregation pipelines

import mongoose from 'mongoose';
import Post from '@/models/Post';

interface AggregationOptions {
  match: any;
  blockedUserIds?: string[];
  followingIds?: string[];
  limit: number;
  addEngagementScore?: boolean;
  sort?: any;
}

export async function getAggregatedPosts({ match, blockedUserIds = [], followingIds = [], limit, addEngagementScore = false, sort }: AggregationOptions) {
  const pipeline: any[] = [
    { $match: match },
    {
      $lookup: {
        from: 'users',
        localField: 'user',
        foreignField: '_id',
        as: 'userInfo',
      },
    },
    { $unwind: '$userInfo' },
    { $match: { 'userInfo._id': { $nin: blockedUserIds.map(id => new mongoose.Types.ObjectId(id)) } } },
  ];

  if (followingIds.length > 0) {
    pipeline.push({
      $match: {
        $or: [
          { user: { $in: followingIds.map(id => new mongoose.Types.ObjectId(id)) } },
          { 'userInfo.profileType': 'public' },
        ],
      },
    });
  }

  if (addEngagementScore) {
    pipeline.push({
      $addFields: {
        engagementScore: {
          $add: [
            { $multiply: ['$likeCount', 2] },
            { $multiply: ['$commentCount', 3] },
            { $multiply: ['$shareCount', 1] },
            { $toLong: { $subtract: [Date.now(), { $toLong: '$createdAt' }] } },
          ],
        },
      },
    });
    pipeline.push({ $sort: sort || { engagementScore: -1, createdAt: -1 } });
  } else {
    pipeline.push({ $sort: sort || { createdAt: -1 } });
  }

  pipeline.push({ $limit: limit });

  pipeline.push({
    $addFields: {
      user: {
        _id: '$userInfo._id',
        username: '$userInfo.username',
        name: '$userInfo.name',
        profileImage: '$userInfo.profileImage',
      },
    },
  });

  pipeline.push({
    $project: {
      user: 1,
      taggedUsers: 1,
      type: 1,
      media: 1,
      text: 1,
      caption: 1,
      location: 1,
      hashtags: 1,
      options: 1,
      correctOption: 1,
      createdAt: 1,
      updatedAt: 1,
    },
  });

  return await Post.aggregate(pipeline);
}
