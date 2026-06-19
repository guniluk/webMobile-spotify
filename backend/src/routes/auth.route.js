import { Router } from "express";
import { auth } from "../controllers/auth.controller.js";

const router = Router();

router.get("/", auth);

export default router;
