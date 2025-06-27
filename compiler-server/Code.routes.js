// routes/Code.routes.js
import express from "express";
import { runCppCode } from "./Services/runCppCode.js";

const router = express.Router();

router.post("/run", async (req, res) => {
  const { code, input = "" } = req.body;
  console.log("compiler-server",req.body.input)

  if (!code) {
    return res.status(400).json({ error: "Code is required" });
  }

  try {
    console.log("Compiler Input:", input);
    const result = await runCppCode(code, input);
    res.json(result);
  } catch (err) {
    console.error("Compiler service error:", err);

    res.status(500).json({
      error:
        typeof err === "string"
          ? err
          : err.message || "Something went wrong during code execution",
    });
  }
});

export default router;
