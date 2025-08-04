import express from 'express';
import { getAllCompanies, getSystemStats, updateCompanySubscription } from '../controllers/superAdminController.js';
import { autenticarSuperAdmin } from '../middlewares/authMiddleware.js'; // Importa o novo middleware

const router = express.Router();

// Aplica o middleware de Super Admin a todas as rotas deste arquivo
router.use(autenticarSuperAdmin);

router.get('/companies', getAllCompanies);
router.get('/stats', getSystemStats);
router.put('/companies/:id/subscription', updateCompanySubscription);

export default router;