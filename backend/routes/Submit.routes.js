// routes/submit.js
import express from "express";
import axios from "axios";
import Problem from "../models/Problem.model.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const { problemId, source_code, language_id } = req.body;

  try {
    const problem = await Problem.findById(problemId);
    if (!problem) return res.status(404).json({ error: "Problem not found" });

    const results = await Promise.all(
      problem.testcases.map(async (tc) => {
        try {
          const response = await axios.post(
            "https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=false&wait=true",
            {
              source_code,
              language_id,
              stdin: tc.input,
              expected_output: tc.expected_output,
            },
            {
              headers: {
                "content-type": "application/json",
                "x-rapidapi-host": "judge0-ce.p.rapidapi.com",
                "x-rapidapi-key":
                  "6791d1718amshf31fd9ed92b299ap101760jsn491cf518db96",
              },
            }
          );

          const { stdout, status } = response.data;
          return {
            input: tc.input,
            expected: tc.expected_output,
            received: stdout?.trim() || "",
            status: status.description,
            passed: stdout?.trim() === tc.expected_output?.trim(),
          };
        } catch (innerErr) {
          return {
            input: tc.input,
            expected: tc.expected_output,
            received: null,
            status: "Judge Error",
            passed: false,
            error: innerErr.message,
          };
        }
      })
    );

    const wrong_testcases = results.filter((r) => !r.passed);

    res.json({
      allResults: results,
      wrong_testcases,
    });
  } catch (err) {
    console.error("❌ Submission error:", err.message);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

export default router;
