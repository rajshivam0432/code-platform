import express from "express";
import Problem from "../models/Problem.model.js";
import {getProblemById} from "../controllers/Problem.controllers.js"
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

router.get("/:id", getProblemById);


router.post("/", async (req, res) => {
  try {
    const problem = await Problem.create(req.body);
    res.status(201).json({ message: "Problem created", problem });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


export default router;
