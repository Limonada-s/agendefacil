import express from 'express';
import jwt from 'jsonwebtoken';

const router = express.Router();
const SECRET = process.env.JWT_SECRET || 'seuSegredoSuperSeguro';

// Rota de teste de sessão
router.get('/session', (req, res) => {
  const token = req.cookies.token || (req.headers.authorization && req.headers.authorization.replace("Bearer ", ""));
  if (!token) return res.status(401).json({ erro: 'Token ausente' });

  try {
    const user = jwt.verify(token, SECRET);
    res.json({ autenticado: true, usuario: user });
  } catch (err) {
    res.status(401).json({ erro: 'Token inválido ou expirado' });
  }
});

export default router;
