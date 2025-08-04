import db from '../models/index.js';
import logger from '../logger.js';

const { Empresa, Categoria } = db;

export const listarCategoriasDaEmpresa = async (req, res) => {
  try {
    const empresaId = req.user.companyId;

    if (!empresaId) {
      logger.warn('listar_categorias - companyId ausente no token', {
        userId: req.user?.id,
        tipo: req.user?.tipo
      });
      return res.status(400).json({ erro: 'ID da empresa não encontrado no token.' });
    }

    const empresa = await Empresa.findByPk(empresaId, {
      include: {
        model: Categoria,
        as: 'categorias',
        through: { attributes: [] }
      }
    });

    if (!empresa) {
      logger.warn('listar_categorias - empresa não encontrada', { empresaId });
      return res.status(404).json({ erro: 'Empresa não encontrada.' });
    }

    logger.info('categorias_listadas_empresa', {
      empresaId,
      total: empresa.categorias?.length || 0
    });

    return res.json(empresa.categorias);
  } catch (err) {
    logger.error('erro_listar_categorias_empresa', {
      error: err.message,
      stack: err.stack,
      userId: req.user?.id
    });

    return res.status(500).json({ erro: 'Erro interno ao buscar categorias.' });
  }
};
