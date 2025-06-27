import Problem from "../models/Problem.model.js";
import { sendToCompiler } from "../service/compilerService.js";

export const submitCode = async (req, res) => {
  const { code,  problemId, isSubmit = false } = req.body;

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

      if (!isSubmit && isHidden) continue;

      const { output, error } = await sendToCompiler(code, input);
      const trimmedOutput = output.trim();
      const trimmedExpected = expectedOutput.trim();
      const passed = trimmedOutput === trimmedExpected;

      if (passed) passedCount++;
      totalEvaluated++;

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
      results, 
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: "Server error",
      details: err.message,
    });
  }
};
export const submitCustomCode = async (req, res) => {
  const { code, problemId, input } = req.body;

  if (!code || !input || !problemId) {
    return res.status(400).json({ error: "Missing code, input or problemId" });
  }

  try {
    const problem = await Problem.findById(problemId);
    if (!problem) {
      return res.status(404).json({ error: "Problem not found" });
    }

    // Send code and input to the compiler
    const { output, error } = await sendToCompiler(code, input);

    return res.status(200).json({
      success: true,
      input,
      output: output?.trim(),
      error,
    });
  } catch (err) {
    console.error("Custom code execution error:", err);
    return res.status(500).json({
      success: false,
      error: "Server error",
      details: err.message,
    });
  }
};

