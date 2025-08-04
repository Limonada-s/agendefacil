import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../models/index.js';

const { Empresas } = db;
const SECRET = process.env.JWT_SECRET;



export const loginEmpresa = async (req, res) => {
  const { email, senha } = req.body;
  try {
    const empresa = await Empresas.findOne({ where: { email_admin: email } });
    if (!empresa) return res.status(400).json({ erro: 'Empresa não encontrada' });

    const senhaValida = await bcrypt.compare(senha, empresa.senha);
    if (!senhaValida) return res.status(401).json({ erro: 'Senha inválida' });

    // 🛠️ Garante que o token tenha todos os dados
    const tokenPayload = {
      id: empresa.id,
      email: empresa.email_admin,
      tipo: 'admin',
      companyId: empresa.id // 🔥 ESSENCIAL
    };

    const token = jwt.sign(tokenPayload, SECRET, { expiresIn: '2d' });

    // 🧠 Armazena o token no cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 2 * 24 * 60 * 60 * 1000
    });

    res.status(200).json({
      mensagem: 'Login empresa ok',
      empresa: {
        id: empresa.id,
        nome: empresa.nome_empresa,
        email: empresa.email_admin,
        companyId: empresa.id,
        tipo: 'admin'
      },
      token
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: 'Erro no login da empresa' });
  }
};
