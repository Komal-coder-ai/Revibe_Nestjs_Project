import mongoose, { Schema, model, models } from 'mongoose';

const StoreViewSchema = new Schema(
    {
        storeId: { type: Schema.Types.ObjectId, ref: 'Store' },
        userId: { type: Schema.Types.ObjectId, ref: 'User', }
    },
    { timestamps: true }
);

// Ensure one view per user per store
StoreViewSchema.index({ storeId: 1, userId: 1 });


const StoreView = (mongoose.models.StoreView as mongoose.Model<any>) || model('StoreView', StoreViewSchema);

export default StoreView;