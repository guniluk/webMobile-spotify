import { Router } from "express";
import { album } from "../controllers/album.controller.js";

const router = Router();

router.get("/", album);

export default router;
