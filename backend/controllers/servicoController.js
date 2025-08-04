import db from '../models/index.js';
import logger from '../logger.js';

const { Servico, Empresa, Categoria, Professional, Login } = db;

const listarServicos = async (req, res) => {
  try {
    const companyId = req.params.empresaId;

    const servicos = await Servico.findAll({ where: { companyId } });

    logger.info('listar_servicos', {
      companyId,
      userId: req.user?.id,
      total: servicos.length
    });

    res.json(servicos);
  } catch (err) {
    logger.error('erro ao listar serviços', {
      error: err.message,
      stack: err.stack,
      userId: req.user?.id
    });
    res.status(500).json({ erro: 'Erro ao listar serviços' });
  }
};

const criarServico = async (req, res) => {
  try {
    const { name, description, duration, price, image, categoryId = null, professionals_ids } = req.body;
    const companyId = req.user.companyId;

    if (!companyId || !name || !price) {
      return res.status(400).json({ erro: 'Campos obrigatórios ausentes.' });
    }

    const dataToCreate = { name, description, duration, price, image, companyId };
    if (categoryId) {
      dataToCreate.categoryId = categoryId;
    }

    const servico = await Servico.create(dataToCreate);

    if (professionals_ids && professionals_ids.length > 0) {
      await servico.setProfissionais(professionals_ids);
    }

    logger.info('servico_criado', { serviceId: servico.id, name });
    res.status(201).json(servico);
  } catch (err) {
    logger.error('erro ao criar serviço', { error: err.message });
    res.status(500).json({ erro: 'Erro ao criar serviço' });
  }
};

const atualizarServico = async (req, res) => {
  try {
    const { id } = req.params;
    // ===== ADIÇÃO: Recebendo a lista de IDs de profissionais =====
    const { name, description, duration, price, image, categoryId = null, professionals_ids } = req.body;
    const servico = await Servico.findByPk(id);
    if (!servico) {
      return res.status(404).json({ erro: 'Serviço não encontrado.' });
    }

    const dataToUpdate = { name, description, duration, price, image };
    if (categoryId) {
      dataToUpdate.categoryId = categoryId;
    }
    await servico.update(dataToUpdate);
    if (professionals_ids !== undefined) {
        await servico.setProfissionais(professionals_ids);
    }

    logger.info('servico_atualizado', { serviceId: id });
    res.json(servico);
  } catch (err) {
    logger.error('erro ao atualizar serviço', { error: err.message });
    res.status(500).json({ erro: 'Erro ao atualizar serviço' });
  }
};

const excluirServico = async (req, res) => {
  try {
    const { id } = req.params;
    const servico = await Servico.findByPk(id);

    if (!servico) {
      logger.warn('servico_nao_encontrado_para_exclusao', {
        serviceId: id,
        userId: req.user?.id
      });
      return res.status(404).json({ erro: 'Serviço não encontrado.' });
    }

    await servico.destroy();

    logger.info('servico_excluido', {
      serviceId: id,
      userId: req.user.id
    });

    res.json({ mensagem: 'Serviço excluído com sucesso.' });
  } catch (err) {
    logger.error('erro ao excluir serviço', {
      error: err.message,
      stack: err.stack,
      serviceId: req.params?.id,
      userId: req.user?.id
    });
    res.status(500).json({ erro: 'Erro ao excluir serviço' });
  }
};
export const getProfessionalsForService = async (req, res) => {
  try {
    const { id } = req.params;
    const servico = await Servico.findByPk(id, {
      include: [{
        model: Professional,
        as: 'profissionais',
        attributes: ['id'],
        include: [{ model: Login, as: 'loginDetails', attributes: ['nome'] }]
      }]
    });
    if (!servico) {
      return res.status(404).json({ erro: 'Serviço não encontrado.' });
    }
    res.json(servico.profissionais || []);
  } catch (error) {
    logger.error('erro_get_professionals_for_service', { error: error.message });
    res.status(500).json({ erro: 'Erro ao buscar profissionais.' });
  }
};

// Garantindo que a nova função seja exportada junto com as outras
export default {
  listarServicos,
  criarServico,
  atualizarServico,
  excluirServico,
  getProfessionalsForService // Adicionado aqui
};
