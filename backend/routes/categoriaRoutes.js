import express from 'express';
import { listarCategoriasDaEmpresa } from '../controllers/categoriaController.js';
import { autenticarEmpresa } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Listar categorias vinculadas à empresa logada
router.get('/empresa/categorias', autenticarEmpresa, listarCategoriasDaEmpresa);

export default router;
