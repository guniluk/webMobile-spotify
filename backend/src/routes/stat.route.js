import { Router } from "express";
import { stat } from "../controllers/stat.controller.js";

const router = Router();

router.get("/", stat);

export default router;
