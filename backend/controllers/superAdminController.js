import db from '../models/index.js';
import logger from '../logger.js';
import { Op } from 'sequelize';

const { Empresa, Login, Agendamento } = db;

/**
 * @desc    Lista todas as empresas cadastradas no sistema.
 */
export const getAllCompanies = async (req, res) => {
  try {
    const companies = await Empresa.findAll({
      order: [['createdAt', 'DESC']],
      // CORREÇÃO: Usando 'plano' para consistência com o modelo
      attributes: ['id', 'nome_empresa', 'email_admin', 'plano', 'subscriptionStatus', 'subscriptionEndDate', 'createdAt']
    });
    res.json(companies);
  } catch (error) {
    logger.error('erro_get_all_companies', { error: error.message });
    res.status(500).json({ erro: 'Erro ao buscar empresas.' });
  }
};

/**
 * @desc    Busca estatísticas gerais do sistema.
 */
export const getSystemStats = async (req, res) => {
  try {
    const [totalCompanies, totalUsers, totalProfessionals, totalAppointments] = await Promise.all([
      Empresa.count(),
      Login.count({ where: { tipo: 'cliente' } }),
      Login.count({ where: { tipo: 'professional' } }),
      Agendamento.count()
    ]);

    res.json({
      totalCompanies,
      totalUsers,
      totalProfessionals,
      totalAppointments
    });
  } catch (error) {
    logger.error('erro_get_system_stats', { error: error.message });
    res.status(500).json({ erro: 'Erro ao buscar estatísticas.' });
  }
};

/**
 * @desc    Atualiza o status da assinatura de uma empresa.
 */
export const updateCompanySubscription = async (req, res) => {
  try {
    const { id } = req.params;
    // ===================================================================
    // CORREÇÃO FINAL APLICADA AQUI:
    // Recebemos 'plan' do frontend, mas salvamos no campo 'plano' do modelo.
    // ===================================================================
    const { plan, subscriptionStatus, subscriptionEndDate } = req.body;

    const company = await db.Empresa.findByPk(id);
    if (!company) {
      return res.status(404).json({ erro: 'Empresa não encontrada.' });
    }

    company.plano = plan ?? company.plano; // Usamos 'plan' aqui
    company.subscriptionStatus = subscriptionStatus ?? company.subscriptionStatus;

    if (subscriptionEndDate) {
        company.subscriptionEndDate = new Date(`${subscriptionEndDate}T00:00:00`);
    }

    if (subscriptionStatus) {
      if (['inactive', 'canceled', 'past_due'].includes(subscriptionStatus)) {
        company.status = 'inactive';
      } else if (['active', 'trialing'].includes(subscriptionStatus)) {
        company.status = 'active';
      }
    }

    await company.save();

    logger.info('subscription_updated_by_superadmin', { companyId: id, newStatus: subscriptionStatus, newPlan: plan });
    res.json(company);
  } catch (error) {
    logger.error('erro_update_subscription', { error: error.message });
    res.status(500).json({ erro: 'Erro ao atualizar assinatura.' });
  }
};
