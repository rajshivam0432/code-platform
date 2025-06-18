// routes/Code.routes.js
import express from "express";
import { executeCppCode } from "../executeCode.js";

const router = express.Router();

router.post("/run", async (req, res) => {
  const { code } = req.body;

  if (!code) {
    return res.status(400).json({ error: "Code is required" });
  }

  try {
    const result = await executeCppCode(code);
    res.json(result);
  } catch (err) {
    res.status(500).json(err);
  }
});

export default router;
