import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config.js";

const isAuthenticated = (req, res, next) => {
  const userJwt = req.cookies.jwt;
  if (!userJwt) return res.status(403).json({ message: "Not logged in" });
  try {
    const payload = jwt.verify(userJwt, JWT_SECRET);
    req.userId = payload._id;
    next();
  } catch (error) {
    res.status(403).json({ message: "Not logged in" });
  }
};

export default isAuthenticated;
