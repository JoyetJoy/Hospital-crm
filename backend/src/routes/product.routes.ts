import { Router } from 'express';
import { getProducts, getProductById, createProduct, updateProduct, deleteProduct } from '../controllers/product.controller';
import { authenticateToken, authorizeRole } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();

router.use(authenticateToken);

router.get('/', getProducts);
router.get('/:id', getProductById);
router.post('/', authorizeRole(['Super Admin', 'Admin', 'Manager']), upload.single('image'), createProduct);
router.put('/:id', authorizeRole(['Super Admin', 'Admin', 'Manager']), upload.single('image'), updateProduct);
router.delete('/:id', authorizeRole(['Super Admin', 'Admin']), deleteProduct);

export default router;
