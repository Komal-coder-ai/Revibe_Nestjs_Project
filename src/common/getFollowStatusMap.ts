//
// Follow Status Codes:
// 0 = No relation (neither follows the other)
// 1 = You sent a follow request to them (pending)
// 2 = You follow them (accepted)
// 3 = You sent a follow request but it was rejected
// 4 = Self (the same user)
// 5 = They follow you, but you do not follow them
// 6 = Blocked (either you blocked them or they blocked you)
import Follow from '@/models/Follow';
import BlockedUser from '@/models/BlockedUser';

/**
 * Get follow/friend status for a list of users with respect to the logged-in user.
 * @param {string} userId - The logged-in user's ID
 * @param {string[]} targetUserIds - Array of user IDs to check status against
 * @returns {Promise<Record<string, number>>} - Map of userId to status code
 * Status codes: 0 = no relation, 1 = pending, 2 = accepted, 3 = rejected, 4 = self
 */
/**
 * Get follow/friend status for a list of users with respect to the logged-in user.
 * @param {string} userId - The logged-in user's ID
 * @param {string[]|string} targetUserIds - Array of user IDs or a single user ID to check status against
 * @returns {Promise<Record<string, number>>} - Map of userId to status code
 * Status codes: 0 = no relation, 1 = pending, 2 = accepted, 3 = rejected, 4 = self
 */
export async function getFollowStatusMap(userId: string, targetUserIds: string[] | string): Promise<Record<string, number>> {
    const ids = Array.isArray(targetUserIds) ? targetUserIds : [targetUserIds];
    if (!userId || !ids.length) return {};

    // Check block status in both directions
    const blocked = await BlockedUser.find({
        $or: [
            { blockerId: userId, blockedId: { $in: ids }, isDeleted: false },
            { blockerId: { $in: ids }, blockedId: userId, isDeleted: false }
        ]
    }).select('blockerId blockedId');

    // Find if userId follows targetUserIds
    const followStatuses = await Follow.find({
        follower: userId,
        following: { $in: ids },
        isDeleted: false
    }).select('following status');

    // Find if targetUserIds follow userId (reverse)
    const reverseStatuses = await Follow.find({
        follower: { $in: ids },
        following: userId,
        isDeleted: false
    }).select('follower status');

    const followStatusMap: Record<string, number> = {};
    ids.forEach((targetId) => {
        if (targetId === userId) {
            followStatusMap[targetId] = 4;
        } else {
            // Check if blocked in either direction
            const isBlocked = blocked.some((b: any) =>
                (b.blockerId.toString() === userId && b.blockedId.toString() === targetId) ||
                (b.blockerId.toString() === targetId && b.blockedId.toString() === userId)
            );
            if (isBlocked) {
                followStatusMap[targetId] = 6;
                return;
            }
            const found = followStatuses.find((f: any) => f.following.toString() === targetId);
            if (found) {
                if (found.status === 'pending') followStatusMap[targetId] = 1;
                else if (found.status === 'accepted') followStatusMap[targetId] = 2;
                else followStatusMap[targetId] = 0;
            } else {
                // Check if they follow me (reverse)
                const reverseFound = reverseStatuses.find((f: any) => f.follower.toString() === targetId && f.status === 'accepted');
                if (reverseFound) followStatusMap[targetId] = 5; // 5 = they follow me, I don't follow them
                else followStatusMap[targetId] = 0;
            }
        }
    });
    return followStatusMap;
}

/**
 * Get follow/friend status code for a single user.
 * @param {string} userId - The logged-in user's ID
 * @param {string} targetUserId - The user ID to check status against
 * @returns {Promise<number>} - Status code
 */
export async function getSingleFollowStatus(userId: string, targetUserId: string): Promise<number> {
    if (!userId || !targetUserId) return 0;
    if (userId === targetUserId) return 4;
    // Check if blocked in either direction
    const isBlocked = await BlockedUser.findOne({
        $or: [
            { blockerId: userId, blockedId: targetUserId, isDeleted: false },
            { blockerId: targetUserId, blockedId: userId, isDeleted: false }
        ]
    }).select('_id');
    if (isBlocked) return 6;
    const follow = await Follow.findOne({ follower: userId, following: targetUserId, isDeleted: false }).select('status');
    if (follow) {
        if (follow.status === 'pending') return 1;
        if (follow.status === 'accepted') return 2;
        return 0;
    }
    // Check if they follow me (reverse)
    const reverseFollow = await Follow.findOne({ follower: targetUserId, following: userId, status: 'accepted', isDeleted: false }).select('_id');
    if (reverseFollow) return 5; // 5 = they follow me, I don't follow them
    return 0;
}
