// Arquivo: src/routes/empresaRoutes.js

import express from 'express';
import {
  getEmpresaById,
  listarEmpresasProximas,
  registerCompany,
  listarServicosDaEmpresa,
  updateCompanySettings,
  cancelCompanyAccount
} from '../controllers/register-company.js';
import { autenticarEmpresa } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/proximas', listarEmpresasProximas);
router.get('/:id', getEmpresaById);
router.get('/:empresaId/servicos', listarServicosDaEmpresa);
router.post('/register-company', registerCompany);
router.put('/settings', autenticarEmpresa, updateCompanySettings);
router.delete('/cancel-account', autenticarEmpresa, cancelCompanyAccount);

export default router;
