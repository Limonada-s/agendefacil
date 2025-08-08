// Arquivo: src/routes/empresaRoutes.js

import express from 'express';
import {
  getEmpresaById,
  listarEmpresasProximas,
  registerCompany,
  listarServicosDaEmpresa,
  updateCompanySettings,
  cancelCompanyAccount,
  listarTodasEmpresasPublicas // Importa a nova função
} from '../controllers/register-company.js'; // <<<--- ESTA LINHA ESTÁ CORRIGIDA

import { autenticarEmpresa } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Rota pública para listar TODAS as empresas (fallback)
// Deve vir ANTES de /:id para evitar conflitos.
router.get('/', listarTodasEmpresasPublicas);

// Rota para listar empresas por geolocalização
router.get('/proximas', listarEmpresasProximas);

// Rota para buscar uma empresa específica por ID
router.get('/:id', getEmpresaById);

// Outras rotas
router.get('/:empresaId/servicos', listarServicosDaEmpresa);
router.post('/register-company', registerCompany);
router.put('/settings', autenticarEmpresa, updateCompanySettings);
router.delete('/cancel-account', autenticarEmpresa, cancelCompanyAccount);

export default router;
