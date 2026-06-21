import { Router } from 'express';
import {
  createSong,
  deleteSong,
  createAlbum,
  deleteAlbum,
  checkAdmin,
} from '../controllers/admin.controller.js';
import { protectRoute, requireAdmin } from '../middleware/auth.middleware.js';

const router = Router();
router.use(protectRoute, requireAdmin);

router.get('/check', checkAdmin);
router.post('/songs', createSong);
router.delete('/songs/:songId', deleteSong);
router.post('/album', createAlbum);
router.delete('/album/:albumId', deleteAlbum);

export default router;
