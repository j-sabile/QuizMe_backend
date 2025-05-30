import dotenv from "dotenv";
dotenv.config();

export const ORIGINS = process.env.ORIGINS.split(",");
export const MONGODB_URI = process.env.MONGODB_URI;
export const JWT_SECRET = process.env.JWT_SECRET;
export const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
export const AWANLLM_API_KEY = process.env.AWANLLM_API_KEY;