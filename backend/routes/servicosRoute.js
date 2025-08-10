import express from 'express';
import {
    criarServico,
    atualizarServico,
    excluirServico,
    getProfessionalsForService
} from '../controllers/servicoController.js'; 
import { autenticarEmpresa } from '../middlewares/authMiddleware.js';
import upload from '../middlewares/upload.js';

const router = express.Router();

// Rota para CRIAR um serviço (continua POST)
router.post('/', autenticarEmpresa, upload.single('image'), criarServico);

// ✅ CORREÇÃO: A rota de atualização agora aceita POST, que corresponde ao que o frontend envia.
router.post('/:id', autenticarEmpresa, upload.single('image'), atualizarServico);

// Rota para EXCLUIR um serviço
router.delete('/:id', autenticarEmpresa, excluirServico);

// Rota para buscar profissionais de um serviço
router.get('/:id/profissionais', getProfessionalsForService);

export default router;
