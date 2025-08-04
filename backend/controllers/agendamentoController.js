// Arquivo: src/controllers/agendamentoController.js

import db from '../models/index.js';
import logger from '../logger.js';
import { Op } from 'sequelize';
import { getDay, parse, format } from 'date-fns';
import { sendAppointmentConfirmationEmail } from '../utils/sendAppointmentEmails.js';


const { Agendamento, Login, Servico, Empresa, Professional, Review } = db;

export const criarAgendamento = async (req, res) => {
  try {
    const clienteLogado = req.user;
    const { data, hora, servico_id, company_id, professional_id, observacoes } = req.body;

    if (!data || !hora || !servico_id || !company_id) {
      return res.status(400).json({ erro: 'Campos obrigatórios estão faltando.' });
    }

    const agendamento = await Agendamento.create({
      data,
      hora,
      servicoId: servico_id,
      companyId: company_id,
      professionalId: professional_id,
      clientId: clienteLogado.id,
      observacoes,
      status: 'pendente'
    });

    logger.info('✅ Agendamento criado com sucesso', { agendamentoId: agendamento.id });

    if(agendamento) {
      sendAppointmentConfirmationEmail(agendamento.id).catch(err => {
        logger.error('Falha no envio de email em segundo plano', { error: err.message });
      })
    }

    logger.info('✅ Agendamento criado com sucesso', { agendamentoId: agendamento.id });
    res.status(201).json(agendamento);
  } catch (error) {
    logger.error('❌ ERRO AO CRIAR AGENDAMENTO', { error: error.message, stack: error.stack });
    res.status(500).json({ erro: 'Erro ao criar agendamento', detalhes: error.message });
  }
};

export const listarAgendamentos = async (req, res) => {
  try {
    const whereClause = {};
    if (req.user.companyId) {
      whereClause.companyId = req.user.companyId;
    } else {
      whereClause.clientId = req.user.id;
    }

    const agendamentos = await db.Agendamento.findAll({
      where: whereClause,
      include: [
        { model: db.Login, as: 'client', attributes: ['nome', 'email'] },
        { model: db.Servico, as: 'servico', attributes: ['name', 'price'] },
        { model: db.Empresa, as: 'company', attributes: ['nome_empresa'], where: { status: 'active' }, required: true },
        { model: db.Professional, as: 'professional', include: [{ model: db.Login, as: 'loginDetails', attributes: ['nome'] }] },
        { model: db.Review, as: 'review', attributes: ['id', 'rating'], required: false }
      ],
      order: [['data', 'DESC'], ['hora', 'ASC']]
    });

    res.json(agendamentos);
  } catch (error) {
    logger.error('ERRO FATAL em listarAgendamentos', { service: 'api-agendefacil', errorMessage: error.message, stack: error.stack });
    res.status(500).json({ erro: 'Erro ao buscar agendamentos.' });
  }
};

export const alterarStatusAgendamento = async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = req.user.id;
    const agendamento = await db.Agendamento.findByPk(id);
    if (!agendamento) {
      return res.status(404).json({ erro: 'Agendamento não encontrado.' });
    }
    if (agendamento.companyId !== companyId) {
      return res.status(403).json({ erro: 'Você não tem permissão para alterar este agendamento.' });
    }
    await agendamento.update(req.body);
    logger.info('⚙️ Agendamento atualizado', { agendamentoId: id, dados: req.body });
    res.status(200).json(agendamento);
  } catch (error) {
    logger.error('❌ Erro ao alterar agendamento', { error: error.message });
    res.status(500).json({ erro: 'Erro ao alterar o agendamento.' });
  }
};

export const excluirAgendamento = async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = req.user.id;
    const agendamento = await db.Agendamento.findByPk(id);
    if (!agendamento) {
      return res.status(404).json({ erro: 'Agendamento não encontrado.' });
    }
    if (agendamento.companyId !== companyId) {
      return res.status(403).json({ erro: 'Você não tem permissão para excluir este agendamento.' });
    }
    await agendamento.destroy();
    logger.info('🗑️ Agendamento excluído', { agendamentoId: id, companyId });
    res.status(200).json({ mensagem: 'Agendamento excluído com sucesso.' });
  } catch (error) {
    logger.error('❌ Erro ao excluir agendamento', { error: error.message });
    res.status(500).json({ erro: 'Erro ao excluir o agendamento.' });
  }
};

export const getHorariosDisponiveis = async (req, res) => {
  try {
    const { professionalId, date, serviceId } = req.query;
    if (!professionalId || !date || !serviceId) {
      return res.status(400).json({ erro: 'ID do profissional, do serviço e a data são obrigatórios.' });
    }
    const [professional, service, appointmentsForDay] = await Promise.all([
      db.Professional.findByPk(professionalId),
      db.Servico.findByPk(serviceId),
      db.Agendamento.findAll({
        where: {
          professionalId: professionalId,
          data: date,
          status: { [Op.ne]: 'cancelado' }
        },
        attributes: ['hora']
      })
    ]);
    if (!professional || !service) {
      return res.status(404).json({ erro: 'Profissional ou serviço não encontrado.' });
    }
    const localDate = new Date(`${date}T00:00:00`);
    const dayOfWeekIndex = getDay(localDate);
    const dayKey = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab'][dayOfWeekIndex];
    const workingHours = professional.workingHours || {};
    const daySchedule = workingHours[dayKey];
    if (!daySchedule || !daySchedule.ativo) {
      return res.json([]);
    }
    const allSlots = [];
    const slotInterval = 15;
    let currentTime = parse(daySchedule.inicio, 'HH:mm', localDate);
    const endTime = parse(daySchedule.fim, 'HH:mm', localDate);
    while (currentTime < endTime) {
      allSlots.push(format(currentTime, 'HH:mm'));
      currentTime.setMinutes(currentTime.getMinutes() + slotInterval);
    }
    const occupiedSlots = appointmentsForDay.map(app => app.hora);
    let availableSlots = allSlots.filter(slot => !occupiedSlots.includes(slot));
    const blockedSlotsForDay = (professional.blockedSlots || [])
      .filter(block => block.date === date)
      .map(block => block.time);
    if (blockedSlotsForDay.length > 0) {
      availableSlots = availableSlots.filter(slot => !blockedSlotsForDay.includes(slot));
    }
    res.json(availableSlots);
  } catch (error) {
    logger.error('erro_get_horarios_disponiveis', { error: error.message, stack: error.stack });
    res.status(500).json({ erro: 'Erro ao processar sua solicitação.' });
  }
};

