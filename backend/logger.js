import { createLogger, format, transports } from 'winston';
import Transport from 'winston-transport';
import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pkg;

// --- TRANSPORT PARA O BANCO DE DADOS (CORRIGIDO) ---

// ===================================================================
// CORREÇÃO APLICADA AQUI:
// Em vez de montar uma string de conexão, passamos os dados em um objeto.
// Isso evita problemas com caracteres especiais na senha.
// ===================================================================
const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
});


class PostgresTransport extends Transport {
  async log(info, callback) {
    setImmediate(() => this.emit('logged', info));
    const { level, message, timestamp, ...meta } = info;
    const query = `INSERT INTO app_logs (level, message, meta) VALUES ($1, $2, $3)`;
    try {
      await pool.query(query, [level, message, meta]);
    } catch (err) {
      console.error('Erro ao gravar log no banco:', err.message);
    }
    callback();
  }
}

// --- CONFIGURAÇÃO DO LOGGER (sem alterações) ---
const loggerTransports = [
  new PostgresTransport()
];

if (process.env.NODE_ENV !== 'production') {
  loggerTransports.push(
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.timestamp({ format: 'HH:mm:ss' }),
        format.printf(info => {
          const { timestamp, level, message, ...meta } = info;
          const metaString = (meta && Object.keys(meta).length) ? `\n${JSON.stringify(meta, null, 2)}` : '';
          return `${timestamp} ${level}: ${message}${metaString}`;
        })
      )
    })
  );
} else {
  loggerTransports.push(new transports.Console());
}

const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp(),
  ),
  transports: loggerTransports,
  defaultMeta: { service: 'api-agendefacil' },
});

export default logger;
