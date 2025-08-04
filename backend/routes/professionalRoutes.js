import express from 'express';
import {
  createProfessional,
  getCompanyProfessionals,
  updateProfessional,
  deleteProfessional,
  getAllCompanyProfessionals,
  getMyProfessionalProfile,
  updateMySchedule, // Importa a nova função
  updateBlockedSlots // Importa a nova função
} from '../controllers/professionalController.js';
// Importa os dois middlewares que vamos usar
import { autenticarEmpresa, protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// --- ROTAS EXCLUSIVAS PARA O PROFISSIONAL LOGADO ---
// Protegidas pelo middleware 'protect', que permite o acesso de profissionais.
router.get('/meu-perfil', protect, getMyProfessionalProfile);
router.put('/my-schedule', protect, updateMySchedule);
router.put('/my-blocked-slots', protect, updateBlockedSlots);


// --- ROTAS EXCLUSIVAS PARA O ADMIN DA EMPRESA ---
// Protegidas pelo middleware 'autenticarEmpresa', que só permite admins.
router.get('/all', autenticarEmpresa, getAllCompanyProfessionals);

router.route('/')
  .post(autenticarEmpresa, createProfessional)
  .get(autenticarEmpresa, getCompanyProfessionals);

router.route('/:id')
  .put(autenticarEmpresa, updateProfessional)
  .delete(autenticarEmpresa, deleteProfessional);

export default router;
