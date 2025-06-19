import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./db/db.js";

// Routes
import problemRoutes from "./routes/Problem.routes.js";
import codeRoutes from "./routes/Code.routes.js";
import submitRouter from "./routes/Submit.routes.js";
import authRoutes from "./routes/Auth.routes.js";

dotenv.config();
const app = express();

// ✅ CORS Options
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      "https://byte-battle2.vercel.app",
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

// ✅ Apply CORS middleware globally
app.use(cors(corsOptions));

// ✅ Handle OPTIONS preflight manually and safely
// app.options("*", (req, res) => {
//   res.set({
//     "Access-Control-Allow-Origin": req.headers.origin || "*",
//     "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
//     "Access-Control-Allow-Headers":
//       "Origin, X-Requested-With, Content-Type, Accept, Authorization",
//     "Access-Control-Allow-Credentials": "true",
//   });
//   res.sendStatus(204);
// });

// ✅ Body parser
app.use(express.json());

// ✅ Connect DB
connectDB();

// ✅ Routes
app.get("/", (req, res) => {
  res.send("🚀 API is running successfully!");
});
app.use("/api/problems", problemRoutes);
app.use("/api/code", codeRoutes);
app.use("/api/submit", submitRouter);
app.use("/api/auth", authRoutes);

// ✅ Start server
const PORT = process.env.PORT || 10000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
});