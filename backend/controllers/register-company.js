import bcrypt from 'bcryptjs';
import db from '../models/index.js';
import logger from '../logger.js';
import axios from 'axios';
import { Op, fn, col } from 'sequelize';
import { isValidCPF, isValidCNPJ } from '../utils/validators.js';

const { Empresa, Categoria, Endereco, Servico, Login, Review } = db;

const cleanDocument = (doc) => (doc || '').toString().replace(/\D/g, '');

export const registerCompany = async (req, res) => {
  const transaction = await db.sequelize.transaction();
  try {
    const {
      nome_empresa,
      cnpj,
      nome_dono,
      cpf_dono,
      email_admin,
      telefone,
      senha,
      categorias,
      endereco: enderecoData
    } = req.body;
    if (process.env.NODE_ENV !== 'test') {
      // Se NÃO for ambiente de teste, executa a validação normalmente.
      if (!isValidCPF(cpf_dono)) {
        return res.status(400).json({ erro: 'O CPF informado é inválido.' });
      }
      if (!isValidCNPJ(cnpj)) {
        return res.status(400).json({ erro: 'O CNPJ informado é inválido.' });
      }
    }

    logger.info('📦 Início do registro de empresa', { nome_empresa, email_admin });

    if (!senha) {
        throw new Error("O campo 'senha' é obrigatório.");
    }

    const cleanCnpj = cleanDocument(cnpj);
    const cleanCpf = cleanDocument(cpf_dono);

    const existingCompany = await Empresa.findOne({
      where: {
        [Op.or]: [
          { cnpj: cleanCnpj },
          { email_admin: email_admin },
          { cpf_dono: cleanCpf }
        ]
      },
      transaction
    });

    if (existingCompany) {
      // Se encontrarmos um duplicado, revertemos a transação e enviamos um erro claro.
      await transaction.rollback();
      return res.status(400).json({ erro: 'Já existe uma conta com este Email, CNPJ ou CPF.' });
    }

    const hashedPassword = await bcrypt.hash(senha, 10);
    
    const endereco = await Endereco.create({ 
        rua: enderecoData.rua.trim(),
        numero: enderecoData.numero.trim(),
        bairro: enderecoData.bairro.trim(),
        city: enderecoData.city.trim(),
        state: enderecoData.state.trim(),
        zip_code: enderecoData.zipCode.trim()
    }, { transaction });

    let latitude = null;
    let longitude = null;

    const empresa = await Empresa.create({
      nome_empresa,
      cnpj: cleanCnpj, // Limpa o CNPJ
      nome_dono,
      cpf_dono: cleanCpf, // Limpa o CPF
      email_admin,
      telefone,
      senha: hashedPassword,
      endereco_id: endereco.id,
      latitude,
      longitude
    }, { transaction });

    await Login.create({
        nome: nome_dono,
        email: email_admin,
        senha: hashedPassword,
        telefone: telefone,
        tipo: 'admin',
        companyId: empresa.id
    }, { transaction });
    
    if (categorias && categorias.length > 0) {
      await empresa.setCategorias(categorias, { transaction });
    }

    await transaction.commit();

    return res.status(201).json({ sucesso: true, empresa });
  } catch (error) {
    await transaction.rollback();
    logger.error('❌ Erro ao registrar empresa', { error: error.message });
    
    let userMessage = 'Erro ao registrar empresa';
    if (error.name === 'SequelizeUniqueConstraintError') {
        userMessage = 'Já existe uma conta com este Email, CNPJ ou CPF.';
    }

    return res.status(500).json({
      erro: userMessage,
      detalhe: error.message
    });
  }
};

export const getEmpresaById = async (req, res) => {
  try {
    const { id } = req.params;
    const empresa = await Empresa.findByPk(id, {
      include: [
        { model: Categoria, as: 'categorias', through: { attributes: [] } },
        { model: Endereco, as: 'endereco' },
      ]
    });
    if (!empresa) {
      return res.status(404).json({ erro: 'Empresa não encontrada' });
    }
    res.json(empresa);
  } catch (error) {
    logger.error('Erro ao buscar empresa por ID', { error: error.message });
    res.status(500).json({ erro: 'Erro interno no servidor' });
  }
};

// Função para listar os SERVIÇOS de uma empresa
export const listarServicosDaEmpresa = async (req, res) => {
  try {
    const { empresaId } = req.params;
    const servicos = await Servico.findAll({ where: { companyId: empresaId } });
    res.json(servicos);
  } catch (error) {
    logger.error('Erro ao listar serviços da empresa', { error: error.message });
    res.status(500).json({ erro: 'Erro ao listar serviços' });
  }
};


