import mongoose, { Schema, Document } from 'mongoose';

export interface IFeed extends Document {
  title: string;
  description: string;
  status: number; // 1 for active, 0 for inactive
  createdAt: Date;
  updatedAt: Date;
}

const FeedSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    status: { type: Number, enum: [0, 1], default: 1 },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

const Feed = mongoose.models.Feed || mongoose.model<IFeed>('Feed', FeedSchema);
export default Feed;