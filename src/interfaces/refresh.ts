import { Document } from 'mongoose';

export default interface Refresh extends Document {
    refresh_token: string;
}
