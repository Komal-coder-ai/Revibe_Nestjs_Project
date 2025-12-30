import mongoose, { Schema } from 'mongoose';

const AdminSchema = new Schema(
  {
    name: { type: String, default: '' },
    email: { type: String, default: '' },
    password: { type: String, default: '' },
    countryCode: { type: String, default: '' },
    mobile: { type: String, default: '' },
    role: { type: String, default: 'admin' },
    isActive: { type: Boolean, default: true },
    otp: { type: String, default: '' },
    refreshToken: { type: String, default: '' }
  },
  { timestamps: true }
);

const Admin = (mongoose.models.Admin as mongoose.Model<any>) || mongoose.model('Admin', AdminSchema);
export default Admin;
