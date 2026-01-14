import mongoose, { Schema } from 'mongoose';

const UserSchema = new Schema(
  {
    countryCode: { type: String },
    mobile: { type: String, index: true },
    aadhar: { type: String, default: '', index: true },
    name: { type: String, default: '' },
    aadharName: { type: String, default: '' },
    username: { type: String, default: '' },
    email: { type: String, default: '' },
    bio: { type: String, default: '' },

    profileImage: {
      type: [
        {
          imageUrl: { type: String, default: '' },
          thumbUrl: { type: String, trim: true, default: '' },
          type: { type: String, trim: true, default: '' },
          width: { type: String, trim: true, default: '' },
          height: { type: String, trim: true, default: '' },
          orientation: { type: String, trim: true, default: '' },
          format: { type: String, trim: true, default: '' },
        }
      ],
      default: [],
    },

    coverImage: {
      type: [
        {
          imageUrl: { type: String, default: '' },
          thumbUrl: { type: String, trim: true, default: '' },
          type: { type: String, trim: true, default: '' },
          width: { type: String, trim: true, default: '' },
          height: { type: String, trim: true, default: '' },
          orientation: { type: String, trim: true, default: '' },
          format: { type: String, trim: true, default: '' },
        }
      ],
      default: [],
    },

    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    profileType: { type: String, enum: ['public', 'private'], default: 'public' },
    showActivityStatus: { type: Boolean, default: false },
    status: { type: Number, enum: [0, 1], default: 1 },
    otp: { type: String, default: '' },
    otpExpiresAt: { type: Date, default: null },
    refreshToken: { type: String, default: '' },
    expiresAt: { type: Date, default: null },
    userType: { type: String, enum: ['original', 'demo'], default: 'original' },
    deviceId: { type: String, default: '' },
    shortcode: { type: String, default: '' }, // for profile shortcode URL
    referralCode: { type: String, default: '' },
    referredBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    // Track failed login attempts and lockout time
    failedLoginAttempts: { type: Number, default: 0 },
    lockoutUntil: { type: Date, default: null },
    // ...existing code...
  },
  { timestamps: true }
);

const User = (mongoose.models.User as mongoose.Model<any>) || mongoose.model('User', UserSchema);
export default User;
