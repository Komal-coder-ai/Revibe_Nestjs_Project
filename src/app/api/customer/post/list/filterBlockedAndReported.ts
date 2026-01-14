import BlockedUser from '@/models/BlockedUser';
import Report from '@/models/Report';
import connectDB from '@/lib/db';

export async function getBlockedAndReportedFilters(userId?: string) {
  await connectDB();
  // Find users blocked by this user (outgoing blocks)
  let blockedUsers: any[] = [];
  let blockedByUsers: any[] = [];
  let reportedPosts: any[] = [];
  let reportedUsers: any[] = [];

  if (userId) {
    blockedUsers = await BlockedUser.find({ blockerId: userId, isDeleted: false }).select('blockedId');
    blockedByUsers = await BlockedUser.find({ blockedId: userId, isDeleted: false }).select('blockerId');
    reportedPosts = await Report.find({ userId, postId: { $ne: null } }).select('postId');
    reportedUsers = await Report.find({ userId, targetUserId: { $ne: null } }).select('targetUserId');
  }

  const blockedUserIds = blockedUsers.map((b: any) => b.blockedId.toString());
  const reportedUserIds = reportedUsers.map((r: any) => r.targetUserId.toString());

  // Find users who have blocked this user (incoming blocks)
  const blockedByUserIds = blockedByUsers.map((b: any) => b.blockerId.toString());

  // Find posts reported by this user
  const blockedPostIds = reportedPosts.map((r: any) => r.postId.toString());

  // Merge block lists and reported users (no duplicates)
  const allBlockedUserIds = Array.from(new Set([...blockedUserIds, ...blockedByUserIds, ...reportedUserIds]));

  return { blockedUserIds: allBlockedUserIds, blockedPostIds };
}
