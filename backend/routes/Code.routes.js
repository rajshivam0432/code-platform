import express from "express";
import axios  from "axios";
const router = express.Router();

const JUDGE0_URL = "https://judge0-ce.p.rapidapi.com/submissions";
const RAPIDAPI_KEY = "59632a26f3mshd122c3a63a6765ap1ad3d5jsnb94c2cf89afb";

router.post("/run", async (req, res) => {
  const { code, language_id } = req.body;

  try {
    // Step 1: Create a submission
    const submissionRes = await axios.post(
      JUDGE0_URL,
      {
        source_code: code,
        language_id, // e.g., 63 = JavaScript
      },
      {
        headers: {
          "content-type": "application/json",
          "x-rapidapi-host": "judge0-ce.p.rapidapi.com",
          "x-rapidapi-key": RAPIDAPI_KEY,
        },
      }
    );

    const token = submissionRes.data.token;

    // Step 2: Poll the result
    const fetchResult = async () => {
      const result = await axios.get(`${JUDGE0_URL}/${token}`, {
        headers: {
          "x-rapidapi-key": RAPIDAPI_KEY,
        },
      });

      if (result.data.status.id <= 2) {
        setTimeout(fetchResult, 1000);
      } else {
        res.json(result.data);
      }
    };

    fetchResult();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Code execution failed." });
  }
});

export default router;
