// Arquivo: src/config/database.js
// ESTA É A VERSÃO DEFINITIVA. ELA REMOVE EXPLICITAMENTE O 'HOST' EM PRODUÇÃO.
// SUBSTITUA TODO O CONTEÚDO DO SEU FICHEIRO POR ESTE.

import dotenv from 'dotenv';
dotenv.config();

let dbConfig;
const env = process.env.NODE_ENV;

if (env === 'production') {
  // --- Configuração de Produção ---
  dbConfig = {
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    dialect: 'postgres',
    dialectOptions: {
      socketPath: process.env.DB_HOST // Ex: /cloudsql/project:region:instance
    }
  };
} else {
  // --- Configuração de Desenvolvimento ---
  dbConfig = {
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST || 'localhost',
    dialect: 'postgres'
  };
}

export default dbConfig;