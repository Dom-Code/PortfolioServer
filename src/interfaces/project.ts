import { Document } from 'mongoose';
import { ObjectId } from 'mongoose';

export default interface Project extends Document {
    name: string;
    code: string;
    user_id: ObjectId;
    public: boolean;
    read_me: string;
}
