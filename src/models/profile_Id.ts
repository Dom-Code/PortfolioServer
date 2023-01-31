import mongoose, { Schema } from 'mongoose';

import ProfileId from '../interfaces/profile_Id';

const ProfileIdSchema: Schema = new Schema(
    {
        profile_id: { type: String, required: true },
        user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    },
    {
        timestamps: true
    }
);

export default mongoose.model<ProfileId>('Profile_Ids', ProfileIdSchema);
