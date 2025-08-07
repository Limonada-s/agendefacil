import request from 'supertest';
import bcrypt from 'bcryptjs';
import { app, db } from '../server.js';
import { generate as generateCpf } from 'gerador-validador-cpf';
import { runSeed } from '../seeders/run-seed.js';

// Descreve a suíte de testes de integração completa
describe('Testes de Integração - API AgendeFácil', () => {

  // -- Variáveis globais para a suíte de testes --
  let adminToken;
  let clienteToken;
  let empresaId;
  let servicoId;
  let professionalId;
  let agendamentoId;
  let categoryId;

  // -- Bloco de preparação: Executado UMA VEZ antes de todos os testes --
  beforeAll(async () => {
    // 1. Limpa, recria o banco de dados e executa o seeder
    await db.sequelize.sync({ force: true });
    await runSeed();

    // 2. Login do Admin para obter o token e o ID da empresa
    const adminLoginRes = await request(app)
      .post('/api/users/login')
      .send({ email: 'teste@docker.com', senha: '123456' });
    
    adminToken = adminLoginRes.body.token;
    empresaId = adminLoginRes.body.usuario.companyId;

    // 3. Cria uma Categoria para associar ao serviço
    const categoria = await db.Categoria.create({ nome: 'Cabelo', tipo: 'Masculino' });
    categoryId = categoria.id;

    // 4. Admin cria um SERVIÇO
    const servicoRes = await request(app)
      .post('/api/servicos')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Corte e Barba',
        description: 'Serviço completo.',
        duration: 60,
        price: 90.00,
        empresaId: empresaId,
        categoryId: categoryId
      });
      
    servicoId = servicoRes.body.id;

    // 5. Admin cria um PROFISSIONAL
    const professionalRes = await request(app)
      .post('/api/profissionais')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Ricardo Barbeiro',
        email: `ricardo_${Date.now()}@barbeiro.com`,
        password: 'senha-do-ricardo',
        phone: '11912345678',
        role: 'professional'
      });

    professionalId = professionalRes.body.id;
    
    // Define o horário de trabalho do profissional para que haja horários disponíveis.
    const professional = await db.Professional.findByPk(professionalId);
    if (professional) {
        await professional.update({
            workingHours: {
                "seg": { "ativo": true, "inicio": "09:00", "fim": "18:00" },
                "ter": { "ativo": true, "inicio": "09:00", "fim": "18:00" },
                "qua": { "ativo": true, "inicio": "09:00", "fim": "18:00" },
                "qui": { "ativo": true, "inicio": "09:00", "fim": "18:00" },
                "sex": { "ativo": true, "inicio": "09:00", "fim": "18:00" }
            }
        });
    }

    // 6. CRIA um novo CLIENTE diretamente no banco
    const clienteEmail = `cliente_${Date.now()}@teste.com`;
    const hashedSenhaCliente = await bcrypt.hash('senha-do-carlos', 10);
    await db.Login.create({
      nome: 'Carlos Cliente',
      email: clienteEmail,
      senha: hashedSenhaCliente,
      telefone: '11987654321',
      tipo: 'cliente',
      status: 'active'
    });

    // 7. Login do Cliente
    const clienteLoginRes = await request(app)
      .post('/api/users/login')
      .send({ email: clienteEmail, senha: 'senha-do-carlos' });
    
    clienteToken = clienteLoginRes.body.token;

    // 8. Verificações finais para garantir que a preparação funcionou
    expect(adminToken).toBeDefined();
    expect(clienteToken).toBeDefined();
    expect(servicoId).toBeDefined();
    expect(professionalId).toBeDefined();
  }, 30000);

  // -- Bloco de finalização --
  afterAll(async () => {
    await db.sequelize.close();
  });


  // ===================================================================
  // SUÍTES DE TESTES
  // ===================================================================
  describe('Fluxo de Autenticação e Cadastro de Empresa', () => {
    it('deve retornar 401 para credenciais de login inválidas', async () => {
      const response = await request(app)
        .post('/api/users/login')
        .send({ email: 'teste@docker.com', senha: 'senha-errada' });
      expect(response.statusCode).toBe(401);
      expect(response.body).toHaveProperty('erro', 'Credenciais inválidas');
    });

    it('deve retornar 200 e um token para credenciais de login válidas', async () => {
      const response = await request(app)
        .post('/api/users/login')
        .send({ email: 'teste@docker.com', senha: '123456' });
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('token');
    });

    it('deve cadastrar uma nova empresa com sucesso', async () => {
      const response = await request(app)
        .post('/api/empresas/register-company')
        .send({
          nome_empresa: 'Salão Teste de Sucesso',
          cnpj: '53.113.717/0001-08',
          nome_dono: 'Maria da Silva',
          cpf_dono: generateCpf({ format: false }),
          email_admin: `maria_${Date.now()}@sucesso.com`,
          telefone: '11987654321',
          senha: 'senha-super-segura',
          endereco: { rua: 'Rua das Flores', numero: '123', bairro: 'Centro', city: 'São Paulo', state: 'SP', zipCode: '01001-000' }
        });
      expect(response.statusCode).toBe(201);
      expect(response.body).toHaveProperty('sucesso', true);
    });

    it('deve retornar erro 400 ao tentar cadastrar empresa com CNPJ já existente', async () => {
      const response = await request(app)
        .post('/api/empresas/register-company')
        .send({
          nome_empresa: 'Outro Salão com CNPJ Repetido',
          cnpj: '48.770.717/0001-49', // CNPJ do seed
          nome_dono: 'João dos Santos',
          cpf_dono: generateCpf({ format: false }),
          email_admin: `joao_${Date.now()}@repetido.com`,
          telefone: '11912345678',
          senha: 'outra-senha-123',
          endereco: { rua: 'Rua das Pedras', numero: '321', bairro: 'Vila Madalena', city: 'São Paulo', state: 'SP', zipCode: '05445-000' }
        });
      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty('erro', 'Já existe uma conta com este Email, CNPJ ou CPF.');
    });
  });

  describe('Fluxo Completo de Agendamento', () => {
    const dataAgendamento = '2025-08-12'; // Certifique-se que esta data é um dia de semana (terça-feira)
    const horaAgendamento = '14:00';

    it('deve retornar horários disponíveis', async () => {
      const response = await request(app)
        .get('/api/agendamentos/horarios-disponiveis')
        .query({
          professionalId: professionalId,
          date: dataAgendamento,
          serviceId: servicoId
        });
      expect(response.statusCode).toBe(200);
      expect(response.body).toContain(horaAgendamento);
    });

    it('deve criar um novo agendamento com sucesso', async () => {
      const response = await request(app)
        .post('/api/agendamentos')
        .set('Authorization', `Bearer ${clienteToken}`)
        .send({
          data: dataAgendamento,
          hora: horaAgendamento,
          servico_id: servicoId,
          professional_id: professionalId,
          company_id: empresaId
        });
      
      expect(response.statusCode).toBe(201);
      expect(response.body).toHaveProperty('id');
      agendamentoId = response.body.id;
    });

    it('deve retornar erro ao tentar agendar em horário ocupado', async () => {
      const response = await request(app)
        .post('/api/agendamentos')
        .set('Authorization', `Bearer ${clienteToken}`)
        .send({
          data: dataAgendamento,
          hora: horaAgendamento,
          servico_id: servicoId,
          professional_id: professionalId,
          company_id: empresaId
        });
      
      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty('erro', 'Este horário não está mais disponível.');
    });

    // --- TESTES CORRIGIDOS ---
    it('o cliente deve conseguir listar seus próprios agendamentos', async () => {
      const response = await request(app)
        .get('/api/agendamentos') // Rota unificada
        .set('Authorization', `Bearer ${clienteToken}`);
      
      expect(response.statusCode).toBe(200);
      expect(response.body.length).toBeGreaterThanOrEqual(1);
      expect(response.body.find(a => a.id === agendamentoId)).toBeDefined();
    });

    it('a empresa deve conseguir listar todos os seus agendamentos', async () => {
      const response = await request(app)
        .get('/api/agendamentos') // Rota unificada
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.statusCode).toBe(200);
      expect(response.body.length).toBeGreaterThanOrEqual(1);
      expect(response.body.find(a => a.id === agendamentoId)).toBeDefined();
    });

    it('o cliente deve conseguir cancelar seu agendamento', async () => {
      const response = await request(app)
        .put(`/api/agendamentos/${agendamentoId}`) // Rota unificada
        .set('Authorization', `Bearer ${clienteToken}`)
        .send({ status: 'cancelado_pelo_cliente' });
      
      expect(response.statusCode).toBe(200);
      expect(response.body.status).toBe('cancelado_pelo_cliente');
    });
  });
});
