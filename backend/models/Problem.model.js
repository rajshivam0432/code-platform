import mongoose from "mongoose";

const testCaseSchema = new mongoose.Schema({
  input: { type: String, required: true },
  expectedOutput: { type: String, required: true },
  isHidden: { type: Boolean, default: false },
});

const problemSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    difficulty: {
      type: String,
      required: true,
      enum: ["Easy", "Medium", "Hard"],
    },
    tags: [{ type: String }],
    testCases: [testCaseSchema],
  },
  { timestamps: true }
);

export default mongoose.model("Problem", problemSchema);
