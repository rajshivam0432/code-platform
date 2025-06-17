import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./db/db.js";
import problemRoutes from "./routes/Problem.routes.js";
import  codeRoutes  from "./routes/Code.routes.js";
dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

connectDB();

app.use("/api/problems", problemRoutes);

app.use("/api/code", codeRoutes);
import submitRouter from "./routes/Submit.routes.js";
app.use("/api/submit", submitRouter);

import authRoutes from "./routes/Auth.routes.js";
app.use("/api/auth", authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
