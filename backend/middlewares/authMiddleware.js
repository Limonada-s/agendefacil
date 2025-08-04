import jwt from 'jsonwebtoken';
const SECRET = process.env.JWT_SECRET || "9gH!rC7V@qLsP3zF$eW2xM8dU^jN6kL0bT%yS5cV*oR1mG4hJ!iE7wQ2pZ8X0";

export const autenticarEmpresa = (req, res, next) => {
  const token = req.cookies.token || req.headers.authorization?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ erro: "Token ausente" });

  try {
    const payload = jwt.verify(token, SECRET);

    if (payload.tipo !== 'admin') {
      return res.status(403).json({ erro: "Acesso negado para empresa" });
    }

    req.user = payload;
    next();
  } catch (err) {
    res.status(401).json({ erro: "Token inválido" });
  }
};

export const autenticarCliente = (req, res, next) => {
  const token = req.cookies.token || req.headers.authorization?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ erro: "Token ausente" });

  try {
    const payload = jwt.verify(token, SECRET);

    // ===== A CORREÇÃO ESTÁ AQUI =====
    // A verificação agora procura por 'cliente', que é o novo padrão do sistema.
    if (payload.tipo !== 'cliente') {
      return res.status(403).json({ erro: "Acesso negado para cliente" });
    }

    req.user = payload;
    next();
  } catch (err) {
    res.status(401).json({ erro: "Token inválido" });
  }
};

export const protect = (req, res, next) => {
  const token = req.cookies.token || req.headers.authorization?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ erro: "Não autenticado, token ausente." });
  }

  try {
    const payload = jwt.verify(token, SECRET);
    req.user = payload;
    next();
  } catch (err) {
    res.status(401).json({ erro: "Token inválido ou expirado." });
  }
};

export const autenticarSuperAdmin = (req, res, next) => {
  const token = req.cookies.token || req.headers.authorization?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ erro: "Não autenticado, token ausente." });
  }

  try {
    const payload = jwt.verify(token, SECRET);

    if (payload.tipo !== 'superadmin') {
      return res.status(403).json({ erro: "Acesso negado. Rota exclusiva para Super Admin." });
    }

    req.user = payload;
    next();
  } catch (err) {
    res.status(401).json({ erro: "Token inválido ou expirado." });
  }
};
