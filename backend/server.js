// Arquivo: src/server.js
// ADICIONADO LOG DE DEPURAÇÃO ANTES DO AUTHENTICATE

// ... (todo o seu código de importação e middlewares continua igual) ...
// Importações de Módulos
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';
import { v4 as uuid } from 'uuid';

dotenv.config();

import db from "./models/index.js"; 
import logger from './logger.js';
import { startReminderScheduler } from './scheduler/appointmentScheduler.js';

// Importação de Rotas
import userRoutes from './routes/userRoutes.js';
import agendamentoRoutes from './routes/agendamentoRoutes.js';
import servicosRoute from './routes/servicosRoute.js';
import empresaRoutes from './routes/empresaRoutes.js'; 
import categoriaRoutes from './routes/categoriaRoutes.js';
import professionalRoutes from './routes/professionalRoutes.js';
import financialsRoutes from './routes/financialsRoutes.js'
import sessionTestRoute from './routes/sessionTestRoute.js';
import superAdminRoutes from './routes/superAdminRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// ... (todos os seus middlewares continuam aqui) ...
app.use((req, res, next) => {
  const requestId = uuid();
  res.locals.requestId = requestId;
  const start = Date.now();
  res.on('finish', () => {
    logger.info('request_log', {
      requestId,
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: Date.now() - start
    });
  });
  next();
});
const allowedOrigins = ['http://localhost:5173', 'https://agendefacil.vercel.app'];
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(cookieParser());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ... (todas as suas rotas continuam aqui) ...
app.use('/api/superadmin', superAdminRoutes);
app.use('/api/users', userRoutes); 
app.use('/api/payments', paymentRoutes);
app.use('/api/agendamentos', agendamentoRoutes);
app.use('/api/servicos', servicosRoute);  
app.use('/api/reviews', reviewRoutes);
app.use('/api/empresas', empresaRoutes); 
app.use('/api/categorias', categoriaRoutes);
app.use('/api/profissionais', professionalRoutes);
app.use('/api/financials', financialsRoutes);
app.use('/api', sessionTestRoute); 

app.use((err, req, res, next) => {
  logger.error('error_log', {
    requestId: res.locals.requestId,
    message: err.message,
    stack: err.stack
  });
  res.status(500).json({ error: 'Erro interno no servidor.' });
});


// --- Inicialização do Servidor ---
let server;

const startServer = async () => {
  try {
    console.log("--- [LOG] 9. Em server.js, ANTES de chamar authenticate. Inspecionando db.sequelize.options:");
    console.log(JSON.stringify(db.sequelize.options, null, 2));

    console.log("Tentando conectar ao banco de dados...");
    await db.sequelize.authenticate();
    console.log("✅ Conexão com o PostgreSQL estabelecida com sucesso!");

    const PORT = process.env.PORT || 5000;
    
    server = app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando na porta ${PORT}`);
      logger.info(`Servidor iniciado na porta ${PORT} no ambiente ${process.env.NODE_ENV || 'development'}`);
      startReminderScheduler(); 
    });

  } catch (error) {
    console.error("❌ Falha na inicialização do servidor:", error);
    logger.error("Falha na inicialização do servidor:", { message: error.message, stack: error.stack });
    process.exit(1);
  }
};

if (process.env.NODE_ENV !== 'test') {
  startServer();
}

export { app, server, db };
