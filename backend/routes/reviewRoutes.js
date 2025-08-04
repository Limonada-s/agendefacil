import express from 'express';
import {
  createReview,
  getCompanyReviews,
  getReviewsForAdmin,
  updateReviewStatus
} from '../controllers/reviewController.js';
import { autenticarCliente, autenticarEmpresa } from '../middlewares/authMiddleware.js';

const router = express.Router();

// --- Rotas para Clientes ---
// Cliente cria uma nova avaliação
router.post('/', autenticarCliente, createReview);

// --- Rotas para Administradores ---
// Admin busca todas as avaliações para moderar
router.get('/manage', autenticarEmpresa, getReviewsForAdmin);
// Admin aprova ou rejeita uma avaliação
router.put('/:id/status', autenticarEmpresa, updateReviewStatus);

// --- Rota Pública ---
// Qualquer pessoa pode ver as avaliações aprovadas de uma empresa
router.get('/company/:companyId', getCompanyReviews);

export default router;
