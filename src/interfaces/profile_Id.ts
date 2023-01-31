import { Document } from 'mongoose';
import { ObjectId } from 'mongoose';

export default interface ProfileId extends Document {
    profile_id: string;
    user_id: ObjectId;
}
