import mongoose, { Schema } from 'mongoose';

const HashtagSchema = new Schema(
  {
    tag: { type: String, unique: true, index: true, required: true },
    count: { type: Number, default: 1 }, // Number of posts using this hashtag
  },
  { timestamps: true }
);

const Hashtag = (mongoose.models.Hashtag as mongoose.Model<any>) || mongoose.model('Hashtag', HashtagSchema);
export default Hashtag;
