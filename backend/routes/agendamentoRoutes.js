import express from 'express';
import {
  criarAgendamento,
  listarAgendamentos,
  alterarStatusAgendamento,
  getHorariosDisponiveis,
  excluirAgendamento,
  getMyProfessionalAppointments,
  getServiceHistory,
  updateAppointmentStatusByProfessional
} from '../controllers/agendamentoController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();
router.post('/', protect, criarAgendamento);
router.get('/', protect, listarAgendamentos);
router.put('/:id', protect, alterarStatusAgendamento);
router.delete('/:id', protect, excluirAgendamento);


router.get('/horarios-disponiveis', getHorariosDisponiveis);

// Rota para o profissional ver seus próprios agendamentos
router.get('/meus-agendamentos-profissional', protect, getMyProfessionalAppointments);

// Rota para a empresa ver o histórico de serviços
router.get('/history', protect, getServiceHistory);

// Rota para o profissional atualizar o status de um agendamento
router.put('/professional/:id', protect, updateAppointmentStatusByProfessional);

export default router;
