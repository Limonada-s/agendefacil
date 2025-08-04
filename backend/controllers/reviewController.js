// Em: src/controllers/reviewController.js
import db from '../models/index.js';
import logger from '../logger.js';
import { fn, col } from 'sequelize';

const { Review, Agendamento, Login, Professional, Empresa } = db;

// Função auxiliar para recalcular a média de avaliações da empresa
const updateCompanyAverageRating = async (companyId) => {
  logger.info(`[RECALC] Iniciando recálculo para empresa ID: ${companyId}`);
  try {
    const result = await Review.findOne({
      where: { companyId, status: 'approved' },
      attributes: [
        [fn('COUNT', col('id')), 'totalReviews'],
        [fn('AVG', col('rating')), 'averageRating']
      ],
      raw: true,
    });

    const totalReviews = parseInt(result.totalReviews, 10) || 0;
    const averageRating = parseFloat(result.averageRating) || 0;
    logger.info(`[RECALC] Valores calculados para empresa ${companyId}:`, { totalReviews, averageRating });

    const empresaToUpdate = await Empresa.findByPk(companyId);

    if (empresaToUpdate) {
      empresaToUpdate.totalReviews = totalReviews;
      empresaToUpdate.averageRating = averageRating.toFixed(2);
      await empresaToUpdate.save(); // O .save() é mais confiável para o mapeamento
      logger.info(`[RECALC] SUCESSO: Empresa ${companyId} atualizada com sucesso no banco.`);
    } else {
      logger.warn(`[RECALC] ATENÇÃO: Não foi possível encontrar a empresa com ID ${companyId} para atualizar a nota.`);
    }

  } catch (error) {
    logger.error('[RECALC] Erro CRÍTICO ao recalcular média', { companyId, error: error.message, stack: error.stack });
  }
};

// Cliente cria uma nova avaliação
export const createReview = async (req, res) => {
  try {
    const clientId = req.user.id;
    const { appointmentId, rating, comment } = req.body;

    const appointment = await Agendamento.findOne({
      where: { id: appointmentId, clientId: clientId, status: 'concluido' }
    });

    if (!appointment) {
      return res.status(404).json({ erro: 'Agendamento concluído não encontrado para este usuário.' });
    }

    const existingReview = await Review.findOne({ where: { appointmentId } });
    if (existingReview) {
      return res.status(409).json({ erro: 'Este agendamento já foi avaliado.' });
    }

    const newReview = await Review.create({
      rating,
      comment,
      appointmentId,
      clientId,
      companyId: appointment.companyId,
      professionalId: appointment.professionalId,
      status: 'pending'
    });

    logger.info('nova_avaliacao_criada', { reviewId: newReview.id, clientId });
    res.status(201).json(newReview);
  } catch (error) {
    logger.error('erro_criar_avaliacao', { error: error.message, stack: error.stack });
    res.status(500).json({ erro: 'Erro ao criar avaliação.' });
  }
};

// Admin da empresa aprova ou rejeita uma avaliação
export const updateReviewStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const companyId = req.user.companyId;

  try {
    const review = await Review.findOne({ where: { id, companyId } });
    if (!review) {
      return res.status(404).json({ erro: 'Avaliação não encontrada.' });
    }
    
    if (review.status !== status) {
        review.status = status;
        await review.save();
        await updateCompanyAverageRating(companyId);
    }

    res.json(review);
  } catch (error) {
    logger.error('[CONTROLLER] Erro ao atualizar status', { error: error.message });
    res.status(500).json({ erro: 'Erro ao atualizar status da avaliação.' });
  }
};


// Busca todas as avaliações APROVADAS de uma empresa
export const getCompanyReviews = async (req, res) => {
  try {
    const { companyId } = req.params;
    const reviews = await Review.findAll({
      where: { companyId, status: 'approved' },
      include: [
        { model: Login, as: 'client', attributes: ['nome'] },
        { model: Professional, as: 'professional', include: [{ model: Login, as: 'loginDetails', attributes: ['nome'] }] }
      ],
      // ===================================================================
      // CORREÇÃO APLICADA AQUI: Usando 'created_at' (snake_case)
      // ===================================================================
      order: [['created_at', 'DESC']]
    });
    res.json(reviews);
  } catch (error) {
    logger.error('erro_buscar_avaliacoes_empresa', { error: error.message });
    res.status(500).json({ erro: 'Erro ao buscar avaliações.' });
  }
};

// Admin da empresa busca TODAS as avaliações (para moderação)
export const getReviewsForAdmin = async (req, res) => {
  try {
    // ===================================================================
    // LOG DE DIAGNÓSTICO: Vamos descobrir qual companyId está vindo do token
    // ===================================================================
    const companyIdFromToken = req.user.companyId;
    logger.info(`[DIAGNÓSTICO] Tentando buscar avaliações para o companyId do token: ${companyIdFromToken}`);
    
    if (!companyIdFromToken) {
        logger.error("[DIAGNÓSTICO] ERRO CRÍTICO: O token do usuário admin NÃO contém um companyId!");
        return res.status(403).json({ erro: 'Usuário não parece ser um administrador de empresa válido.' });
    }

    const reviews = await Review.findAll({
      where: { companyId: companyIdFromToken }, // Usamos a variável para ter certeza
      include: [
        { model: Login, as: 'client', attributes: ['nome'] },
        { model: Professional, as: 'professional', include: [{ model: Login, as: 'loginDetails', attributes: ['nome'] }] }
      ],
      order: [['created_at', 'DESC']]
    });

    // ===== LOG 2: Verificando o resultado da busca no banco de dados =====
    logger.info(`[DIAGNÓSTICO] Encontradas ${reviews.length} avaliações para a empresa ID ${companyIdFromToken}`);

    res.json(reviews);
  } catch (error) {
    logger.error('erro_buscar_avaliacoes_admin', { error: error.message, stack: error.stack });
    res.status(500).json({ erro: 'Erro ao buscar avaliações para gerenciamento.' });
  }
};

