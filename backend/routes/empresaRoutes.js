// Arquivo: backend/routes/empresaRoutes.js
// VERSÃO FINAL COM NOMES E CAMINHOS CORRIGIDOS

import express from 'express';
import multer from 'multer';
import uploadConfig from '../middlewares/upload.js'; // Caminho corrigido
import {
  registerCompany,
  listarTodasEmpresasPublicas,
  listarEmpresasProximas,
  getEmpresaById,
  listarServicosDaEmpresa,
  updateCompanySettings,
  cancelCompanyAccount
} from '../controllers/register-company.js'; // NOME DO ARQUIVO CORRIGIDO
import { autenticarEmpresa } from '../middlewares/authMiddleware.js'; // CAMINHO CORRIGIDO

const router = express.Router();
const upload = multer(uploadConfig);

// Rota pública para listar TODAS as empresas
router.get('/', listarTodasEmpresasPublicas);

// Rota para listar empresas por geolocalização
router.get('/proximas', listarEmpresasProximas);

// Rota de registro de empresa com upload de logo
router.post('/register-company', upload.single('logo'), registerCompany);

// Rota pública para obter detalhes de uma empresa por ID
router.get('/:id', getEmpresaById);

// Rota pública para listar serviços de uma empresa
router.get('/:empresaId/servicos', listarServicosDaEmpresa);

// Rotas protegidas
router.put('/settings', autenticarEmpresa, updateCompanySettings);
router.delete('/cancel-account', autenticarEmpresa, cancelCompanyAccount);

export default router;
