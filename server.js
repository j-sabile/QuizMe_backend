import express from "express";
import cors from "cors";
import router from "./router.js";
import cookieParser from "cookie-parser";
import { ORIGINS } from "./config.js";
import authRouter from "./routers/auth.js";

const app = express();

app.use(cors({ origin: ORIGINS, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

router(app);

app.use("/auth", authRouter);

const port = 5000;
app.listen(port, () => {
  console.log(`Listening to port: ${port}`);
});
