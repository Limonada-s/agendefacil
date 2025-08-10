import dotenv from 'dotenv';
dotenv.config();

let dbConfig;
const env = process.env.NODE_ENV;

console.log(`[config/database.js] Lendo configuração para o ambiente: ${env}`);

if (env === 'production') {
  console.log('[config/database.js] Ambiente de PRODUÇÃO detetado. A usar socketPath.');
  // --- Configuração de Produção ---
  dbConfig = {
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    dialect: 'postgres',
    dialectOptions: {
      socketPath: process.env.DB_HOST
    }
  };
} else {
  console.log('[config/database.js] Ambiente de DESENVOLVIMENTO detetado. A usar host.');
  // --- Configuração de Desenvolvimento ---
  dbConfig = {
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST || 'localhost',
    dialect: 'postgres'
  };
}

console.log('[config/database.js] Configuração final exportada:', dbConfig);
export default dbConfig;