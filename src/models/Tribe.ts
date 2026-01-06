import { Schema, model, Types } from 'mongoose';

const TribeSchema = new Schema({
  icon: {
    imageUrl: { type: String, required: true },
    thumbUrl: { type: String },
    type: { type: String },
    width: { type: String },
    height: { type: String },
    orientation: { type: String },
    format: { type: String },
  },
  tribeName: { type: String, required: true, },
  description: { type: String, default: '' },
  category: { type: String, required: true },
  bannerImage: {
    imageUrl: { type: String },
    thumbUrl: { type: String },
    type: { type: String },
    width: { type: String },
    height: { type: String },
    orientation: { type: String },
    format: { type: String },
  },
  rules: { type: String, default: '' },
  owner: { type: Types.ObjectId, ref: 'User',},
  admins: [{ type: Types.ObjectId, ref: 'User' }],
  followers: [{ type: Types.ObjectId, ref: 'User' }],
  isPublic: { type: Boolean, default: true },
}, {
  timestamps: true,
});

export default model('Tribe', TribeSchema);
