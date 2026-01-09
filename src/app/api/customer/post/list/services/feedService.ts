// feedService.ts
// Handles Instagram-like feed aggregation and ranking logic

import mongoose from 'mongoose';
import { getAggregatedPosts } from '@/common/getAggregatedPosts';
import Follow from '@/models/Follow';
import { getBlockedAndReportedFilters } from '../filterBlockedAndReported';

interface GetFeedPostsParams {
    userId?: string;
    cursor?: string;
    cursorId?: string;
    limit?: number;
    type?: string;
    hashtag?: string;
}

/**
 * Fetches feed posts for a user, respecting follows, blocks, privacy, and ranking.
 * @param userId - The current user's ID
 * @param cursor - The pagination cursor (createdAt or _id)
 * @param limit - Number of posts to fetch
 * @returns Aggregated posts
 */
export async function getFeedPosts({ userId, cursor, cursorId, limit = 10, type, hashtag }: GetFeedPostsParams) {

    // Get followed user IDs (accepted only)
    let followingIds: string[] = [];
    if (userId) {
        const following = await Follow.find({
            user: userId,
            status: 'accepted',
            isDeleted: false
        }).select('following');
        followingIds = following.map(f => f.following);
        // console.log('Following IDs:', followingIds);
    }


    // Blocked users/posts
    let blockedUserIds: string[] = [];
    let blockedPostIds: string[] = [];
    if (userId) {
        ({ blockedUserIds, blockedPostIds } = await getBlockedAndReportedFilters(userId));
    }
    // console.log('Blocked User IDs:', blockedUserIds);
    // console.log('Blocked Post IDs:', blockedPostIds);

    // Build filter for posts from followed users or public accounts, excluding blocked users
    // TODO: In the future, add logic here to select which public accounts' posts to show in the feed
    // Build base match filter
    const baseMatch: any = {
        isDeleted: false,
        _id: blockedPostIds.length ? { $nin: blockedPostIds } : { $exists: true },
        $or: [
            { tribe: { $exists: false } },
            { tribe: null }
        ], // Exclude tribe posts from main feed
    };
    if (type && type !== 'all') {
        baseMatch.type = type;
    }
    if (typeof hashtag === 'string' && hashtag.trim() !== '') {
        // Assuming post has a hashtags array field
        baseMatch.hashtags = hashtag;
    }
    if (cursor && cursorId) {
        // Use both createdAt and _id for pagination (descending order)
        baseMatch.$or = [
            { createdAt: { $lt: new Date(cursor) } },
            { createdAt: new Date(cursor), _id: { $lt: mongoose.Types.ObjectId.isValid(cursorId) ? new mongoose.Types.ObjectId(cursorId) : cursorId } }
        ];
    } else if (cursor) {
        baseMatch['createdAt'] = { $lt: new Date(cursor) };
    }

    // Use shared aggregation utility
    return await getAggregatedPosts({
        match: baseMatch,
        blockedUserIds,
        followingIds,
        limit,
        addEngagementScore: true,
        sort: { engagementScore: -1, createdAt: -1 }
    });
}
