import express from "express";
import {getProblems,createProblem} from "../controllers/Problem.controllers.js";
import Problem from "../models/Problem.model.js";
const router = express.Router();

router.get("/", getProblems);
router.post("/", createProblem);
router.get("/:id", async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.id);
      if (!problem) return res.status(404).json({ message: "Problem not found" });
      console.log("problem ",problem)
    res.json(problem);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
export default router;
