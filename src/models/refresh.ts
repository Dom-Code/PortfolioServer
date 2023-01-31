import mongoose, { Schema } from 'mongoose';
import Refresh from '../interfaces/refresh';

const RefreshSchema: Schema = new Schema(
    {
        token: { type: String, require: true }
    },
    {
        timestamps: true
    }
);

export default mongoose.model<Refresh>('Refresh_Tokens', RefreshSchema);
