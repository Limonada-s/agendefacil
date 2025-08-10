// Arquivo: backend/src/models/index.js
// ESTA VERSÃO LÊ A VARIÁVEL DE AMBIENTE E CARREGA A CONFIGURAÇÃO CORRETA.

import { Sequelize } from 'sequelize';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

// Importação dos modelos
import defineLogin from './Login.js';
import defineEmpresa from './Empresa.js';
import defineCategoria from './Categoria.js';
import defineEndereco from './Endereco.js';
import defineServico from './Servico.js';
import defineAgendamento from './Agendamento.js';
import defineProfessional from './Professional.js';
import defineExpense from './Expense.js';
import defineReview from './Review.js';
import defineAppLog from './AppLog.js';

// Lógica para carregar o arquivo de configuração .cjs em um módulo ES
const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Determina o ambiente (production, development, etc.)
const env = process.env.NODE_ENV || 'development';
// Carrega o arquivo de configuração correto
const config = require(join(__dirname, '..', 'config', 'config.cjs'))[env];

const db = {};

// Inicializa a conexão do Sequelize com a configuração correta
let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

// Carrega todos os modelos no objeto 'db'
db.Login = defineLogin(sequelize);
db.Empresa = defineEmpresa(sequelize);
db.Categoria = defineCategoria(sequelize);
db.Endereco = defineEndereco(sequelize);
db.Servico = defineServico(sequelize);
db.Agendamento = defineAgendamento(sequelize);
db.Professional = defineProfessional(sequelize);
db.Expense = defineExpense(sequelize);
db.Review = defineReview(sequelize);
db.AppLog = defineAppLog(sequelize);

// Executa as associações entre os modelos, se existirem
Object.values(db).forEach((model) => {
  if (model.associate) {
    model.associate(db);
  }
});

// Anexa a instância do sequelize e o construtor ao objeto db
db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;
