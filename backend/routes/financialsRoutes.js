import express from 'express';
import { getFinancialSummary, createExpense, deleteExpense, getMyEarnings } from '../controllers/financialsController.js';
// Importe os dois middlewares
import { autenticarEmpresa, protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Rotas exclusivas para o ADMIN da empresa
router.get('/summary', autenticarEmpresa, getFinancialSummary);
router.post('/expenses', autenticarEmpresa, createExpense);
router.delete('/expenses/:id', autenticarEmpresa, deleteExpense);

// Rota exclusiva para o PROFISSIONAL logado
router.get('/my-earnings', protect, getMyEarnings);

export default router;