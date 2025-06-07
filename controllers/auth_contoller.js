import { Account } from "../models/models.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { GOOGLE_CLIENT_ID, JWT_SECRET } from "../config.js";
import { OAuth2Client } from "google-auth-library";

const client = new OAuth2Client(GOOGLE_CLIENT_ID);
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
    username: req.body.username,
    hashedPassword: hashedPassword,
    bio: "",
  });
  if (await newAccount.save()) res.status(201).json({ message: "Successfully created the account" });
  else res.status(500).json({ message: "Error creating the account" });
};

const logIn = async (req, res) => {
  const { username, password } = req.body;
  const found = await Account.findOne({ username: username.toLowerCase() });
  if (!found || !bcrypt.compareSync(password, found.hashedPassword)) return res.status(401).json({ message: "Incorrect credentials" });
  const jwt = generateJWT({ username: found.username, _id: found._id });
  res.cookie("jwt", jwt, { httpOnly: true, secure: true, sameSite: "none" });
  res.status(200).json({ message: "Successful login", userId: found._id });
};

const googleLogIn = async (req, res) => {
  const { accessToken } = req.body;
  if (!accessToken) return res.status(400).json({ error: "Access token required" });
  try {
    const response = await fetch("https://www.googleapis.com/oauth2/v1/userinfo?alt=json", { headers: { Authorization: `Bearer ${accessToken}` } });
    if (!response.ok) return res.status(401).json({ error: "Invalid access token", details: await response.json() });
    const { email, name, picture, verified_email } = await response.json();
    if (!email || !name) return res.status(400).json({ error: "Incomplete user data" });

    let user = await Account.findOne({ googleEmail: email, isOauth: true });
    if (!user) {
      try {
        user = new Account({ username: name, googleEmail: email, isOauth: true });
        await user.save();
      } catch (error) {
        if (error.code != 11000 || !error.keyPattern.username) throw error;
        const modifiedUsername = `${name}${Math.floor(Math.random() * 100)}`;
        user = new Account({ username: modifiedUsername, googleEmail: email, isOauth: true });
        await user.save();
      }
    }
    const jwt = generateJWT({ username: user.username, _id: user._id });
    res.cookie("jwt", jwt, { httpOnly: true, secure: true, sameSite: "none" });
    res.status(200).json({ message: "Successful login", userId: user._id });
  } catch (err) {
    console.error("Error fetching user info:", err.message);
    return res.status(500).json({ error: "Server error." });
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

export { createAcc, logIn, googleLogIn, logOut, isLoggedIn, getUsername, verifyJWT };
