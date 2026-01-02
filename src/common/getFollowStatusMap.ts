import Follow from '@/models/Follow';

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
    const followStatuses = await Follow.find({
        follower: userId,
        following: { $in: ids },
        isDeleted: false
    }).select('following status');

    const followStatusMap: Record<string, number> = {};
    ids.forEach((targetId) => {
        if (targetId === userId) {
            followStatusMap[targetId] = 4;
        } else {
            const found = followStatuses.find((f: any) => f.following.toString() === targetId);
            if (!found) followStatusMap[targetId] = 0;
            else if (found.status === 'pending') followStatusMap[targetId] = 1;
            else if (found.status === 'accepted') followStatusMap[targetId] = 2;
            else if (found.status === 'rejected') followStatusMap[targetId] = 3;
            else followStatusMap[targetId] = 0;
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
    const follow = await Follow.findOne({ follower: userId, following: targetUserId, isDeleted: false }).select('status');
    if (!follow) return 0;
    if (follow.status === 'pending') return 1;
    if (follow.status === 'accepted') return 2;
    if (follow.status === 'rejected') return 3;
    return 0;
}
