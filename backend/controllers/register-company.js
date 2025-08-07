import bcrypt from 'bcryptjs';
import db from '../models/index.js';
import logger from '../logger.js';
import axios from 'axios';
import { Op, fn, col, literal } from 'sequelize'; // Importar 'literal'
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

    // ===== ETAPA DE GEOCODIFICAÇÃO =====
    let latitude = null;
    let longitude = null;
    const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

    if (GOOGLE_MAPS_API_KEY) {
        const fullAddress = `${endereco.rua}, ${endereco.numero}, ${endereco.bairro}, ${endereco.city}, ${endereco.state}`;
        try {
            const geocodeResponse = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
                params: {
                    address: fullAddress,
                    key: GOOGLE_MAPS_API_KEY
                }
            });

            if (geocodeResponse.data.status === 'OK' && geocodeResponse.data.results[0]) {
                const location = geocodeResponse.data.results[0].geometry.location;
                latitude = location.lat;
                longitude = location.lng;
                logger.info('Geocodificação bem-sucedida', { lat: latitude, lng: longitude });
            } else {
                logger.warn('Falha na geocodificação', { address: fullAddress, status: geocodeResponse.data.status });
            }
        } catch(geoError) {
            logger.error('Erro na chamada da API de Geocodificação', { error: geoError.message });
        }
    } else {
        logger.warn('Chave da API do Google Maps não configurada. A geocodificação foi pulada.');
    }
    // =========================================

    const empresa = await Empresa.create({
      nome_empresa,
      cnpj: cleanCnpj,
      nome_dono,
      cpf_dono: cleanCpf,
      email_admin,
      telefone,
      senha: hashedPassword,
      endereco_id: endereco.id,
      latitude, // Salva a latitude obtida
      longitude // Salva a longitude obtida
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

// ===== FUNÇÃO REESCRITA E OTIMIZADA =====
export const listarEmpresasProximas = async (req, res) => {
  const { lat, lng, raio = 10 } = req.query;

  if (!lat || !lng) {
    return res.status(400).json({ erro: 'Latitude e longitude são obrigatórias.' });
  }

  try {
    // A fórmula de Haversine para calcular a distância em Km.
    // Isso será injetado diretamente na consulta SQL.
    const haversine = `(
      6371 * acos(
        cos(radians(${lat}))
        * cos(radians(latitude))
        * cos(radians(longitude) - radians(${lng}))
        + sin(radians(${lat}))
        * sin(radians(latitude))
      )
    )`;

    const empresas = await db.Empresa.findAll({
      attributes: {
        include: [
          // Inclui um novo campo 'distancia' no resultado
          [literal(haversine), 'distancia'],
          [fn('COALESCE', fn('AVG', col('reviews.rating')), 0), 'averageRating'],
          [fn('COUNT', fn('DISTINCT', col('reviews.id'))), 'totalReviews']
        ]
      },
      where: {
        // Filtra diretamente no banco de dados, trazendo apenas empresas dentro do raio
        [Op.and]: [
          literal(`${haversine} <= ${raio}`),
          { status: 'active' },
          { subscriptionStatus: { [Op.in]: ['active', 'trialing'] } },
          { latitude: { [Op.ne]: null } },
          { longitude: { [Op.ne]: null } }
        ]
      },
      include: [
        {
          model: db.Review,
          as: 'reviews',
          attributes: [],
          where: { status: 'approved' },
          required: false
        },
        {
          model: db.Servico,
          as: 'servicos',
          attributes: ['id', 'name'],
          required: false
        },
        {
          model: db.Endereco,
          as: 'endereco',
          attributes: ['rua', 'numero', 'bairro', 'city'],
          required: true
        }
      ],
      group: ['Empresa.id', 'endereco.id', 'servicos.id'], // Agrupa por empresa para evitar duplicação de empresa
      order: literal('distancia ASC'), // Ordena pela distância, as mais próximas primeiro
      subQuery: false // Necessário para que o group e include funcionem corretamente com o literal
    });

    // O resultado pode conter empresas duplicadas por causa do JOIN com serviços.
    // Vamos agregar os resultados em JavaScript.
    const resultadoAgregado = empresas.reduce((acc, current) => {
      const empresaData = current.get({ plain: true });
      let empresaExistente = acc.find(e => e.id === empresaData.id);

      if (!empresaExistente) {
        // Se a empresa não está no acumulador, adiciona-a com seu primeiro serviço
        empresaExistente = {
            ...empresaData,
            servicos: empresaData.servicos ? [empresaData.servicos] : []
        };
        acc.push(empresaExistente);
      } else {
        // Se a empresa já existe, apenas adiciona o novo serviço se ele não estiver lá
        const servicoJaExiste = empresaExistente.servicos.some(s => s.id === empresaData.servicos.id);
        if (empresaData.servicos && !servicoJaExiste) {
            empresaExistente.servicos.push(empresaData.servicos);
        }
      }
      return acc;
    }, []);

    res.status(200).json(resultadoAgregado);

  } catch (err) {
    console.error('Erro ao buscar empresas próximas:', err);
    res.status(500).json({ erro: 'Erro ao buscar empresas', detalhe: err.message });
  }
};

export const getEmpresaById = async (req, res) => {
  try {
    const { id } = req.params;
    const empresa = await Empresa.findByPk(id, {
      include: [
        { model: Categoria, as: 'categorias', through: { attributes: [] } },
        { model: Endereco, as: 'endereco' },
        { model: Servico, as: 'servicos', attributes: ['id', 'name', 'price', 'duration'] },
        { model: Review, as: 'reviews', include: [{ model: Login, as: 'client', attributes: ['nome'] }] }
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

export const updateCompanySettings = async (req, res) => {
  try {
    const companyId = req.user.id; 
    const empresa = await Empresa.findByPk(companyId);

    if (!empresa) {
      logger.warn('update_settings - empresa não encontrada', { companyId });
      return res.status(404).json({ erro: 'Empresa não encontrada.' });
    }
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
    empresa.subscriptionStatus = 'canceled';
    await empresa.save();

    await db.Login.update({ status: 'inactive' }, { where: { email: adminEmail, tipo: 'admin' } });
    await db.Professional.update({ status: 'inactive' }, { where: { empresa_id: companyId } });

    logger.info('conta_empresa_inativada', { companyId, adminEmail });
    res.status(200).json({ mensagem: 'Sua conta e todos os dados foram desativados com sucesso.' });

  } catch (error) {
    logger.error('erro_cancelar_conta_empresa', { error: error.message, userId: req.user?.id });
   res.status(500).json({ erro: 'Erro ao processar o cancelamento da conta.' });
 }
};
