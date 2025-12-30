import mongoose, { Schema, Types } from 'mongoose';

const FollowSchema = new Schema(
  {
    follower: { type: Types.ObjectId, ref: 'User', required: true },
    following: { type: Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Prevent duplicate follow records (not counting soft-deleted)
FollowSchema.index({ follower: 1, following: 1, isDeleted: 1 }, { unique: true, partialFilterExpression: { isDeleted: false } });

const Follow = (mongoose.models.Follow as mongoose.Model<any>) || mongoose.model('Follow', FollowSchema);
export default Follow;
