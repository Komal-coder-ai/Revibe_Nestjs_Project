import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IComment extends Document {
  postId: Types.ObjectId;
  userId: Types.ObjectId;
  content: string;
  mentions: Types.ObjectId[];
  parentId?: Types.ObjectId | null;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema = new Schema<IComment>({
  postId: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  mentions: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  parentId: { type: Schema.Types.ObjectId, ref: 'Comment', default: null },
  isDeleted: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.models.Comment || mongoose.model<IComment>('Comment', CommentSchema);
