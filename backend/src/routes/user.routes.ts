import { Router } from 'express';
import { getUsers, getUserById, createUser, updateUser, deleteUser, getRoles } from '../controllers/user.controller';
import { authenticateToken, authorizeRole } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

router.get('/roles', authorizeRole(['Super Admin', 'Admin']), getRoles);
router.get('/', authorizeRole(['Super Admin', 'Admin']), getUsers);
router.get('/:id', authorizeRole(['Super Admin', 'Admin']), getUserById);
router.post('/', authorizeRole(['Super Admin', 'Admin']), createUser);
router.put('/:id', authorizeRole(['Super Admin', 'Admin']), updateUser);
router.delete('/:id', authorizeRole(['Super Admin', 'Admin']), deleteUser);

export default router;
