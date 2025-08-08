
import express from 'express';
import {
  criarAgendamento,
  // --- ROTAS ATUALIZADAS ---
  listarAgendamentosEmpresa,  
  listarAgendamentosCliente,  
  // -------------------------
  alterarStatusAgendamento,
  getHorariosDisponiveis,
  excluirAgendamento,
  getMyProfessionalAppointments,
  getServiceHistory,
  updateAppointmentStatusByProfessional
} from '../controllers/agendamentoController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// --- ROTAS ATUALIZADAS ---

// Rota para a EMPRESA listar todos os agendamentos
router.get('/empresa', protect, listarAgendamentosEmpresa);

// Rota para o CLIENTE listar os seus próprios agendamentos (ESSA É A ROTA QUE FALTAVA)
router.get('/cliente', protect, listarAgendamentosCliente);

// -------------------------

router.post('/', protect, criarAgendamento);
router.put('/:id', protect, alterarStatusAgendamento);
router.delete('/:id', protect, excluirAgendamento);

router.get('/horarios-disponiveis', getHorariosDisponiveis);
router.get('/meus-agendamentos-profissional', protect, getMyProfessionalAppointments);
router.get('/history', protect, getServiceHistory);
router.put('/professional/:id', protect, updateAppointmentStatusByProfessional);

export default router;
