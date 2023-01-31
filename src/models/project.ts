import mongoose, { Schema } from 'mongoose';
import Project from '../interfaces/project';

const ProjectSchema: Schema = new Schema(
    {
        name: { type: String, required: true },
        code: { type: String, required: true },
        user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        public: { type: Boolean, required: true },
        read_me: { type: String, required: true }
    },
    {
        timestamps: true
    }
);

export default mongoose.model<Project>('Project', ProjectSchema);
