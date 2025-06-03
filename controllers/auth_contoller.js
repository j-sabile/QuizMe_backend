import { Account } from "../models/models.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config.js";

const generateJWT = (payload) => jwt.sign(payload, JWT_SECRET, { expiresIn: "4h" });

// middleware to verify JWT
const verifyJWT = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return false;
  }
};

const createAcc = async (req, res) => {
  const found = await Account.findOne({ username_id: req.body.username.toLowerCase() });
  if (found) return res.status(409).json({ message: "Username already exists." });
  const hashedPassword = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10));
  const newAccount = new Account({
    username_id: req.body.username.toLowerCase(),
    username: req.body.username,
    hashed_password: hashedPassword,
    bio: "",
  });
  if (await newAccount.save()) res.status(201).json({ message: "Successfully created the account" });
  else res.status(500).json({ message: "Error creating the account" });
};

const logIn = async (req, res) => {
  const { username, password } = req.body;
  const found = await Account.findOne({ username_id: username.toLowerCase() });
  if (!found || !bcrypt.compareSync(password, found.hashed_password)) return res.status(401).json({ message: "Incorrect credentials" });
  const jwt = generateJWT({ username: found.username, _id: found._id });
  res.cookie("jwt", jwt, { httpOnly: true, secure: true, sameSite: "none" });
  res.status(200).json({ message: "Successful login" });
};
const logOut = async (req, res) => {
  res.clearCookie("jwt", { sameSite: "none", secure: true });
  res.send("Successfully logout");
};

const isLoggedIn = async (req, res) => {
  res.send(verifyJWT(req.cookies.jwt) ? true : false);
};

const getUsername = (req, res) => {
  const payload = verifyJWT(req.cookies.jwt);
  payload ? res.send(payload.username) : res.send(false);
};

export { createAcc, logIn, logOut, isLoggedIn, getUsername, verifyJWT };
