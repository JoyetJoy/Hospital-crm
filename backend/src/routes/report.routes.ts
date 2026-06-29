import { Router } from 'express';
import { exportSalesReport, exportVisitReport } from '../controllers/report.controller';
import { authenticateToken, authorizeRole } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);
router.use(authorizeRole(['Super Admin', 'Admin', 'Manager']));

router.get('/sales', exportSalesReport);
router.get('/visits', exportVisitReport);

export default router;
