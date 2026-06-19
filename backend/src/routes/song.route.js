import { Router } from "express";
import { song } from "../controllers/song.controller.js";

const router = Router();

router.get("/", song);

export default router;
