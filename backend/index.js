import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./db/db.js";

// Route Imports
import problemRoutes from "./routes/Problem.routes.js";
import codeRoutes from "./routes/Code.routes.js"; // Executes raw code (Monaco)
import submitRouter from "./routes/Submit.routes.js"; // Handles test case submission
import authRoutes from "./routes/Auth.routes.js"; // Optional if you're doing auth

dotenv.config();
const app = express();

// ✅ CORS Configuration
const allowedOrigins = [
  "https://bytebattle-platform.vercel.app",
  "http://localhost:5173",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// ✅ Built-in body parser middleware
app.use(express.json());

// ✅ Connect to MongoDB
connectDB();

// ✅ Health check
app.get("/", (req, res) => {
  res.send("🚀 API is running successfully!");
});

// ✅ Route Mapping
app.use("/api/problems", problemRoutes);
app.use("/api/code", codeRoutes); // Raw execution (Monaco playground)
app.use("/api/submit", submitRouter); // Handles test cases
app.use("/api/auth", authRoutes); // Optional: login/register/etc

// ✅ Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);
