import { Account } from "../models/models.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

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
  if (!found) {
    const hashedPassword = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10));
    const newAccount = new Account({
      username_id: req.body.username.toLowerCase(),
      username: req.body.username,
      hashed_password: hashedPassword,
      bio: "",
    });
    if (await newAccount.save()) {
      res.send({ code: 201, message: "Successfully created the account" });
    } else {
      res.send({ code: 500, message: "Error creating the account" });
    }
  } else {
    res.send({ code: 409, message: "Username already exists." });
  }
};
const logIn = async (req, res) => {
  const { username, password } = req.body;
  console.log(`Trying to login username:${username} password:${password}`);
  const found = await Account.findOne({ username_id: username.toLowerCase() });
  if (found) {
    if (bcrypt.compareSync(password, found.hashed_password)) {
      const jwt = generateJWT({ username: found.username, _id: found._id });
      res.cookie("jwt", jwt, { httpOnly: true, secure: true, sameSite: "none" });
      // res.cookie("jwt", jwt, { httpOnly: true, secure: true, path: "/", sameSite: "none" });
      // res.cookie("jwt", jwt, { httpOnly: true, secure: true, path: "/", sameSite: "none", domain: "quizme-m1z0.onrender.com" });
      // res.cookie("jwt", jwt, { httpOnly: true, secure: true }); // if https
      console.log(`Login success username:${username} password:${password}`);
      res.send({ code: 200, message: "Successful login" });
    } else {
      console.log(`Login failed username:${username} password:${password}`);
      res.send({ code: 401, message: "Wrong password" });
    }
  } else {
    console.log(`Login failed username:${username} password:${password}`);
    res.send({ code: 404, message: "Cannot find username" });
  }
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
