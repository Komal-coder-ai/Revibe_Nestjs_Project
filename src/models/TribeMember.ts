import { Schema, model, models, Types } from 'mongoose';

const TribeMemberSchema = new Schema({
    userId: { type: Types.ObjectId, ref: 'User' },
    tribeId: { type: Types.ObjectId, ref: 'Tribe' },
    role: { type: String, enum: ['member', 'admin', 'owner'], default: 'member' },
    joinedAt: { type: Date, default: Date.now },
    isDeleted: { type: Boolean, default: false },
    name: { type: String },
    joinedDate: { type: Date, default: Date.now },
}, {
    timestamps: true,
    indexes: [
        { fields: { userId: 1, tribeId: 1 } }
    ]
});

export default models.TribeMember || model('TribeMember', TribeMemberSchema);
