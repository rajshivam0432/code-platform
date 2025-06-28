import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./db/db.js";
import setupSocket from "./socket.js";

// Routes
import problemRoutes from "./routes/Problem.routes.js";
import compileRoute from "./routes/compiler.routes.js";
import submitRouter from "./routes/Submit.routes.js";
import authRoutes from "./routes/Auth.routes.js";
import aiReviewRoute from "./routes/aiReviewRoute.js";

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "https://byte-battle2.vercel.app"],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

app.get("/", (req, res) => res.send("🚀 API is running successfully!"));

app.use("/api", aiReviewRoute);
app.use("/api/problems", problemRoutes);
app.use("/api", compileRoute);
app.use("/api/submit", submitRouter);
app.use("/api/auth", authRoutes);

// Setup socket communication
setupSocket(io);

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
