// Arquivo: backend/config/config.cjs
// ESTA É A ÚNICA FONTE DE VERDADE PARA A CONFIGURAÇÃO DO BANCO DE DADOS.

require('dotenv').config();

module.exports = {
  // Configuração para o ambiente de DESENVOLVIMENTO
  development: {
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST || '127.0.0.1', // Garante que o padrão seja localhost
    dialect: 'postgres'
  },
  
  // Configuração para o ambiente de TESTE (pode ser ajustada conforme necessário)
  test: {
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME_TEST || 'database_test',
    host: '127.0.0.1',
    dialect: 'postgres'
  },

  // Configuração para o ambiente de PRODUÇÃO (Google Cloud Run)
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    dialect: 'postgres',
    // Opções específicas do dialeto para produção
    dialectOptions: {
      // O Sequelize usará este socket para se conectar ao Cloud SQL
      socketPath: process.env.DB_HOST 
    }
    // IMPORTANTE: Não defina 'host' aqui. A presença de 'socketPath'
    // faz com que o Sequelize ignore o 'host' e 'port'.
  }
};