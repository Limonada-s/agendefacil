import express from "express";
import db from "./models/index.js"; 
import fileupload from 'express-fileupload';
import cors from "cors";
import cookieParser from "cookie-parser";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';
import logger from './logger.js';
import { v4 as uuid } from 'uuid';
import { startReminderScheduler } from './scheduler/appointmentScheduler.js'
import dotenv from 'dotenv';


dotenv.config();
import { runSeed } from './seeders/run-seed.js';

// Importação de rotas
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

// Middleware de log de requisições
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

// Middlewares
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(cookieParser());
app.use(express.json());
app.use(fileupload({ useTempFiles: true, tempFileDir: path.join(__dirname, 'temp') }));

// Rotas da API
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

app.use(express.static(path.join(__dirname, 'dist')));

app.get('/*any', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});
app.use((err, req, res, next) => {
  logger.error('error_log', {
    requestId: res.locals.requestId,
    message: err.message,
    stack: err.stack
  });
  res.status(500).json({ error: 'Erro interno no servidor' });
});

let server 

const start = async () => {
  try {
    await db.sequelize.authenticate();
    console.log("Conectado ao PostgreSQL!");

    // Apenas em ambiente de desenvolvimento, recriamos o banco e populamos
    if (process.env.NODE_ENV !== 'production') {
      await db.sequelize.sync({ force: true });
      console.log("Banco de dados FORÇADAMENTE sincronizado.");
      await runSeed();
    }

    const PORT = process.env.PORT || 5000;
    server = app.listen(PORT, () => {
      console.log(`Rodando na porta ${PORT}`);
      startReminderScheduler(); 
      logger.info("Servidor iniciado.");
    });

  } catch (error) {
    console.error("Erro na inicialização do servidor:", error);
  }
};

// Esta verificação garante que o servidor só inicie quando rodamos "node server.js"
// e não quando ele é importado por um teste.
if (process.env.NODE_ENV !== 'test') {
  start();
}

// Exportamos o 'app' para os testes e o 'server' para podermos desligá-lo.
export { app, server, db };