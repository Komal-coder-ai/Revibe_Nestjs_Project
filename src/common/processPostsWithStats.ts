import { getFollowStatusMap } from '@/common/getFollowStatusMap';
import Vote from '@/models/Vote';

// Helper to add computed fields to posts (used for both feed, list, detail, etc.)
export async function processPostsWithStats(posts: any[], userId?: string) {
  const postIds = posts.map((p: any) => p._id || p.postId).filter(Boolean);
  const [
    votes,
    commentCountsArr,
    Like,
    Follow,
    Share,
    // userVotesArr
  ] = await Promise.all([
    (await import('@/models/Vote')).default.find({ post: { $in: postIds } }),
    (await import('@/models/Comment')).default.aggregate([
      { $match: { postId: { $in: postIds }, isDeleted: false } },
      { $group: { _id: '$postId', count: { $sum: 1 } } }
    ]),
    (await import('@/models/Like')).default,
    (await import('@/models/Follow')).default,
    (await import('@/models/Share')).default,
    // (await import('@/models/Vote')).default.find({ post: { $in: postIds }, user: userId })
  ]);
  let userVotesArr: { post: any, optionIndex: number }[] = [];
  if (userId) {
    const votes = await Vote.find({ post: { $in: postIds }, user: userId }).select('post optionIndex').lean();
    userVotesArr = votes.map((v: any) => ({ post: v.post, optionIndex: v.optionIndex }));
  }
  // Map of user's vote option for poll/quiz posts
  const userVotesMap: Record<string, number> = {};
  userVotesArr.forEach((v: any) => {
    if (v && v.post) {
      userVotesMap[v.post.toString()] = v.optionIndex;
    }
  });

  const commentCounts: Record<string, number> = {};
  commentCountsArr.forEach((c: any) => {
    if (c && c._id) {
      commentCounts[c._id.toString()] = c.count;
    }
  });

  // Like counts and userLike
  const likeCountsArr = await Like.aggregate([
    { $match: { targetId: { $in: postIds }, targetType: 'post', isDeleted: false } },
    { $group: { _id: '$targetId', count: { $sum: 1 } } }
  ]);

  const likeResults: Record<string, { likeCount: number, userLike: boolean }> = {};
  likeCountsArr.forEach((l: any) => {
    if (l && l._id) {
      likeResults[l._id.toString()] = { likeCount: l.count, userLike: false };
    }
  });

  let userLikesArr: any[] = [];
  if (userId) {
    userLikesArr = await Like.find(
      {
        targetId:
          { $in: postIds },
        targetType: 'post',
        user: userId,
        isDeleted: false
      }).select('targetId');
    userLikesArr.forEach((ul: any) => {
      if (ul && ul.targetId) {
        const postIdStr = ul.targetId.toString();
        if (likeResults[postIdStr]) {
          likeResults[postIdStr].userLike = true;
        } else {
          likeResults[postIdStr] = { likeCount: 0, userLike: true };
        }
      }
    });
    // console.log('Like Results arr:', userLikesArr);

  }
  // Followers count for all post users
  const userIds = posts.map((p: any) => p.user?._id).filter(Boolean);
  const followersArr = await Follow.aggregate([
    { $match: { following: { $in: userIds }, status: 'accepted', isDeleted: false } },
    { $group: { _id: '$following', count: { $sum: 1 } } }
  ]);
  const followersCountMap: Record<string, number> = {};
  followersArr.forEach((f: any) => {
    if (f && f._id) {
      followersCountMap[f._id.toString()] = f.count;
    }
  });

  // Share counts
  const shareCountsArr = await Share.aggregate([
    { $match: { postId: { $in: postIds }, type: "inAppShare" } },
    { $group: { _id: '$postId', count: { $sum: 1 } } }
  ]);
  const shareCounts: Record<string, number> = {};
  shareCountsArr.forEach((s: any) => {
    if (s && s._id) {
      shareCounts[s._id.toString()] = s.count;
    }
  });

  // Follow/friend status for each post's user
  const postUserIds = posts.map((p: any) => p.user && p.user._id ? p.user._id.toString() : '').filter(Boolean);

  let followStatusMap: Record<string, number> = {};

  if (userId) {
    followStatusMap = await getFollowStatusMap(userId, postUserIds);
  } else {
    // User is guest → assign 0 for all post user IDs
    followStatusMap = postUserIds.reduce((acc, id) => {
      if (id) acc[id] = 0;
      return acc;
    }, {} as Record<string, number>);
  }

  // console.log("followStatusMap", followStatusMap);


  return posts.map((post: any) => {
    const _id = post._id || post.postId;
    let basePost = { ...post, postId: _id };
    // Add commentCount, likeCount, shareCount
    const commentCount = commentCounts[_id.toString()] || 0;
    const likeCount = likeResults[_id.toString()]?.likeCount || 0;
    const shareCount = shareCounts[_id.toString()] || 0;
    // Add followersCount to user
    if (basePost.user && basePost.user._id) {
      basePost.user.followersCount = followersCountMap[basePost.user._id ? basePost.user._id.toString() : ''] || 0;
    }
    // Add userLike status for the current user
    const userLike = likeResults[_id && _id.toString() ? _id.toString() : '']?.userLike || false;
    // Add isLoggedInUser flag
    const isLoggedInUser = basePost.user && basePost.user._id && basePost.user._id.toString() === (userId ? userId.toString() : '');
    // Add follow/friend status code
    const followStatusCode = basePost.user && basePost.user._id ? followStatusMap[basePost.user._id ? basePost.user._id.toString() : ''] ?? 0 : 0;
    if ((post.type === 'poll' || post.type === 'quiz') && Array.isArray(post.options)) {
      const postVotes = votes.filter((v: any) => v.post && _id && v.post.toString() === _id.toString());
      const totalVotes = postVotes.length;
      const optionCounts: Record<number, number> = {};
      postVotes.forEach((v: any) => {
        optionCounts[v.optionIndex] = (optionCounts[v.optionIndex] || 0) + 1;
      });
      const pollResults = post.options.map((opt: any, idx: number) => ({
        optionIndex: idx,
        text: opt.text,
        count: typeof optionCounts[idx] === 'number' ? optionCounts[idx] : 0,
        percent: totalVotes > 0 && typeof optionCounts[idx] === 'number'
          ? Math.round((optionCounts[idx] / totalVotes) * 100)
          : 0
      }));
      // Add userVoted and userVoteOption
      const voteOption = userVotesMap[_id && _id.toString() ? _id.toString() : ''];
      const userVoted = voteOption !== undefined && voteOption !== null;
      const userVoteOption = userVoted ? voteOption : null;
      return { ...basePost, totalVotes, options: pollResults, commentCount, likeCount, shareCount, userLike, isLoggedInUser, followStatusCode, userVoted, userVoteOption };
    }
    // For non-poll/quiz posts, always include userVoted and userVoteOption as false/null
    return { ...basePost, commentCount, likeCount, shareCount, userLike, isLoggedInUser, followStatusCode, userVoted: false, userVoteOption: null };
  });
}
