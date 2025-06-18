import Problem from "../models/Problem.model.js";
import { runCppCode } from "../services/runCppCode.js";

export const submitCode = async (req, res) => {
  const { code, language, problemId } = req.body;

  try {
    const problem = await Problem.findById(problemId);
    if (!problem) return res.status(404).json({ error: "Problem not found" });

    const results = [];
    let passedCount = 0;

    for (let i = 0; i < problem.testCases.length; i++) {
      const { input, expectedOutput, isHidden } = problem.testCases[i];
      const { output, error } = await runCppCode(code, input);

      const passed = output.trim() === expectedOutput.trim();
      if (passed) passedCount++;

      // Only include non-hidden test cases in results
      if (!isHidden) {
        results.push({
          input,
          expectedOutput,
          actualOutput: output,
          passed,
          error,
        });
      }
    }

    const total = problem.testCases.length;
    const scorePercent = Math.round((passedCount / total) * 100);

    res.json({
      success: true,
      scorePercent,
      results, // Only includes visible test cases
    });
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }
};
