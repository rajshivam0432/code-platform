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

    // ✅ Plain text constraints
    constraints: [{ type: String }], // e.g., ["1 ≤ n ≤ 10⁹", "Array length ≤ 10⁵"]

    testCases: [testCaseSchema],
  },
  { timestamps: true }
);

export default mongoose.model("Problem", problemSchema);
