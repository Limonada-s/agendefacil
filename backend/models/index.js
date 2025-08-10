// Arquivo: backend/src/models/index.js
// VERSÃO DE DEPURAÇÃO MÁXIMA

import { Sequelize } from 'sequelize';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

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

console.log("--- [LOG] 1. Iniciando models/index.js ---");

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const env = process.env.NODE_ENV || 'development';
console.log(`--- [LOG] 2. Ambiente detectado: "${env}" ---`);

const configPath = join(__dirname, '..', 'config', 'config.cjs');
console.log(`--- [LOG] 3. Carregando config de: "${configPath}" ---`);

const config = require(configPath)[env];
console.log('--- [LOG] 4. Configuração BRUTA carregada:', JSON.stringify(config, null, 2));

if (env === 'production') {
  delete config.host;
  console.log('--- [LOG] 5. Ambiente é PRODUÇÃO. Propriedade "host" removida da config.');
}

const db = {};

console.log('--- [LOG] 6. Inicializando Sequelize com a seguinte configuração FINAL:', JSON.stringify(config, null, 2));
const sequelize = new Sequelize(config);

console.log('--- [LOG] 7. Objeto Sequelize CRIADO. Inspecionando suas opções INTERNAS:');
console.log(JSON.stringify(sequelize.options, null, 2));


// Carrega todos os modelos
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

// Executa as associações
Object.values(db).forEach((model) => {
  if (model.associate) {
    model.associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

console.log("--- [LOG] 8. Exportando 'db' de models/index.js ---");
export default db;
