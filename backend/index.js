import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./db/db.js";

// Route Imports
import problemRoutes from "./routes/Problem.routes.js";
import codeRoutes from "./routes/Code.routes.js";
import submitRouter from "./routes/Submit.routes.js";
import authRoutes from "./routes/Auth.routes.js";

dotenv.config();
const app = express();

// ✅ Updated and safe CORS options
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      "https://bytebattle-platform.vercel.app",
      "http://localhost:5173",
    ];
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Origin",
    "X-Requested-With",
    "Content-Type",
    "Accept",
    "Authorization",
  ],
};

// ✅ Apply CORS before all routes
app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // Handle preflight requests

// ✅ Parse JSON requests
app.use(express.json());

// ✅ Connect to MongoDB
connectDB();

// ✅ Health check
app.get("/", (req, res) => {
  res.send("🚀 API is running successfully!");
});

// ✅ Routes
app.use("/api/problems", problemRoutes);
app.use("/api/code", codeRoutes);
app.use("/api/submit", submitRouter);
app.use("/api/auth", authRoutes);

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);
