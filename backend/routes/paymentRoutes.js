// Em: src/routes/paymentRoutes.js
import express from 'express';
import { createCheckoutSession } from '../controllers/paymentController.js';
import { autenticarEmpresa } from '../middlewares/authMiddleware.js'; // Protege a rota

const router = express.Router();

// Rota que o frontend chama para "pagar" por um plano
router.post('/create-checkout-session', autenticarEmpresa, createCheckoutSession);

export default router;
