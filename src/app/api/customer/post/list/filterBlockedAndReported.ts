import BlockedUser from '@/models/BlockedUser';
import Report from '@/models/Report';
import connectDB from '@/lib/db';

export async function getBlockedAndReportedFilters(userId?: string) {
  await connectDB();
  // Find users blocked by this user (outgoing blocks)
  let blockedUsers: any[] = [];
  let blockedByUsers: any[] = [];
  let reportedPosts: any[] = [];

  if (userId) {
    blockedUsers = await BlockedUser.find({ blockerId: userId, isDeleted: false }).select('blockedId');
    // console.log("blockedUsers", blockedUsers);
    blockedByUsers = await BlockedUser.find({ blockedId: userId, isDeleted: false }).select('blockerId');
     reportedPosts = await Report.find({ userId }).select('postId');
  }

  const blockedUserIds = blockedUsers.map((b: any) => b.blockedId.toString());

  // Find users who have blocked this user (incoming blocks)
  const blockedByUserIds = blockedByUsers.map((b: any) => b.blockerId.toString());

  // Find posts reported by this user
  const blockedPostIds = reportedPosts.map((r: any) => r.postId.toString());

  // Merge both block lists (no duplicates)
  const allBlockedUserIds = Array.from(new Set([...blockedUserIds, ...blockedByUserIds]));

  return { blockedUserIds: allBlockedUserIds, blockedPostIds };
}
