// Em: backend/scheduler/subscriptionScheduler.js

import cron from 'node-cron';
import { Op } from 'sequelize';
import { format } from 'date-fns';
import db from '../models/index.js';
import logger from '../logger.js';

const { Empresa } = db;

/**
 * Procura por empresas com assinaturas ativas ou em teste que já expiraram
 * e atualiza o status delas para 'past_due' (vencida).
 */
const checkAndUpdateSubscriptions = async () => {
  try {
    const today = new Date();
    const todayStr = format(today, 'yyyy-MM-dd');

    logger.info(`[Scheduler Assinatura] Rodando verificação de assinaturas expiradas para a data: ${todayStr}`);

    // 1. Encontra todas as empresas que estão com a assinatura ativa ou em teste E cuja data de expiração já passou.
    const [affectedCount] = await Empresa.update(
      { 
        subscriptionStatus: 'past_due', // Atualiza o status para "vencida"
        status: 'inactive' // Também inativa a empresa para bloquear o acesso
      },
      {
        where: {
          subscriptionStatus: {
            [Op.in]: ['active', 'trialing']
          },
          subscriptionEndDate: {
            [Op.lt]: todayStr // Onde a data de expiração é MENOR QUE hoje
          }
        }
      }
    );

    if (affectedCount > 0) {
      logger.info(`[Scheduler Assinatura] ${affectedCount} empresas foram atualizadas para 'past_due'.`);
    } else {
      logger.info(`[Scheduler Assinatura] Nenhuma assinatura expirada encontrada. Nenhuma ação necessária.`);
    }

  } catch (error) {
    logger.error('[Scheduler Assinatura] Erro CRÍTICO durante a verificação de assinaturas:', { errorMessage: error.message, stack: error.stack });
  }
};


export const startSubscriptionScheduler = () => {
  logger.info('[Scheduler Assinatura] Agendador de assinaturas INICIADO. Tarefa programada para 01:00 todos os dias.');
  
  // Agenda a tarefa
  cron.schedule('0 1 * * *', () => {
    logger.info('[Scheduler Assinatura] CRON JOB: Executando a tarefa agendada de verificação de assinaturas.');
    checkAndUpdateSubscriptions();
  }, {
    scheduled: true,
    timezone: "America/Sao_Paulo"
  });

};
