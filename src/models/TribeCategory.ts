import mongoose, { Schema } from 'mongoose';

const TribeCategorySchema = new Schema(
    {
        name: { type: String, default: '' },
        isDeleted: { type: Boolean, default: false },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

const TribeCategory = (mongoose.models.TribeCategory as mongoose.Model<any>) || mongoose.model('TribeCategory', TribeCategorySchema);
export default TribeCategory;