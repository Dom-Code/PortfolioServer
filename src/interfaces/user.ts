import { Document } from 'mongoose';

export default interface IUSER extends Document {
    first: string;
    last: string;
    email: string;
    password: string;
}
