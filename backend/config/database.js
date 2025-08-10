import dotenv from 'dotenv';
dotenv.config();

// Configuração base para todos os ambientes
const config = {
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  dialect: 'postgres',
};

// Se o ambiente for 'production', ajusta a configuração para usar o Cloud SQL Socket.
// Caso contrário, usa o host de desenvolvimento.
if (process.env.NODE_ENV === 'production') {
  config.dialectOptions = {
    socketPath: process.env.DB_HOST // Ex: /cloudsql/project:region:instance
  };
} else {
  config.host = process.env.DB_HOST || 'localhost';
}

export default config;