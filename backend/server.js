// Em: src/server.js

// Importações de Módulos
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';
import { v4 as uuid } from 'uuid';

// Carrega variáveis de ambiente do arquivo .env
dotenv.config();

// Módulos da Aplicação
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

// Configuração de caminhos de diretório (ESM)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Inicialização do Express
const app = express();

// --- Middlewares ---

// 1. Log de Requisições
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

// 2. CORS (Cross-Origin Resource Sharing)
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

// 3. Middlewares Padrão
app.use(cookieParser());
app.use(express.json());

// 4. Servir arquivos estáticos da pasta 'uploads'
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- Rotas da API ---
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

// --- Tratamento de Erros ---
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
    console.log("Tentando conectar ao banco de dados...");
    await db.sequelize.authenticate();
    console.log("✅ Conexão com o PostgreSQL estabelecida com sucesso!");

    // A porta é definida pela variável de ambiente PORT (fornecida pelo Cloud Run)
    // ou 5000 como padrão para desenvolvimento local.
    const PORT = process.env.PORT || 5000;
    
    server = app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando na porta ${PORT}`);
      logger.info(`Servidor iniciado na porta ${PORT} no ambiente ${process.env.NODE_ENV || 'development'}`);
      
      // Inicia tarefas agendadas
      startReminderScheduler(); 
    });

  } catch (error) {
    console.error("❌ Falha na inicialização do servidor:", error);
    logger.error("Falha na inicialização do servidor:", { message: error.message, stack: error.stack });
    process.exit(1); // Encerra o processo se não conseguir conectar ao DB
  }
};

// Garante que o servidor só inicie se não estiver em um ambiente de teste
if (process.env.NODE_ENV !== 'test') {
  startServer();
}

// Exporta para possíveis testes
export { app, server, db };
