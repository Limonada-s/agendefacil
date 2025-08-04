import db from '../models/index.js';
import { Op } from 'sequelize';
import { subDays, startOfDay } from 'date-fns';
import logger from '../logger.js';
// ===================================================================
// CORREÇÃO FINAL: Removemos a biblioteca 'date-fns-tz' de vez
// e usaremos a funcionalidade nativa do JavaScript para fusos horários.
// ===================================================================

const { Agendamento, Servico, Professional, Expense, Login } = db;

const timeZone = 'America/Sao_Paulo';

export const getFinancialSummary = async (req, res) => {
  const { range } = req.query;
  const companyId = req.user.companyId;

  const now = new Date();
  
  let startDate;
  if (range === 'last7days') startDate = subDays(now, 7);
  else if (range === 'last30days') startDate = subDays(now, 30);
  else if (range === 'last90days') startDate = subDays(now, 90);

  const whereCondition = {
    companyId: companyId,
    status: 'concluido',
    ...(startDate && { data: { [Op.gte]: startOfDay(startDate) } })
  };

  try {
    const concludedAppointments = await Agendamento.findAll({
      where: whereCondition,
      include: [
        { model: Servico, as: 'servico', attributes: ['price', 'name'] },
        { model: Professional, as: 'professional' }
      ]
    });

    // Usando o 'Intl' nativo para formatar a data de "hoje" no fuso horário correto.
    const today = new Intl.DateTimeFormat('en-CA', { timeZone }).format(now);

    const appointmentsTodayCount = await Agendamento.count({
        where: {
            companyId: companyId,
            data: today,
            status: { [Op.ne]: 'cancelado' }
        }
    });

    const upcomingAppointments = await Agendamento.findAll({
        where: {
            companyId: companyId,
            data: { [Op.gte]: today },
            status: { [Op.in]: ['pendente', 'confirmado'] }
        },
        include: [
            { model: Login, as: 'client', attributes: ['nome'] },
            { model: Servico, as: 'servico', attributes: ['name'] }
        ],
        order: [['data', 'ASC'], ['hora', 'ASC']],
        limit: 3
    });

    const expenses = await Expense.findAll({
      where: { companyId: companyId, ...(startDate && { date: { [Op.gte]: startOfDay(startDate) } }) },
      include: [{ model: Professional, as: 'professional', include: [{ model: Login, as: 'loginDetails', attributes: ['nome'] }] }],
      order: [['date', 'DESC']]
    });

    let grossRevenue = 0;
    let totalProfessionalCommissions = 0;
    const revenueByService = {};
    const serviceCount = {};

    concludedAppointments.forEach(app => {
      const price = parseFloat(app.servico?.price || 0);
      grossRevenue += price;
      if (app.professional?.commissionRate) {
        totalProfessionalCommissions += price * (app.professional.commissionRate / 100);
      }
      const serviceName = app.servico?.name || 'Serviço Desconhecido';
      revenueByService[serviceName] = (revenueByService[serviceName] || 0) + price;
      serviceCount[serviceName] = (serviceCount[serviceName] || 0) + 1;
    });

    const totalExpensesAmount = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
    const salonNetRevenueFromServices = grossRevenue - totalProfessionalCommissions;
    const finalNetRevenue = salonNetRevenueFromServices - totalExpensesAmount;

    res.json({
      summary: {
        grossRevenue,
        totalProfessionalCommissions,
        salonNetRevenueFromServices,
        totalExpensesAmount,
        finalNetRevenue,
        totalAppointments: concludedAppointments.length,
        averageTicket: concludedAppointments.length > 0 ? grossRevenue / concludedAppointments.length : 0,
        appointmentsTodayCount: appointmentsTodayCount,
      },
      upcomingAppointments: upcomingAppointments,
      charts: {
        revenueByService: Object.entries(revenueByService).map(([name, revenue]) => ({ name, revenue, count: serviceCount[name] })),
      },
      expenses
    });

  } catch (error) {
    logger.error('erro_financial_summary', { error: error.message, stack: error.stack });
    res.status(500).json({ erro: 'Erro ao buscar dados financeiros.' });
  }
};

export const getMyEarnings = async (req, res) => {
  try {
    const { range } = req.query;
    const loginId = req.user.id;

    const professional = await db.Professional.findOne({ where: { login_id: loginId } });
    if (!professional) {
      return res.status(404).json({ erro: 'Perfil profissional não encontrado.' });
    }

    // ===================================================================
    // CORREÇÃO APLICADA AQUI: Usando a mesma lógica nativa.
    // ===================================================================
    const now = new Date();
    let startDate;
    if (range === 'last7days') startDate = subDays(now, 7);
    else if (range === 'last30days') startDate = subDays(now, 30);
    else if (range === 'last90days') startDate = subDays(now, 90);
    
    const whereCondition = {
      professionalId: professional.id,
      status: 'concluido',
      ...(startDate && { data: { [Op.gte]: startOfDay(startDate) } })
    };

    const concludedAppointments = await db.Agendamento.findAll({
      where: whereCondition,
      include: [{ model: db.Servico, as: 'servico', attributes: ['name', 'price'] }],
      order: [['data', 'DESC']]
    });

    let totalCommission = 0;
    const commissionDetails = concludedAppointments.map(app => {
      const servicePrice = parseFloat(app.servico?.price || 0);
      const commissionAmount = servicePrice * (professional.commissionRate / 100);
      totalCommission += commissionAmount;
      return {
        date: app.data,
        serviceName: app.servico?.name,
        servicePrice,
        commissionRate: professional.commissionRate,
        commissionAmount
      };
    });

    const advances = await db.Expense.findAll({
      where: {
        professionalId: professional.id,
        type: 'adiantamento',
        ...(startDate && { date: { [Op.gte]: startOfDay(startDate) } })
      },
      order: [['date', 'DESC']]
    });
    const totalAdvances = advances.reduce((sum, adv) => sum + parseFloat(adv.amount), 0);

    const finalBalance = totalCommission - totalAdvances;

    res.json({
      summary: { totalCommission, totalAdvances, finalBalance, totalServices: concludedAppointments.length },
      details: { commissions: commissionDetails, advances: advances }
    });

  } catch (error) {
    logger.error('erro_get_my_earnings', { error: error.message, userId: req.user?.id });
    res.status(500).json({ erro: 'Erro ao buscar seus ganhos.' });
  }
};

export const createExpense = async (req, res) => {
  const { description, amount, type, date, professionalId } = req.body;
  const companyId = req.user.companyId;
  try {
    const newExpense = await Expense.create({ description, amount, type, date, professionalId: type === 'adiantamento' ? professionalId : null, companyId });
    res.status(201).json(newExpense);
  } catch (error) {
    logger.error('erro_create_expense', { error: error.message });
    res.status(500).json({ erro: 'Erro ao criar lançamento.' });
  }
};

export const deleteExpense = async (req, res) => {
  const { id } = req.params;
  const companyId = req.user.companyId;
  try {
    const expense = await Expense.findOne({ where: { id, companyId: companyId } });
    if (!expense) {
      return res.status(404).json({ erro: 'Lançamento não encontrado ou não pertence a esta empresa.' });
    }
    await expense.destroy();
    res.status(204).send();
  } catch (error) {
    logger.error('erro_delete_expense', { error: error.message });
    res.status(500).json({ erro: 'Erro ao excluir lançamento.' });
  }
};
