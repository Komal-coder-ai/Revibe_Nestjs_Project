import mongoose, { Schema } from 'mongoose';


const ReferralSchema = new Schema(
  {
    referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // The user who referred
    referredUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // The user who was referred
    rewardGiven: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Referral = mongoose.models.Referral || mongoose.model('Referral', ReferralSchema);
export default Referral;
