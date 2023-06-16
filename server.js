import express from "express";
import cors from "cors";
import router from "./router.js";
import cookieParser from "cookie-parser";

const app = express();

app.use(cors({ origin: ["https://quizmeee.onrender.com", "http://localhost:3000"], credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

router(app);

const port = 5000;
app.listen(port, () => {
  console.log(`Listening to port: ${port}`);
});