export const getMyProfessionalAppointments = async (req, res) => {
  try {
    const loginId = req.user.id;
    const professional = await db.Professional.findOne({ where: { login_id: loginId } });
    if (!professional) {
      return res.status(404).json({ erro: 'Perfil profissional não encontrado para este usuário.' });
    }
    const appointments = await db.Agendamento.findAll({
      where: { professionalId: professional.id },
      include: [
        { model: db.Login, as: 'client', attributes: ['nome'] },
        { model: db.Servico, as: 'servico', attributes: ['name'] }
      ],
      order: [['data', 'ASC'], ['hora', 'ASC']]
    });
    res.json(appointments);
  } catch (error) {
    logger.error('erro_get_my_professional_appointments', { error: error.message, userId: req.user?.id });
    res.status(500).json({ erro: 'Erro interno ao buscar seus agendamentos.' });
  }
};

export const getServiceHistory = async (req, res) => {
  try {
    const companyId = req.user.companyId;
    const { searchTerm, statusFilter, startDate, endDate } = req.query;
    let whereClause = {
      companyId: companyId,
      status: { [Op.in]: ['concluido', 'cancelado'] }
    };
    if (statusFilter) {
      whereClause.status = statusFilter;
    }
    if (startDate && endDate) {
      whereClause.data = { [Op.between]: [startDate, endDate] };
    }
    if (searchTerm) {
      whereClause[Op.or] = [
        { '$client.nome$': { [Op.iLike]: `%${searchTerm}%` } },
        { '$servico.name$': { [Op.iLike]: `%${searchTerm}%` } },
        { '$professional.loginDetails.nome$': { [Op.iLike]: `%${searchTerm}%` } }
      ];
    }
    const appointments = await db.Agendamento.findAll({
      where: whereClause,
      include: [
        { model: db.Login, as: 'client', required: true },
        { model: db.Servico, as: 'servico', required: true },
        { model: db.Professional, as: 'professional', required: false, include: [{ model: db.Login, as: 'loginDetails', required: false }] }
      ],
      order: [['data', 'DESC'], ['hora', 'DESC']],
      subQuery: false
    });
    let totalSalonNetRevenue = 0;
    let totalProfessionalCommissions = 0;
    const enrichedHistory = appointments.map(app => {
      const servicePrice = parseFloat(app.servico?.price || 0);
      let professionalCommission = 0;
      let salonNetRevenue = (app.status === 'concluido') ? servicePrice : 0;
      if (app.status === 'concluido' && app.professional?.commissionRate > 0) {
        professionalCommission = servicePrice * (app.professional.commissionRate / 100);
        salonNetRevenue = servicePrice - professionalCommission;
      }
      totalSalonNetRevenue += salonNetRevenue;
      totalProfessionalCommissions += professionalCommission;
      return {
        id: app.id,
        date: app.data,
        time: app.hora,
        clientName: app.client?.nome || 'N/A',
        serviceName: app.servico?.name || 'N/A',
        professionalName: app.professional?.loginDetails?.nome || 'N/A',
        servicePrice,
        professionalCommission,
        salonNetRevenue,
        status: app.status
      };
    });
    res.json({
      history: enrichedHistory,
      summary: {
        totalSalonNetRevenue,
        totalProfessionalCommissions
      }
    });
  } catch (error) {
    logger.error('erro_get_service_history', { error: error.message, stack: error.stack });
    res.status(500).json({ erro: 'Erro ao buscar histórico de atendimentos.' });
  }
};

export const updateAppointmentStatusByProfessional = async (req, res) => {
  try {
    const { id: appointmentId } = req.params;
    const { status } = req.body;
    const loginId = req.user.id;
    if (!status) {
      return res.status(400).json({ erro: 'O novo status é obrigatório.' });
    }
    const professional = await db.Professional.findOne({ where: { login_id: loginId } });
    if (!professional) {
      return res.status(404).json({ erro: 'Perfil profissional não encontrado.' });
    }
    const appointment = await db.Agendamento.findByPk(appointmentId);
    if (!appointment) {
      return res.status(404).json({ erro: 'Agendamento não encontrado.' });
    }
    if (appointment.professionalId !== professional.id) {
      return res.status(403).json({ erro: 'Você não tem permissão para alterar este agendamento.' });
    }
    appointment.status = status;
    await appointment.save();
    logger.info('status_agendamento_atualizado_pelo_profissional', { appointmentId, newStatus: status, professionalId: professional.id });
    res.json(appointment);
  } catch (error) {
    logger.error('erro_update_status_by_professional', { error: error.message });
    res.status(500).json({ erro: 'Erro ao atualizar o status do agendamento.' });
  }
};
