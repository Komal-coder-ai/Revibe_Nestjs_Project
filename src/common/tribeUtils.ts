import Post from '@/models/Post';
import TribeMember from '@/models/TribeMember';

/**
 * Get member counts for an array of tribe IDs.
 * @param {Array<string|Object>} tribeIds - Array of tribe ObjectIds or strings
 * @returns {Promise<Map<string, number>>} Map of tribeId to member count
 */
export async function getTribeMemberCounts(tribeIds: Array<string | any>): Promise<Map<string, number>> {
    if (!tribeIds || tribeIds.length === 0) return new Map();
    const memberCounts = await TribeMember.aggregate([
        { $match: { tribeId: { $in: tribeIds }, isDeleted: { $ne: true } } },
        { $group: { _id: '$tribeId', count: { $sum: 1 } } }
    ]);
    return new Map(memberCounts.map((m: any) => [m._id.toString(), m.count]));
}

/**
 * Get post counts for an array of tribe IDs.
 * @param {Array<string|Object>} tribeIds - Array of tribe ObjectIds or strings
 * @returns {Promise<Map<string, number>>} Map of tribeId to post count
 */
export async function getTribePostCounts(tribeIds: Array<string | any>): Promise<Map<string, number>> {
    if (!tribeIds || tribeIds.length === 0) return new Map();
    const postCounts = await Post.aggregate([
        { $match: { tribe: { $in: tribeIds }, isDeleted: { $ne: true } } },
        { $group: { _id: '$tribe', count: { $sum: 1 } } }
    ]);
    return new Map(postCounts.map((p: any) => [p._id.toString(), p.count]));
}
