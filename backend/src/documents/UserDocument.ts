export interface UserDocument extends Document {
    username: string;
    email: string;
    password: string;
}