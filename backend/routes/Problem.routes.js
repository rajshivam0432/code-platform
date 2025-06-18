import express from "express";
import Problem from "../models/Problem.model.js";

const router = express.Router();

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

router.get("/:id", async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.id);
    res.json(problem);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// Already has GET / and GET /:id

router.post("/", async (req, res) => {
  try {
    const problem = await Problem.create(req.body);
    res.status(201).json({ message: "Problem created", problem });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


export default router;
