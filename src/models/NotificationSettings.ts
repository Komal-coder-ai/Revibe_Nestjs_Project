import mongoose, { Schema } from 'mongoose';

const NotificationSettingsSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    pauseAll: { type: Boolean, default: false },
    postLikes: { type: Boolean, default: true },
    comments: { type: Boolean, default: true },
    newFollowers: { type: Boolean, default: true },
    directMessages: { type: Boolean, default: true },
    email: { type: Boolean, default: false },
    sms: { type: Boolean, default: false }
}, { timestamps: true });

const NotificationSettings = mongoose.models.NotificationSettings || mongoose.model('NotificationSettings', NotificationSettingsSchema);
export default NotificationSettings;
