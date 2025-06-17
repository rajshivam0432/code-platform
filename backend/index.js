import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./db/db.js";
import problemRoutes from "./routes/Problem.routes.js";
import codeRoutes from "./routes/Code.routes.js";
import submitRouter from "./routes/Submit.routes.js";
import authRoutes from "./routes/Auth.routes.js";

dotenv.config();
const app = express();

// ✅ CORS configuration
app.use(
  cors({
    origin: "https://bytebattle-platform.vercel.app",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);
app.get("/", (req, res) => {
  res.send("API is running successfully!");
});
app.use(express.json());
connectDB();

// ✅ API routes
app.use("/api/problems", problemRoutes);
app.use("/api/code", codeRoutes);
app.use("/api/submit", submitRouter);
app.use("/api/auth", authRoutes);

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
