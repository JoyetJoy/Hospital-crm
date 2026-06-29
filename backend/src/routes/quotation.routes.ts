import { Router } from 'express';
import { getQuotations, getQuotationById, createQuotation, updateQuotationStatus, deleteQuotation } from '../controllers/quotation.controller';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

router.get('/', getQuotations);
router.get('/:id', getQuotationById);
router.post('/', createQuotation);
router.put('/:id/status', updateQuotationStatus);
router.delete('/:id', deleteQuotation);

export default router;