export const listarEmpresasProximas = async (req, res) => {
  const { lat, lng, raio = 10 } = req.query;

  if (!lat || !lng) {
    return res.status(400).json({ erro: 'Latitude e longitude são obrigatórias.' });
  }

  const R = 6371; // Raio da Terra em km
  const toRad = (valor) => (valor * Math.PI) / 180;

  try {
    // 1. Buscamos TODAS as empresas ativas com todos os dados necessários
    // Usamos db.Empresa, db.Review, etc., para acessar os modelos corretamente.
    const todasAsEmpresas = await db.Empresa.findAll({
      where: {
        status: 'active',
        subscriptionStatus: { [Op.in]: ['active', 'trialing'] },
        latitude: { [Op.ne]: null },
        longitude: { [Op.ne]: null }
      },
      attributes: {
        include: [
          [fn('COALESCE', fn('AVG', col('reviews.rating')), 0), 'averageRating'],
          [fn('COUNT', fn('DISTINCT', col('reviews.id'))), 'totalReviews']
        ]
      },
      include: [
        {
          model: db.Review, // Usado para calcular a média de notas (rating)
          as: 'reviews',
          attributes: [],
          where: { status: 'approved' },
          required: false
        },
        {
          model: db.Servico, // Usado para listar os serviços de cada empresa
          as: 'servicos',
          attributes: ['id', 'name'],
          required: false
        },
        {
          model: db.Endereco, // Usado para obter os detalhes do endereço
          as: 'endereco',
          attributes: ['rua', 'numero', 'bairro', 'city'],
          required: true // Só queremos empresas com endereço cadastrado
        }
      ],
      group: ['Empresa.id', 'servicos.id', 'endereco.id'],
      order: [['id', 'DESC']]
    });

    // 2. Filtramos as empresas pela distância (lógica de Haversine)
    const empresasProximas = todasAsEmpresas.filter(emp => {
      const dLat = toRad(emp.latitude - lat);
      const dLng = toRad(emp.longitude - lng);
      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat)) * Math.cos(toRad(emp.latitude)) *
        Math.sin(dLng / 2) ** 2;
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distancia = R * c;
      return distancia <= raio;
    });

    // 3. Limpamos e estruturamos os dados para evitar duplicatas causadas pelo JOIN com serviços
    const resultadoFinal = empresasProximas.reduce((acc, current) => {
      let empresa = acc.find(item => item.id === current.id);
      
      if (!empresa) {
        const empresaData = current.get({ plain: true });
        empresaData.averageRating = parseFloat(empresaData.averageRating);
        empresaData.totalReviews = parseInt(empresaData.totalReviews, 10);
        
        empresaData.servicos = [];
        if (empresaData['servicos.id']) {
            empresaData.servicos.push({id: empresaData['servicos.id'], name: empresaData['servicos.name']})
        }
        
        delete empresaData['servicos.id'];
        delete empresaData['servicos.name'];

        acc.push(empresaData);
      } else {
        const servicoExistente = empresa.servicos.find(s => s.id === current.dataValues['servicos.id']);
        if (!servicoExistente && current.dataValues['servicos.id']) {
            empresa.servicos.push({ id: current.dataValues['servicos.id'], name: current.dataValues['servicos.name'] });
        }
      }
      return acc;
    }, []);

    // logger.info('📌 Empresas próximas encontradas', { total: resultadoFinal.length });
    res.status(200).json(resultadoFinal);

  } catch (err) {
    // logger.error('❌ Erro ao buscar empresas próximas', { error: err.message, stack: err.stack });
    console.error('Erro ao buscar empresas próximas:', err);
    res.status(500).json({ erro: 'Erro ao buscar empresas', detalhe: err.message });
  }
};
export const updateCompanySettings = async (req, res) => {
  try {
    // O middleware 'autenticarEmpresa' já validou o token e adicionou os dados do usuário a req.user
    // O ID da empresa vem do token do usuário logado.
    const companyId = req.user.id; 

    const empresa = await Empresa.findByPk(companyId);

    if (!empresa) {
      logger.warn('update_settings - empresa não encontrada', { companyId });
      return res.status(404).json({ erro: 'Empresa não encontrada.' });
    }

    // Atualiza a empresa com os novos dados recebidos do formulário
    // O req.body contém { nome_empresa, description, telefone, etc. }
    await empresa.update(req.body);

    logger.info('⚙️ Configurações da empresa atualizadas', { companyId });
    res.status(200).json(empresa);

  } catch (error) {
    logger.error('❌ Erro ao atualizar configurações', { 
      error: error.message,
      stack: error.stack,
      userId: req.user?.id
    });
    res.status(500).json({ erro: 'Erro ao salvar as configurações.' });
  }
};

export const cancelCompanyAccount = async (req, res) => {
  try {
    const companyId = req.user.companyId;
    const adminEmail = req.user.email;

    if (!companyId || !adminEmail) {
      return res.status(400).json({ erro: 'Informações de autenticação inválidas.' });
    }

    const empresa = await db.Empresa.findByPk(companyId);
    if (!empresa) {
      return res.status(404).json({ erro: 'Empresa não encontrada.' });
    }

    empresa.status = 'inactive';
    empresa.subscriptionStatus = 'canceled'; // Atualiza também o status da assinatura
    await empresa.save();

    // 2. Inativa o login do admin
    await db.Login.update({ status: 'inactive' }, { where: { email: adminEmail, tipo: 'admin' } });
    
    // Opcional: Inativar todos os profissionais da empresa
    await db.Professional.update({ status: 'inactive' }, { where: { empresa_id: companyId } });
    // ----------------------------

    logger.info('conta_empresa_inativada', { companyId, adminEmail });
    res.status(200).json({ mensagem: 'Sua conta e todos os dados foram desativados com sucesso.' });

  } catch (error) {
    logger.error('erro_cancelar_conta_empresa', { error: error.message, userId: req.user?.id });
    res.status(500).json({ erro: 'Erro ao processar o cancelamento da conta.' });
  }
};

