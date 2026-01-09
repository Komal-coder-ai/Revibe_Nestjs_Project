import { Schema, model, models, Types } from 'mongoose';

const TribeSchema = new Schema({
  icon: {
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
  tribeName: { type: String, default: '' },
  description: { type: String, default: '' },
  category: { type: Types.ObjectId, ref: 'TribeCategory' },
  bannerImage: {
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
