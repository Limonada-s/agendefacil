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

// --- INÍCIO DA DEPURAÇÃO ---
console.log("--- [DEBUG] Iniciando models/index.js ---");

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 1. Verificando a variável de ambiente NODE_ENV
const env = process.env.NODE_ENV || 'development';
console.log(`--- [DEBUG] Variável NODE_ENV detectada: "${env}" ---`);

// 2. Construindo o caminho para o arquivo de configuração
const configPath = join(__dirname, '..', 'config', 'config.cjs');
console.log(`--- [DEBUG] Tentando carregar configuração de: "${configPath}" ---`);

// 3. Carregando a configuração específica do ambiente
const allConfigs = require(configPath);
const config = allConfigs[env];

if (!config) {
    console.error(`--- [ERRO FATAL] Nenhuma configuração encontrada para o ambiente "${env}" no arquivo config.cjs!`);
    process.exit(1); // Encerra a aplicação se a config não for encontrada
}

console.log('--- [DEBUG] Configuração carregada para o ambiente:', JSON.stringify(config, null, 2));
// --- FIM DA DEPURAÇÃO ---

const db = {};

// Inicializa a conexão do Sequelize
let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

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

export default db;