export const PORT = process.env.PORT || 3000;
export const MONGO_URI: string = process.env.MONGO_URI || "mongodb://localhost:27017/todo_list";
export const ACCESS_TOKEN_KEY = process.env.ACCESS_TOKEN_KEY || 'abcdefghijklmnopqrstuvwxyz';
export const REFRESH_TOKEN_KEY = process.env.REFRESH_TOKEN_KEY || 'abcdefghijklmnopqrstuvwxyz';
export const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";