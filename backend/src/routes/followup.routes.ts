import { Router } from 'express';
import { getFollowups, getFollowupById, createFollowup, updateFollowup, deleteFollowup } from '../controllers/followup.controller';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

router.get('/', getFollowups);
router.get('/:id', getFollowupById);
router.post('/', createFollowup);
router.put('/:id', updateFollowup);
router.delete('/:id', deleteFollowup);

export default router;
