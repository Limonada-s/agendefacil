
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

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const env = process.env.NODE_ENV || 'development';
const config = require(join(__dirname, '..', 'config', 'config.cjs'))[env];

const db = {};

// --- ALTERAÇÃO CRÍTICA ABAIXO ---
// Em vez de passar múltiplos argumentos, passamos um único objeto de configuração.
// Isso é mais robusto e garante que todas as opções, incluindo o socketPath, sejam lidas.
const sequelize = new Sequelize(config);

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
