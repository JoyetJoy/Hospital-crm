import { Router } from 'express';
import { getExecutives, getExecutiveById, createExecutive, updateExecutive, deleteExecutive, assignHospital, removeAssignment } from '../controllers/executive.controller';
import { authenticateToken, authorizeRole } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

router.get('/', getExecutives);
router.get('/:id', getExecutiveById);
router.post('/', authorizeRole(['Super Admin', 'Admin', 'Manager']), createExecutive);
router.put('/:id', authorizeRole(['Super Admin', 'Admin', 'Manager']), updateExecutive);
router.delete('/:id', authorizeRole(['Super Admin', 'Admin', 'Manager']), deleteExecutive);

router.post('/:id/assignments', authorizeRole(['Super Admin', 'Admin', 'Manager']), assignHospital);
router.delete('/:id/assignments/:assignmentId', authorizeRole(['Super Admin', 'Admin', 'Manager']), removeAssignment);

export default router;
