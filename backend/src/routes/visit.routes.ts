import { Router } from 'express';
import { getVisits, getVisitById, createVisit, updateVisit, deleteVisit } from '../controllers/visit.controller';
import { authenticateToken } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();

router.use(authenticateToken);

router.get('/', getVisits);
router.get('/:id', getVisitById);
router.post('/', upload.array('images', 5), createVisit);
router.put('/:id', upload.array('images', 5), updateVisit);
router.delete('/:id', deleteVisit);

export default router;
