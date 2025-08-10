require('dotenv').config();

module.exports = {
  // Configuração para o ambiente de DESENVOLVIMENTO
  development: {
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST || '127.0.0.1',
    dialect: 'postgres'
  },
  
  // Configuração para o ambiente de TESTE
  test: {
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME_TEST || 'database_test',
    host: '127.0.0.1',
    dialect: 'postgres'
  },

  // Configuração para o ambiente de PRODUÇÃO
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    dialect: 'postgres',
    
    // --- A TRAPAÇA FINAL ---
    // Definimos 'host' como undefined para tentar impedir que o Sequelize
    // adicione 'localhost' como padrão.
    host: undefined,

    dialectOptions: {
      // A conexão DEVE usar este socket.
      socketPath: process.env.DB_HOST 
    }
  }
};
