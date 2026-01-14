import mongoose, { Schema } from 'mongoose';

const VoteSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    post: { type: Schema.Types.ObjectId, ref: 'Post' },
    // For poll and quiz, optionIndex is the selected option
    optionIndex: { type: Number },
    // For quiz: whether the answer was correct (optional, only for quiz type)
    isCorrect: { type: Boolean },
    // Type of vote: 'poll' or 'quiz'
    type: { type: String, enum: ['poll', 'quiz'] },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// No unique index; handle double voting in API logic

const Vote = (mongoose.models.Vote as mongoose.Model<any>) || mongoose.model('Vote', VoteSchema);
export default Vote;
