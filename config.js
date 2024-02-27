import dotenv from "dotenv";
dotenv.config();

export const ORIGINS = process.env.ORIGINS.split(",");
