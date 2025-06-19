import Problem from "../models/Problem.model.js";

export const getProblems = async (req, res) => {
  const problems = await Problem.find({});
  res.json(problems);
};

export const createProblem = async (req, res) => {
  try {
    const problems = req.body; // Expecting an array of problem objects
    if (!Array.isArray(problems)) {
      return res.status(400).json({ error: "Expected an array of problems" });
    }

    const inserted = await Problem.insertMany(problems);
    res
      .status(201)
      .json({
        message: "Problems inserted",
        count: inserted.length,
        data: inserted,
      });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: "Failed to insert problems", details: err.message });
  }
};
export const getProblemById = async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.id);

    if (!problem) return res.status(404).json({ error: "Problem not found" });

    // Extract only non-hidden (visible) test cases
    const visibleTestCases = problem.testCases
      .filter((tc) => !tc.isHidden)
      .slice(0, 3); // Optional: limit to 3 visible cases

    res.status(200).json({
      ...problem.toObject(),
      visibleTestCases,
    });
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }
};


