import Problem from "../models/Problem.model.js";
import { runCppCode } from "../Services/runCppCode.js";

export const submitCode = async (req, res) => {
  const { code, language, problemId, isSubmit = false } = req.body;

  try {
    const problem = await Problem.findById(problemId);
    if (!problem) {
      return res.status(404).json({ error: "Problem not found" });
    }

    const results = [];
    let passedCount = 0;
    let totalEvaluated = 0;

    for (const testCase of problem.testCases) {
      const { input, expectedOutput, isHidden } = testCase;

      // Skip hidden cases if it's just a "Run"
      if (!isSubmit && isHidden) continue;

      const { output, error } = await runCppCode(code, input);
      const trimmedOutput = output.trim();
      const trimmedExpected = expectedOutput.trim();
      const passed = trimmedOutput === trimmedExpected;

      if (passed) passedCount++;
      totalEvaluated++;

      // Show result only for non-hidden cases
      if (!isHidden) {
        results.push({
          input,
          expectedOutput: trimmedExpected,
          actualOutput: trimmedOutput,
          passed,
          error,
        });
      }
    }

    const scorePercent = totalEvaluated
      ? Math.round((passedCount / totalEvaluated) * 100)
      : 0;

    return res.status(200).json({
      success: true,
      scorePercent,
      results, // only public test case results
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: "Server error",
      details: err.message,
    });
  }
};
