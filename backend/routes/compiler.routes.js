import express from "express";
import { sendToCompiler } from "../service/compilerService.js";

const router = express.Router();

router.post("/compile", async (req, res) => {
  console.log("CODE TYPE:", typeof code);
  console.log("LANGUAGE TYPE:", typeof language);
  const { code, language } = req.body;

  if (!code || !language) {
    return res.status(400).json({ error: "Code and language are required." });
  }

  try {
    const result = await sendToCompiler(code, language);
    res.json(result);
  } catch (err) {
    console.error("Compiler servie error:", err.message);
    res.status(500).json({
      error: err.message || "Internal Server Error",
    });
  }
});

export default router;
