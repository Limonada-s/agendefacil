import bcrypt from 'bcryptjs';
import db from '../models/index.js';
import logger from '../logger.js';

const { Empresa, Login } = db;

// Adicionamos a mesma função de limpeza que o seu controller usa
const cleanDocument = (doc) => (doc || '').toString().replace(/\D/g, '');

// Esta função será chamada pelo server.js para popular o banco
export const runSeed = async () => {
  try {
    // Usamos findOrCreate para evitar erros se os dados já existirem.
    const [empresa, createdEmpresa] = await Empresa.findOrCreate({
      where: { id: 10 },
      defaults: {
        id: 10,
        nome_empresa: 'Empresa Teste Docker',
        cnpj: cleanDocument('48.770.717/0001-49'),
        nome_dono: 'Admin Teste',
        cpf_dono: cleanDocument('348.295.170-50'),
        email_admin: 'teste@docker.com',
        telefone: '11999999999',
        senha: await bcrypt.hash('123456', 10),
        // --- CORREÇÃO APLICADA AQUI ---
        // Usamos camelCase para corresponder à definição do modelo Sequelize
        subscriptionStatus: 'active', 
        status: 'active',
        subscriptionEndDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
      }
    });

    if (createdEmpresa) {
      logger.info('Semente: Empresa de teste criada com sucesso.');
    }

    const [login, createdLogin] = await Login.findOrCreate({
      where: { email: 'teste@docker.com' },
      defaults: {
        id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12',
        nome: 'Admin Docker',
        email: 'teste@docker.com',
        telefone: '11999999999',
        senha: await bcrypt.hash('123456', 10),
        tipo: 'admin',
        status: 'active',
        empresaId: empresa.id,
      }
    });

    if (createdLogin) {
      logger.info('Semente: Login de administrador de teste criado com sucesso.');
    }

    logger.info('Sementes executadas com sucesso.');

  } catch (error) {
    logger.error('Erro ao executar as sementes:', { error: error.message, stack: error.stack });
  }
};
