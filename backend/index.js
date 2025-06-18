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

const allowedOrigins = [
  "https://bytebattle-platform.vercel.app",
  "http://localhost:5173",
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.error("Blocked CORS request from:", origin);
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use(express.json());

connectDB();

app.get("/", (req, res) => {
  res.send("🚀 API is running successfully!");
});

app.use("/api/problems", problemRoutes);
app.use("/api/code", codeRoutes);
app.use("/api/submit", submitRouter);
app.use("/api/auth", authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);
