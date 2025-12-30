import { Schema, model, models, Types } from 'mongoose';

const BlockedUserSchema = new Schema({
  blockerId: { type: Types.ObjectId, ref: 'User', required: true },
  blockedId: { type: Types.ObjectId, ref: 'User', required: true },
  blockedAt: { type: Date, default: Date.now }
});

const BlockedUser = models.BlockedUser || model('BlockedUser', BlockedUserSchema);
export default BlockedUser;