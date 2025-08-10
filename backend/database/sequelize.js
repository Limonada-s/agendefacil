import { Sequelize } from "sequelize";
import dbConfig from "../config/database.js"; // Este import agora vai ler a configuração correta
import logger from "../logger.js";

// Passa a configuração completa para o Sequelize.
// O operador spread (...) garante que todas as opções, incluindo dialectOptions, sejam passadas.
export const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    ...dbConfig, // <-- AQUI ESTÁ A CORREÇÃO MÁGICA
    logging: (msg) => logger.debug(msg),
  }
);
