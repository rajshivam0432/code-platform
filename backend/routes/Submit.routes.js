import express from "express";
import { submitCode } from "../controllers/Code.controller.js";

const router = express.Router();
router.post("/", submitCode);

export default router;
