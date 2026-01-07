import { Schema, model, models } from 'mongoose';

const StoreSchema = new Schema(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User' },

        name: { type: String, default: '' },
        description: { type: String, default: '' },
        //   enum: ['Retail', 'Wholesale', 'Online'],
        storeType: { type: String, default: '' },
        isActive: { type: Boolean, default: true },
        isDeleted: { type: Boolean, default: false },
        image: {
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
    },
    { timestamps: true }
);


export default models.Store || model('Store', StoreSchema);