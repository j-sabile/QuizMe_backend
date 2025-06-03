import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";

const router = express.Router();

router.get("/status", isAuthenticated, (_, res) => res.sendStatus(200));

export default router;
