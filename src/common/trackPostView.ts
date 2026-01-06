// common/trackPostView.ts
// Instagram-like post view logic: only count a view if not viewed in the last hour

import PostView from '@/models/PostView';

/**
 * Tracks a post view for a user, only if not viewed in the last hour.
 * @param userId - The user's ID
 * @param postId - The post's ID
 */
export async function trackPostView(userId: string, postId: string) {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const existingView = await PostView.findOne({ userId, postId, updatedAt: { $gte: oneHourAgo } });
  if (!existingView) {
    await PostView.findOneAndUpdate(
      { userId, postId },
      { $set: { viewedAt: new Date() } },
      { upsert: true, new: true }
    );
  }
}
