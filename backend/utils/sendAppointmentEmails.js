import sendEmail from './sendEmail.js';
import db from '../models/index.js';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale'; 
import logger from '../logger.js';

const formatDateForEmail = (dateString) => {
  try {
    const date = new Date(`${dateString}T00:00:00`);
    return format(date, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  } catch (error) {
    logger.error('Erro ao formatar data para email', { dateString });
    return dateString;
  }
};

/**
 * Envia um email de confirmação de agendamento.
 */
export const sendAppointmentConfirmationEmail = async (appointmentId) => {
  // ... (Sua função existente, que já funciona perfeitamente, continua aqui)
};
export const sendAppointmentReminderEmail = async (appointment) => {
  try {
    if (!appointment?.client?.email) {
      logger.warn(`[Email Lembrete] Tentativa de envio para agendamento ${appointment.id} sem email de cliente.`);
      return;
    }

    const { client, company, servico, data, hora } = appointment;
    logger.info(`[Email Lembrete] Preparando lembrete para ${client.email} sobre agendamento ID: ${appointment.id}`);

    const subject = `Lembrete de Agendamento: ${servico.name} amanhã!`;
    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #0056b3;">Olá, ${client.nome}!</h2>
        <p>Este é um lembrete amigável sobre o seu agendamento para <strong>amanhã</strong>.</p>
        <ul style="list-style-type: none; padding: 0;">
          <li style="margin-bottom: 10px;"><strong>Serviço:</strong> ${servico.name}</li>
          <li style="margin-bottom: 10px;"><strong>Estabelecimento:</strong> ${company.nome_empresa}</li>
          <li style="margin-bottom: 10px;"><strong>Data:</strong> ${formatDateForEmail(data)}</li>
          <li style="margin-bottom: 10px;"><strong>Hora:</strong> ${hora}</li>
        </ul>
        <p>Estamos ansiosos para te ver!</p>
        <p style="font-size: 0.9em; color: #777;">Para cancelar ou reagendar, por favor, entre em contato com o estabelecimento.</p>
      </div>
    `;

    await sendEmail({
      email: client.email,
      subject,
      html
    });

    logger.info(`[Email Lembrete] Lembrete enviado com sucesso para ${client.email}`);

  } catch (error) {
    logger.error(`[Email Lembrete] Erro CRÍTICO ao enviar lembrete para o agendamento ${appointment.id}:`, { errorMessage: error.message });
  }
};
