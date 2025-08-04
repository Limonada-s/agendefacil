// services/agendamentoService.js
import api from './api';

export const criarAgendamento = async (dados) => {
  const response = await api.post('/api/agendamentos', dados);
  return response.data;
};

export const listarAgendamentos = async () => {
  const response = await api.get('/api/agendamentos');
  return response.data;
};
