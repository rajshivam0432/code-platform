import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.model.js";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "secretkey"; 

// Register
router.post("/signup", async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ msg: "Email already used" });

    const hashed = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password: hashed });
    await newUser.save();

    const token = jwt.sign({ id: newUser._id }, JWT_SECRET);
    res.status(201).json({ token, user: { id: newUser._id, username, email } });
  } catch (err) {
    res.status(500).json({ msg: "Signup failed" });
  }
});

// Login
router.post("/signin", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ msg: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, JWT_SECRET);
    res.json({ token, user: { id: user._id, username: user.username, email } });
  } catch (err) {
    res.status(500).json({ msg: "Signin failed" });
  }
});

export default router;
