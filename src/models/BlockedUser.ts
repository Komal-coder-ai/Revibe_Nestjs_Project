import { Schema, model, Types } from 'mongoose';

const BlockedUserSchema = new Schema({
  blockerId: { type: Types.ObjectId, ref: 'User', required: true },
  blockedId: { type: Types.ObjectId, ref: 'User', required: true },
  blockedAt: { type: Date, default: Date.now }
});

export default model('BlockedUser', BlockedUserSchema);