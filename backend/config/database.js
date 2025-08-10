import dotenv from 'dotenv';
dotenv.config();

// Configuração base
const config = {
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  host: process.env.DB_HOST || 'localhost',
  dialect: 'postgres',
};

// Se o ambiente for 'production', ajusta a configuração para usar o Cloud SQL Socket
if (process.env.NODE_ENV === 'production') {
  config.dialectOptions = {
    socketPath: process.env.DB_HOST // Ex: /cloudsql/project:region:instance
  };
  // A chave 'host' não é usada com socketPath, então a removemos para evitar conflitos
  delete config.host; 
}

export default config;