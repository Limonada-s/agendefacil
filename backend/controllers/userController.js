import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../models/index.js'; 
import logger from '../logger.js';
import sendEmail from '../utils/sendEmail.js'; 
import { isValidCPF } from '../utils/validators.js';

const SECRET = process.env.JWT_SECRET;
const { Login, Empresa, Professional } = db;

const generateToken = (payload) => {
  return jwt.sign(payload, SECRET, { expiresIn: '2d' });
};

const register = async (req, res) => {
  const { nome, email, senha, cpf, telefone, data_nascimento } = req.body;
  
  if (!nome || !email || !senha || !cpf || !telefone || !data_nascimento) {
    return res.status(400).json({ erro: 'Todos os campos são obrigatórios' });
  }
  if (!isValidCPF(cpf)) {
    return res.status(400).json({ erro: 'O CPF informado é inválido.' });
  }

  try {
    const existe = await Login.findOne({ where: { email } });
    if (existe) {
      return res.status(400).json({ erro: 'Email já cadastrado' });
    }
    const cpfExiste = await Login.findOne({ where: { cpf } });
    if (cpfExiste) {
        return res.status(400).json({ erro: 'CPF já cadastrado' });
    }
    const hash = await bcrypt.hash(senha, 10);
    await Login.create({ nome, email, senha: hash, cpf, telefone, data_nascimento, tipo: 'cliente' });
    
    res.status(201).json({ mensagem: 'Cliente cadastrado com sucesso' });
  } catch (error) {
    logger.error('erro no registro de cliente', { error: error.message });
    res.status(500).json({ erro: 'Erro no registro' });
  }
};


// ===================================================================
// FUNÇÃO DE LOGIN CORRIGIDA E UNIFICADA (VERSÃO FINAL)
// ===================================================================
const login = async (req, res) => {
  const { email, senha } = req.body;
  try {
    let user = await Login.findOne({ where: { email, status: 'active' } });

    if (user) {
      const senhaValida = await bcrypt.compare(senha, user.senha);
      if (!senhaValida) {
        return res.status(401).json({ erro: 'Credenciais inválidas' });
      }
      
      const tokenPayload = { 
          id: user.id, 
          email: user.email, 
          nome: user.nome, 
          tipo: user.tipo 
      };

      if (user.tipo === 'admin' || user.tipo === 'professional') {
          let empresa;
          if (user.tipo === 'admin') {
              empresa = await Empresa.findOne({ where: { email_admin: user.email } });
          } else {
              const professionalProfile = await Professional.findOne({ 
                  where: { login_id: user.id },
                  include: [{ model: Empresa, as: 'empresa' }] 
              });
              empresa = professionalProfile?.empresa;
          }

          if (empresa) {
              if (empresa.status !== 'active' && empresa.subscriptionStatus !== 'past_due') {
                  return res.status(403).json({ erro: 'Acesso bloqueado. A empresa associada está inativa.' });
              }
              tokenPayload.companyId = empresa.id;
              tokenPayload.companyName = empresa.nome_empresa;
              tokenPayload.subscriptionStatus = empresa.subscriptionStatus;
          }
      }
      
      // ESPIÃO 1: VERIFICAR O PAYLOAD ANTES DE GERAR O TOKEN
      logger.info('[USER_CONTROLLER SPY] Payload final antes de gerar o token:', { payload: tokenPayload });
      
      const token = generateToken(tokenPayload);
      return res.status(200).json({ token, usuario: tokenPayload });
    }

    // Fallback
    user = await Empresa.findOne({ where: { email_admin: email } });
    if (!user) {
      return res.status(401).json({ erro: 'Credenciais inválidas' });
    }

    if (user.status !== 'active' && user.subscriptionStatus !== 'past_due') {
      return res.status(403).json({ erro: 'Acesso bloqueado. Esta empresa está inativa.' });
    }

    const senhaValida = await bcrypt.compare(senha, user.senha);
    if (!senhaValida) {
      return res.status(401).json({ erro: 'Credenciais inválidas' });
    }

    const tokenPayload = {
      id: user.id,
      email: user.email_admin,
      nome: user.nome_dono,
      tipo: 'admin',
      companyId: user.id,
      companyName: user.nome_empresa,
      subscriptionStatus: user.subscriptionStatus,
    };

    // ESPIÃO 1 (FALLBACK): VERIFICAR O PAYLOAD ANTES DE GERAR O TOKEN
    logger.info('[USER_CONTROLLER SPY - FALLBACK] Payload final antes de gerar o token:', { payload: tokenPayload });

    const token = generateToken(tokenPayload);
    return res.status(200).json({ token, usuario: tokenPayload });

  } catch (error) {
    logger.error('erro no login', { error: error.message });
    res.status(500).json({ erro: 'Erro no login' });
  }
};

