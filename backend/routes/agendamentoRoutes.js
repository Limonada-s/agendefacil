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
import { autenticarCliente, autenticarEmpresa, protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Rota para um cliente criar um agendamento
router.post('/', autenticarCliente, criarAgendamento);

// Rotas para listar agendamentos, uma para cada tipo de usuário
router.get('/cliente', autenticarCliente, listarAgendamentos);
router.get('/empresa', autenticarEmpresa, listarAgendamentos);

// Rotas para alterar o status
router.put('/cliente/:id', autenticarCliente, alterarStatusAgendamento);
router.put('/empresa/:id', autenticarEmpresa, alterarStatusAgendamento);

router.get('/horarios-disponiveis', getHorariosDisponiveis);

router.delete('/empresa/:id', autenticarEmpresa, excluirAgendamento);

router.get('/meus-agendamentos-profissional',protect, getMyProfessionalAppointments);

router.get('/history', autenticarEmpresa, getServiceHistory);

router.put('/professional/:id', protect, updateAppointmentStatusByProfessional
);

export default router;
