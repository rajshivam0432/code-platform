// index.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";




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

// ✅ Middleware
app.use(cors(corsOptions));
app.use(express.json());

// ✅ Connect to MongoDB


// ✅ Health check route
app.get("/", (req, res) => {
  res.send("🚀 Compiler API is running successfully!");
});
import codeRoutes from './Code.routes.js';
app.use('/api/code', codeRoutes); // full route: /api/code/run

// ✅ Start server
const PORT = process.env.PORT || 6000;
app.listen(PORT, () => {
  console.log(`🚀 Compiler service running on http://localhost:${PORT}`);
});
