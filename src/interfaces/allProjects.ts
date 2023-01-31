import { Document } from 'mongoose';

export default interface AllProjects extends Document {
    project_id: string;
    user_id: string;
}
