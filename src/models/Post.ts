import mongoose, { Schema } from 'mongoose';

const PostSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    tribe: { type: Schema.Types.ObjectId, ref: 'Tribe', default: null },
    type: {
      type: String,
      enum: ['image', 'video', 'text', 'carousel', 'poll', 'quiz', 'reel'],
    },
    // Poll options (for poll and quiz types)
    options: [
      {
        text: { type: String },
        _id: false
      }
    ],
    // For quiz: index of correct answer (optional, for easier access)
    correctOption: { type: Number },
    postType: { type: Number },
    shortcode: { type: String, default: '' },
    // ...existing code...  
    media: [
      {
        imageUrl: { type: String, default: '' },
        thumbUrl: { type: String, trim: true, default: '' },
        type: { type: String, trim: true, default: '' },
        width: { type: String, trim: true, default: '' },
        height: { type: String, trim: true, default: '' },
        orientation: { type: String, trim: true, default: '' },
        format: { type: String, trim: true, default: '' },
        // _id: false // keep _id for media if you want to reference/delete individually
      }
    ],
    isActive: { type: Boolean, default: true },
    text: { type: String, default: '' },
    caption: { type: String, default: '' },
    location: { type: String, default: '' },
    hashtags: [{ type: String, index: true }],
    taggedUsers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    isDeleted: { type: Boolean, default: false },

  },
  { timestamps: true }
);

const Post = (mongoose.models.Post as mongoose.Model<any>) || mongoose.model('Post', PostSchema);
export default Post;
