// models/Problem.js
import mongoose from "mongoose";

const testcaseSchema = new mongoose.Schema({
  input: String, // stdin
  expected_output: String, // correct output
});

const problemSchema = new mongoose.Schema({
  title: String,
  description: String,
  difficulty: String,
  tags: [String],
  testcases: [testcaseSchema],
});

const Problem = mongoose.model("Problem", problemSchema);
export default Problem;
