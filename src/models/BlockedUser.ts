import { Schema, model, models, Types } from 'mongoose';

const BlockedUserSchema = new Schema({
  blockerId: { type: Types.ObjectId, ref: 'User'},
  blockedId: { type: Types.ObjectId, ref: 'User'},
  blockedAt: { type: Date, default: Date.now },
  isDeleted: { type: Boolean, default: false },
}, {
  timestamps: true,
});

const BlockedUser = models.BlockedUser || model('BlockedUser', BlockedUserSchema);
export default BlockedUser;