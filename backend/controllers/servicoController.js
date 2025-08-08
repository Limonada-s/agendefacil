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

export const criarServico = async (req, res) => {
    try {
        const companyId = req.user.companyId; // ID da empresa logada (do token)
        // Inclui a captura de 'professionals_ids' do corpo da requisição
        const { name, description, duration, price, categoryId, professionals_ids } = req.body;

        if (!name || !price || !duration) {
            return res.status(400).json({ erro: 'Nome, preço e duração são obrigatórios.' });
        }

        const data = {
            name,
            description,
            duration,
            price,
            companyId,
            categoryId
        };

        // Adiciona a imagem se ela for enviada no formulário (via multer)
        if (req.file) {
            data.image = req.file.path; 
        }

        const servico = await Servico.create(data);

        // Associa os profissionais ao serviço, se os IDs forem fornecidos
        if (professionals_ids && Array.isArray(professionals_ids) && professionals_ids.length > 0) {
            // O método 'setProfissionais' é gerado pelo Sequelize para associações Many-to-Many
            await servico.setProfissionais(professionals_ids);
        }

        logger.info('✔️ Serviço criado com sucesso', { serviceId: servico.id, companyId });
        res.status(201).json(servico);

    } catch (error) {
        logger.error('❌ Erro ao criar serviço', { 
            error: error.message, 
            companyId: req.user.companyId 
        });
        res.status(500).json({ erro: 'Erro interno ao criar o serviço.' });
    }
};

export const atualizarServico = async (req, res) => {
    try {
        const { servicoId } = req.params;
        const companyId = req.user.companyId;
        const updateData = req.body;

        const servico = await Servico.findOne({ where: { id: servicoId, companyId } });

        if (!servico) {
            return res.status(404).json({ erro: 'Serviço não encontrado ou não pertence à sua empresa.' });
        }

        // Passo 5: Atualiza a imagem se uma nova for enviada
        if (req.file) {
            updateData.image = req.file.path;
        }

        await servico.update(updateData);

        logger.info('✔️ Serviço atualizado com sucesso', { serviceId });
        res.status(200).json(servico);

    } catch (error) {
        logger.error('❌ Erro ao atualizar serviço', { 
            error: error.message, 
            serviceId: req.params.servicoId 
        });
        res.status(500).json({ erro: 'Erro interno ao atualizar o serviço.' });
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
