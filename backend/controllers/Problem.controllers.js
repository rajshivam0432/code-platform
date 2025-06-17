import Problem from "../models/Problem.model.js";

export const getProblems = async (req, res) => {
  const problems = await Problem.find({});
  res.json(problems);
};

export const createProblem = async (req, res) => {
  try {
    const { title, description, difficulty, tags, testcases } = req.body;

    const problem = new Problem({
      title,
      description,
      difficulty,
      tags,
      testcases, // ✅ include this!
    });

    await problem.save();
    res.status(201).json(problem);
  } catch (err) {
    console.error("Error creating problem:", err);
    res.status(500).json({ error: "Failed to create problem" });
  }
};

