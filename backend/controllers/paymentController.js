import db from '../models/index.js';
import { addMonths } from 'date-fns';
import logger from '../logger.js';
import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET;
const { Empresa } = db;

const generateToken = (payload) => {
  return jwt.sign(payload, SECRET, { expiresIn: '2d' });
};

export const createCheckoutSession = async (req, res) => {
  const { plan } = req.body;
  const companyId = req.user?.companyId;

  if (!plan || !companyId) {
    return res.status(400).json({ message: "Plano e ID da empresa são obrigatórios." });
  }

  try {
    const companyToUpdate = await Empresa.findByPk(companyId);
    if (!companyToUpdate) {
      return res.status(404).json({ success: false, message: "Empresa não encontrada." });
    }

    // Atualiza a empresa no banco de dados (isso já está funcionando)
    companyToUpdate.plano = plan.toLowerCase();
    companyToUpdate.subscriptionStatus = 'active';
    companyToUpdate.status = 'active';
    companyToUpdate.subscriptionEndDate = addMonths(new Date(), 1);
    await companyToUpdate.save();

    // ===================================================================
    // LÓGICA CORRIGIDA: Gerar o novo token a partir dos dados que JÁ TEMOS.
    // Esta versão remove corretamente os campos de data antigos (iat, exp)
    // para que a biblioteca JWT possa gerar novos.
    // ===================================================================
    
    // 1. Desestruturamos o usuário do token antigo, capturando 'iat' e 'exp' para descartá-los.
    const { iat, exp, ...restOfUser } = req.user;

    // 2. Criamos o novo payload com o resto dos dados do usuário e o status atualizado.
    const newTokenPayload = {
        ...restOfUser, // Pega tudo do token antigo (id, email, nome, etc.), exceto iat e exp.
        subscriptionStatus: 'active', // ATUALIZA a única informação que mudou.
    };

    const newToken = generateToken(newTokenPayload);

    logger.info(`Empresa ${companyId} atualizada. Novo token gerado a partir dos dados existentes.`);
    
    // Envia o novo token na resposta
    res.json({ 
        success: true, 
        message: "Plano atualizado com sucesso!",
        newToken: newToken,
        newUser: newTokenPayload // O frontend precisa do objeto decodificado
    });

  } catch (error) {
    logger.error("[PAYMENT_CONTROLLER] Erro CRÍTICO no checkout:", { error: error.message, stack: error.stack });
    res.status(500).json({ success: false, message: "Erro interno do servidor." });
  }
};
