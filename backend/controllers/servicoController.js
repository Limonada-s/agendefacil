import db from '../models/index.js';
import logger from '../logger.js';

const { Servico, Empresa, Categoria, Professional, Login } = db;


const getImageUrl = (req, filePath) => {
    if (!filePath) return null;
    const normalizedPath = filePath.replace(/\\/g, "/"); // Garante que as barras sejam '/'
    return `${req.protocol}://${req.get('host')}/${normalizedPath}`;
}

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
            data.image = getImageUrl(req, req.file.path); 
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
        const { id } = req.params;
        const companyId = req.user.companyId;
        const { professionals_ids, ...updateData } = req.body;

        // Usa a variável 'id' corrigida para encontrar o serviço.
        const servico = await Servico.findOne({ where: { id: id, companyId } });

        if (!servico) {
            return res.status(404).json({ erro: 'Serviço não encontrado ou não pertence à sua empresa.' });
        }

        // Atualiza a imagem se uma nova for enviada
        if (req.file) {
            updateData.image = getImageUrl(req, req.file.path);
        }

        await servico.update(updateData);

        if (professionals_ids && Array.isArray(professionals_ids)) {
            await servico.setProfissionais(professionals_ids);
        }

        logger.info('✔️ Serviço atualizado com sucesso', { serviceId: id });
        res.status(200).json(servico);

    } catch (error) {
        logger.error('❌ Erro ao atualizar serviço', { 
            error: error.message, 
            serviceId: req.params.id 
        });
        res.status(500).json({ erro: 'Erro interno ao atualizar o serviço.' });
    }
};

export const excluirServico = async (req, res) => {
    const { id } = req.params;
    const companyId = req.user.companyId;
    try {
        const servico = await Servico.findOne({ where: { id, companyId } });

        if (!servico) {
            return res.status(404).json({ erro: 'Serviço não encontrado ou não pertence à sua empresa.' });
        }

        // Deleta a imagem do disco se ela existir
        if (servico.image) {
            const imagePath = path.join(process.cwd(), new URL(servico.image).pathname);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        await servico.destroy();
        logger.info('✔️ Serviço excluído com sucesso', { serviceId: id, companyId });
        res.status(200).json({ mensagem: 'Serviço excluído com sucesso.' });
    } catch (error) {
        logger.error('❌ Erro ao excluir serviço', { error: error.message, serviceId: id });
        res.status(500).json({ erro: 'Erro ao excluir o serviço.' });
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
