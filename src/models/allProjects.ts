import mongoose, { Schema } from 'mongoose';
import AllProjects from '../interfaces/allProjects';

const ProjectSchema: Schema = new Schema(
    {
        name: { type: String, required: true },
        code: { type: String, required: true }
    },
    {
        timestamps: true
    }
);

const AllProjectSchema: Schema = new Schema(
    {
        project_id: { type: String, required: true },
        user_id: { type: String, required: true }
    },
    {
        timestamps: true
    }
);

export default mongoose.model<AllProjects>('AllProjects', AllProjectSchema);
