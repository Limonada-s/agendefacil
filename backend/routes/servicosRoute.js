import express from 'express';
import servicoController from '../controllers/servicoController.js';
import { autenticarEmpresa } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/', autenticarEmpresa, servicoController.criarServico);

// Rota para ATUALIZAR um serviço existente
// Caminho final: PUT /api/servicos/:id
router.put('/:id', autenticarEmpresa, servicoController.atualizarServico);

// Rota para EXCLUIR um serviço existente
// Caminho final: DELETE /api/servicos/:id
router.delete('/:id', autenticarEmpresa, servicoController.excluirServico);

router.get('/:id/profissionais', servicoController.getProfessionalsForService);

export default router;

