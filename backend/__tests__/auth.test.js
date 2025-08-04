import request from 'supertest';
// Usamos chaves {} para pegar as exportações nomeadas do server.js
import { app, server, db } from '../server.js';
// Voltamos a usar o gerador de CPF, pois com a validação desabilitada no backend,
// o formato não importa mais, apenas que o dado exista.
import { generate as generateCpf } from 'gerador-validador-cpf';

// beforeAll é executado UMA VEZ antes de todos os testes deste arquivo.
beforeAll(async () => {
  // Recriamos o banco de dados e populamos com dados de teste.
  await db.sequelize.sync({ force: true });
  
  // Acessamos e executamos a função 'runSeed' de dentro do módulo importado.
  const seederModule = await import('../seeders/run-seed.js');
  await seederModule.runSeed();
});

// afterAll é executado UMA VEZ depois que todos os testes terminarem.
afterAll(async () => {
  // Fechamos a conexão com o banco para que o Jest possa encerrar.
  await db.sequelize.close();
  // Desligamos o servidor para que o Jest possa sair.
  if (server) {
    await new Promise(resolve => server.close(resolve));
  }
});


// ===================================================================
// TESTES DE LOGIN (JÁ EXISTENTES E FUNCIONAIS)
// ===================================================================
describe('Rotas de Autenticação - /api/users', () => {

  it('deve retornar status 401 para credenciais inválidas', async () => {
    const response = await request(app)
      .post('/api/users/login')
      .send({
        email: 'teste@docker.com',
        senha: 'senha-errada'
      });

    expect(response.statusCode).toBe(401);
    expect(response.body).toHaveProperty('erro', 'Credenciais inválidas');
  });

  it('deve retornar status 200 e um token para credenciais válidas', async () => {
    const response = await request(app)
      .post('/api/users/login')
      .send({
        email: 'teste@docker.com',
        senha: '123456'
      });

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('token');
    expect(response.body.usuario.email).toBe('teste@docker.com');
  });

});

// ===================================================================
// NOVOS TESTES: CADASTRO DE EMPRESA (VERSÃO CORRIGIDA E FUNCIONAL)
// ===================================================================
describe('Rotas de Empresa - /api/empresas', () => {

  it('deve cadastrar uma nova empresa com sucesso e retornar status 201', async () => {
    // Geramos um CPF aleatório. Como a validação estará desabilitada no ambiente de teste, ele será aceito.
    const cpfValido = generateCpf().replace(/[^\d]/g, "");

    const novaEmpresa = {
      nome_empresa: 'Salão Teste de Sucesso',
      cnpj: '53.113.717/0001-08', // CNPJ único que não existe no seed
      nome_dono: 'Maria da Silva',
      cpf_dono: cpfValido, 
      email_admin: `maria_${Date.now()}@sucesso.com`,
      telefone: '11987654321',
      senha: 'senha-super-segura',
      description: '', 
      endereco: {
        rua: 'Rua das Flores',
        numero: '123',
        bairro: 'Centro',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01001-000'
      }
    };

    const response = await request(app)
      .post('/api/empresas/register-company')
      .send(novaEmpresa);

    if (response.statusCode !== 201) {
      console.log('Resposta do teste de cadastro (sucesso):', response.body);
    }

    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty('sucesso', true);
  });

  it('deve retornar erro 400 ao tentar cadastrar uma empresa com CNPJ já existente', async () => {
    const outroCpfValido = generateCpf().replace(/[^\d]/g, "");

    const empresaComCnpjRepetido = {
      nome_empresa: 'Outro Salão com CNPJ Repetido',
      cnpj: '48.770.717/0001-49', // CNPJ da empresa que já existe no nosso "seed"
      nome_dono: 'João dos Santos',
      cpf_dono: outroCpfValido,
      email_admin: `joao_${Date.now()}@repetido.com`,
      telefone: '11912345678',
      senha: 'outra-senha-123',
      description: '',
      endereco: {
        rua: 'Rua das Pedras',
        numero: '321',
        bairro: 'Vila Madalena',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '05445-000'
      }
    };

    const response = await request(app)
      .post('/api/empresas/register-company')
      .send(empresaComCnpjRepetido);

    // CORREÇÃO FINAL: Com a validação manual no backend, esperamos um erro 400 (Bad Request).
    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty('erro', 'Já existe uma conta com este Email, CNPJ ou CPF.');
  });
});
