// Arquivo: backend/check-db.js
// Um script simples para diagnosticar a conexão com o banco de dados de teste.
// VERSÃO CORRIGIDA COM SINTAXE DE IMPORT (ESM)

import pg from 'pg';
import 'dotenv/config';

const { Client } = pg;

console.log('--- Iniciando script de diagnóstico de conexão ---');

const config = {
  user: process.env.DB_USER,
  host: '127.0.0.1', // Usando o mesmo host que os testes
  database: 'database_test', // Usando o mesmo banco de dados que os testes
  password: process.env.DB_PASS,
  port: 5432,
};

console.log('Tentando conectar com a seguinte configuração:');
console.log({
  user: config.user,
  host: config.host,
  database: config.database,
  password: '***', // Não vamos exibir a senha no log
  port: config.port,
});

const client = new Client(config);

client.connect()
  .then(() => {
    console.log('\n✅ SUCESSO! A conexão com o banco de dados "database_test" foi estabelecida.');
    console.log('Isso confirma que o problema está na configuração do Jest/Sequelize, e não na conexão básica.');
    return client.end();
  })
  .catch(err => {
    console.error('\n❌ FALHA NA CONEXÃO!');
    console.error('O erro recebido foi:');
    console.error(err.message);
    console.error('\nCausas prováveis:');
    console.error('1. O container do Docker não está rodando ou a porta 5432 não está exposta.');
    console.error('2. Outro serviço de PostgreSQL está rodando na sua máquina e bloqueando a porta 5432.');
    console.error('3. Um firewall está bloqueando a conexão.');
  });
