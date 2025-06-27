import express from "express";
import {
  submitCode,
  submitCustomCode,
} from "../controllers/Code.controller.js";

const router = express.Router();
router.post("/", submitCode);
router.post("/custom", submitCustomCode);

export default router;
