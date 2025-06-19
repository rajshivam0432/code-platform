// routes/Code.routes.js
import express from "express";
import { runCppCode } from "../Services/runCppCode.js";

const router = express.Router();

router.post("/run", async (req, res) => {
  const { code } = req.body;

  if (!code) {
    return res.status(400).json({ error: "Code is required" });
  }

  try {
    const result = await runCppCode(code);
    res.json(result);
  } catch (err) {
    res.status(500).json(err);
  }
});

export default router;
