import mongoose, { Schema } from 'mongoose';

const LikeSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    targetId: { type: Schema.Types.ObjectId, required: true, index: true }, // post or comment
    targetType: { type: String, enum: ['post', 'comment'], required: true },
    isDeleted: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

LikeSchema.index({ user: 1, targetId: 1, targetType: 1 }, { unique: true }); // Prevent duplicate likes

export default mongoose.models.Like || mongoose.model('Like', LikeSchema);
