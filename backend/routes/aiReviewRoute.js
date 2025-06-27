import express from "express";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

router.post("/ai-review", async (req, res) => {
  const { code, language = "cpp" } = req.body;

  if (!code) return res.status(400).json({ error: "Code is required" });

  const prompt = `
  You are a senior software engineer reviewing the following ${language} code.
  
  Your task is to provide feedback that is **clearly structured into sections** with headings. Your response should have these five sections:
  
  ---
  
  ### ✅ 1. What the Code Does
  Briefly describe what the code is intended to do.
  
  ---
  
  ### ❌ 2. Mistakes or Issues
  List any logical errors, bad practices, or potential bugs found in the code.
  
  ---
  
  ### 💡 3. Suggestions for Improvement
  Suggest improvements related to performance, readability, maintainability, or best practices.
  
  ---
  
  ### 🔁 4. Alternative Approach
  (Optional) Mention a different way to solve the same problem more efficiently or idiomatically.
  
  ---
  
  ### 🔧 5. Improved Version of the Code
  Return a complete, clean, and improved version of the code.
  
  Use markdown formatting where needed. Wrap code in triple backticks with the correct language for syntax highlighting.
  
  ---
  
  Code to Review:
  \`\`\`${language}
  ${code}
  \`\`\`
  `;
  

  try {
    const geminiURL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;

    const geminiResponse = await axios.post(
      geminiURL,
      {
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const reviewText =
      geminiResponse.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No review generated.";

    res.json({ review: reviewText });
  } catch (error) {
    console.error("AI Review Error:", error.response?.data || error.message);

    res.status(500).json({ error: "AI review failed" });
  }
});

export default router;