export const loginSuperAdmin = async (req, res) => {
  const { email, senha } = req.body;
  const SUPER_ADMIN_EMAIL = process.env.SUPER_ADMIN_EMAIL;
  const SUPER_ADMIN_PASSWORD = process.env.SUPER_ADMIN_PASSWORD;

  if (!SUPER_ADMIN_EMAIL || !SUPER_ADMIN_PASSWORD) {
    logger.error('FATAL: Credenciais de Super Admin não configuradas no ambiente (.env)');
    return res.status(500).json({ erro: 'Erro de configuração do servidor.' });
  }

  if (email === SUPER_ADMIN_EMAIL && senha === SUPER_ADMIN_PASSWORD) {
    const tokenPayload = {
      id: 'superadmin',
      nome: 'Super Admin',
      email: SUPER_ADMIN_EMAIL,
      tipo: 'superadmin',
    };
    const token = generateToken(tokenPayload);
    return res.json({ token, usuario: tokenPayload });
  } else {
    logger.warn('tentativa_login_superadmin_falhou', { email });
    return res.status(401).json({ erro: 'Credenciais de Super Admin inválidas.' });
  }
};

const checkSession = (req, res) => {
  const token = req.cookies.token || (req.headers.authorization?.replace("Bearer ", ""));
  if (!token) {
    return res.status(401).json({ erro: 'Não autenticado' });
  }
  try {
    const user = jwt.verify(token, SECRET);
    res.json({ autenticado: true, usuario: user });
  } catch (err) {
    res.status(401).json({ erro: 'Token inválido ou expirado' });
  }
};

const logout = (req, res) => {
  res.clearCookie("token");
  res.json({ mensagem: "Logout feito com sucesso" });
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    let user = await Login.findOne({ where: { email } });
    if (!user) {
      return res.json({ mensagem: 'Se um usuário com este email existir, um link de redefinição foi enviado.' });
    }
    const resetToken = jwt.sign({ id: user.id, tipo: user.tipo }, SECRET, { expiresIn: '15m' });
    const resetUrl = `http://localhost:5173/reset-password?token=${resetToken}`;
    const message = `<h1>Redefinição de Senha</h1><p>Clique no link para redefinir sua senha:</p><a href="${resetUrl}" target="_blank">Redefinir Senha</a>`;
    await sendEmail({ email: email, subject: 'Link para Redefinição de Senha', html: message });
    res.json({ mensagem: 'Se um usuário com este email existir, um link de redefinição foi enviado.' });
  } catch (error) {
    logger.error('erro_forgot_password', { error: error.message });
    res.json({ mensagem: 'Se um usuário com este email existir, um link de redefinição foi enviado.' });
  }
};

export const resetPassword = async (req, res) => {
  const { token, novaSenha } = req.body;
  if (!token || !novaSenha) {
    return res.status(400).json({ erro: 'Token e nova senha são obrigatórios.' });
  }
  try {
    const decoded = jwt.verify(token, SECRET);
    const hash = await bcrypt.hash(novaSenha, 10);
    await Login.update({ senha: hash }, { where: { id: decoded.id } });
    
    res.json({ mensagem: 'Senha redefinida com sucesso! Você já pode fazer o login.' });
  } catch (error) {
    res.status(401).json({ erro: 'Token inválido ou expirado. Por favor, solicite um novo link.' });
  }
};

export default {
  SECRET,
  register,
  login,
  checkSession,
  logout,
  loginSuperAdmin,
  forgotPassword,
  resetPassword
};
