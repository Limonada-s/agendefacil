// Em: src/scheduler/appointmentScheduler.js

import cron from 'node-cron';
import { Op } from 'sequelize';
import { addDays, format } from 'date-fns';
import db from '../models/index.js';
import { sendAppointmentReminderEmail } from '../utils/sendAppointmentEmails.js';
import logger from '../logger.js';

const { Agendamento, Login, Empresa, Servico, Professional } = db;

/**
 * Procura por agendamentos que ocorrerão amanhã e envia emails de lembrete.
 */
const checkAndSendReminders = async () => {
  try {
    // 1. Calcula a data de amanhã
    const tomorrow = addDays(new Date(), 1);
    const tomorrowStr = format(tomorrow, 'yyyy-MM-dd');

    logger.info(`[Scheduler] Rodando verificação de lembretes para a data: ${tomorrowStr}`);

    // 2. Busca todos os agendamentos de amanhã que não estão cancelados
    const upcomingAppointments = await Agendamento.findAll({
      where: {
        data: tomorrowStr,
        status: { [Op.ne]: 'cancelado' }
      },
      // Incluímos todos os dados necessários para montar o email de uma só vez
      include: [
        { model: Login, as: 'client', attributes: ['nome', 'email'], required: true },
        { model: Empresa, as: 'company', required: true },
        { model: Servico, as: 'servico', required: true }
      ]
    });

    if (upcomingAppointments.length === 0) {
      logger.info(`[Scheduler] Nenhum agendamento encontrado para amanhã. Nenhuma ação necessária.`);
      return;
    }

    logger.info(`[Scheduler] ${upcomingAppointments.length} agendamentos encontrados para amanhã. Enviando lembretes...`);

    // 3. Para cada agendamento, envia o email de lembrete
    for (const appointment of upcomingAppointments) {
      // Usamos 'await' aqui para garantir que os emails sejam enviados um de cada vez
      // e evitar sobrecarregar o serviço de email.
      await sendAppointmentReminderEmail(appointment);
    }

    logger.info(`[Scheduler] Processo de envio de lembretes concluído.`);

  } catch (error) {
    logger.error('[Scheduler] Erro CRÍTICO durante a verificação de lembretes:', { errorMessage: error.message, stack: error.stack });
  }
};

/**
 * Agenda a tarefa para rodar todos os dias às 07:00 da manhã.
 * A sintaxe '0 7 * * *' é o formato do cron: (minuto hora dia-do-mês mês dia-da-semana)
 */
export const startReminderScheduler = () => {
  logger.info('[Scheduler] Agendador de lembretes de agendamento INICIADO. Tarefa programada para 07:00 todos os dias.');
  
  // Agenda a tarefa
  cron.schedule('0 7 * * *', () => {
    logger.info('[Scheduler] CRON JOB: Executando a tarefa agendada de envio de lembretes.');
    checkAndSendReminders();
  }, {
    scheduled: true,
    timezone: "America/Sao_Paulo"
  });
};
