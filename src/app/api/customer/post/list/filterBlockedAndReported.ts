import BlockedUser from '@/models/BlockedUser';
import Report from '@/models/Report';
import mongoose from 'mongoose';

export async function getBlockedAndReportedFilters(userId: string) {
  // Find users blocked by this user
  const blockedUsers = await BlockedUser.find({ blockerId: userId }).select('blockedId');
  const blockedUserIds = blockedUsers.map((b: any) => b.blockedId.toString());

  // Find posts reported by this user
  const reportedPosts = await Report.find({ userId }).select('postId');
  const blockedPostIds = reportedPosts.map((r: any) => r.postId.toString());

  return { blockedUserIds, blockedPostIds };
}
