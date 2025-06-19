import express from "express";
import Problem from "../models/Problem.model.js";
import {getProblemById} from "../controllers/Problem.controllers.js"
const router = express.Router();
//get all question
router.get("/", async (req, res) => {
  try {
    const problems = await Problem.find().select(
      "title description tags difficulty"
    );
    res.json(problems);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//get question by id
router.get("/:id", getProblemById);

//pushing single question
router.post("/", async (req, res) => {
  try {
    const problem = await Problem.create(req.body);
    res.status(201).json({ message: "Problem created", problem });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
//pushing many question 
router.post("/push", async (req, res) => {
  try {
    const { title, description, testCases, difficulty, tags } = req.body;

    // Validate required fields
    if (
      !title ||
      !description ||
      !testCases ||
      !Array.isArray(testCases) ||
      !difficulty ||
      !tags ||
      !Array.isArray(tags)
    ) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const problem = new Problem({
      title,
      description,
      difficulty,
      tags,
      testCases,
    });

    await problem.save();

    return res.status(201).json({ success: true, problem });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ error: "Server error", details: err.message });
  }
});

export default router;




