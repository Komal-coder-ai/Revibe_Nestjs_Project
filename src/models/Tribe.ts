import { Schema, model, models, Types } from 'mongoose';

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
  tribeName: { type: String, default: '' },
  description: { type: String, default: '' },
  category: { type: Types.ObjectId, ref: 'TribeCategory' },
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
  owner: { type: Types.ObjectId, ref: 'User', },
  isPublic: { type: Boolean, default: true },
  isOfficial: { type: Boolean, default: false },
  isDeleted: { type: Boolean, default: false },
  deletedBy: { type: Types.ObjectId, ref: 'User' },
}, {
  timestamps: true,
});

export default models.Tribe || model('Tribe', TribeSchema);
