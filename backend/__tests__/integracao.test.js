// Arquivo: __tests__/integracao.test.js
// VERSÃO ATUALIZADA: Corrigidos os testes do fluxo financeiro para corresponder à estrutura da resposta da API.

import request from 'supertest';
import bcrypt from 'bcryptjs';
import { app, db } from '../server.js';
import { generate as generateCpf } from 'gerador-validador-cpf';
import { runSeed } from '../seeders/run-seed.js';

describe('Testes de Integração - API AgendeFácil', () => {

    // Variáveis globais para a suíte de testes
    let adminToken;
    let clienteToken;
    let professionalToken; // Novo: Token para o profissional
    let empresaId;
    let servicoId;
    let professionalId;
    let agendamentoId;
    let agendamentoConcluidoId; // Novo: Agendamento para review
    let reviewId; // Novo: ID da review criada
    let expenseId; // Novo: ID da despesa criada
    let categoryId;

    // Bloco de preparação: Executado UMA VEZ antes de todos os testes
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
        const professionalEmail = `ricardo_${Date.now()}@barbeiro.com`;
        const professionalPassword = 'senha-do-ricardo';
        const professionalRes = await request(app)
            .post('/api/profissionais')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                name: 'Ricardo Barbeiro',
                email: professionalEmail,
                password: professionalPassword,
                phone: '11912345678',
                role: 'professional'
            });

        professionalId = professionalRes.body.id;
        
        // Define o horário de trabalho do profissional
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
        
        // NOVO: Login do profissional para obter seu token
        const professionalLoginRes = await request(app)
            .post('/api/users/login')
            .send({ email: professionalEmail, senha: professionalPassword });
        professionalToken = professionalLoginRes.body.token;

        // 6. CRIA um novo CLIENTE e faz login
        const clienteEmail = `cliente_${Date.now()}@teste.com`;
        const hashedSenhaCliente = await bcrypt.hash('senha-do-carlos', 10);
        const cliente = await db.Login.create({
            nome: 'Carlos Cliente',
            email: clienteEmail,
            senha: hashedSenhaCliente,
            telefone: '11987654321',
            tipo: 'cliente',
            status: 'active'
        });
        const clienteLoginRes = await request(app)
            .post('/api/users/login')
            .send({ email: clienteEmail, senha: 'senha-do-carlos' });
        clienteToken = clienteLoginRes.body.token;

        // NOVO: Cria um agendamento e o marca como "concluido" para poder ser avaliado
        const agendamentoParaReview = await db.Agendamento.create({
            data: '2025-08-10',
            hora: '10:00',
            status: 'concluido',
            clientId: cliente.id,
            companyId: empresaId,
            servicoId: servicoId,
            professionalId: professionalId,
        });
        agendamentoConcluidoId = agendamentoParaReview.id;

        // 8. Verificações finais para garantir que a preparação funcionou
        expect(adminToken).toBeDefined();
        expect(clienteToken).toBeDefined();
        expect(professionalToken).toBeDefined();
        expect(servicoId).toBeDefined();
        expect(professionalId).toBeDefined();
        expect(agendamentoConcluidoId).toBeDefined();
    }, 30000);

    afterAll(async () => {
        await db.sequelize.close();
    });

    // SUÍTE DE TESTES EXISTENTE (SEM MUDANÇAS)
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
                    cnpj: '48.770.717/0001-49',
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

    // SUÍTE DE TESTES EXISTENTE (SEM MUDANÇAS)
    describe('Fluxo Completo de Agendamento', () => {
        const dataAgendamento = '2025-08-12';
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

        it('o cliente deve conseguir listar seus próprios agendamentos', async () => {
            const response = await request(app)
                .get('/api/agendamentos/cliente') 
                .set('Authorization', `Bearer ${clienteToken}`);
            
            expect(response.statusCode).toBe(200);
            expect(response.body.length).toBeGreaterThanOrEqual(1);
        });

        it('a empresa deve conseguir listar todos os seus agendamentos', async () => {
            const response = await request(app)
                .get('/api/agendamentos')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(response.statusCode).toBe(200);
            expect(response.body.length).toBeGreaterThanOrEqual(1);
        });

        it('o cliente deve conseguir cancelar seu agendamento', async () => {
            const response = await request(app)
                .put(`/api/agendamentos/${agendamentoId}`)
                .set('Authorization', `Bearer ${clienteToken}`)
                .send({ status: 'cancelado_pelo_cliente' });
            
            expect(response.statusCode).toBe(200);
            expect(response.body.status).toBe('cancelado_pelo_cliente');
        });
    });

    // SUÍTE DE TESTES EXISTENTE (SEM MUDANÇAS)
    describe('Fluxo de Reviews', () => {
        it('deve permitir que um cliente crie uma review para um agendamento concluído', async () => {
            const response = await request(app)
                .post('/api/reviews')
                .set('Authorization', `Bearer ${clienteToken}`)
                .send({
                    rating: 5,
                    comment: 'Serviço excelente, profissional muito atencioso!',
                    appointmentId: agendamentoConcluidoId
                });

            expect(response.statusCode).toBe(201);
            expect(response.body).toHaveProperty('id');
            expect(response.body.status).toBe('pending'); // Status inicial é pendente
            reviewId = response.body.id;
        });

        it('deve permitir que o admin liste as reviews para moderação', async () => {
            const response = await request(app)
                .get('/api/reviews/manage')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(response.statusCode).toBe(200);
            expect(response.body.length).toBeGreaterThanOrEqual(1);
            expect(response.body.find(r => r.id === reviewId)).toBeDefined();
        });

        it('deve permitir que o admin aprove uma review', async () => {
            const response = await request(app)
                .put(`/api/reviews/${reviewId}/status`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ status: 'approved' });

            expect(response.statusCode).toBe(200);
            expect(response.body.status).toBe('approved');
        });

        it('deve permitir que o público veja as reviews aprovadas de uma empresa', async () => {
            const response = await request(app)
                .get(`/api/reviews/company/${empresaId}`);

            expect(response.statusCode).toBe(200);
            expect(response.body.length).toBeGreaterThanOrEqual(1);
            expect(response.body.find(r => r.id === reviewId)).toBeDefined();
            expect(response.body.every(r => r.status === 'approved')).toBe(true);
        });
    });

    // --- SUÍTE DE TESTES CORRIGIDA ---
    describe('Fluxo Financeiro e de Profissionais', () => {
        it('deve permitir que o admin crie uma despesa', async () => {
            const response = await request(app)
                .post('/api/financials/expenses')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    description: 'Compra de produtos',
                    amount: 150.75,
                    type: 'despesa',
                    date: '2025-08-12',
                    professionalId: professionalId
                });

            expect(response.statusCode).toBe(201);
            expect(response.body).toHaveProperty('id');
            expenseId = response.body.id;
        });

        it('deve permitir que o admin veja o resumo financeiro', async () => {
            const response = await request(app)
                .get('/api/financials/summary')
                .set('Authorization', `Bearer ${adminToken}`)
                .query({
                    startDate: '2025-08-01',
                    endDate: '2025-08-31'
                });

            expect(response.statusCode).toBe(200);
            // Verifica se a estrutura principal da resposta está correta
            expect(response.body).toHaveProperty('summary');
            expect(response.body).toHaveProperty('charts');
            // Verifica os valores dentro do objeto 'summary'
            expect(response.body.summary.grossRevenue).toBe(90.00); // Do agendamento concluído
            expect(response.body.summary.totalExpensesAmount).toBe(150.75);
        });

        it('deve permitir que um profissional consulte seus próprios ganhos', async () => {
            const response = await request(app)
                .get('/api/financials/my-earnings')
                .set('Authorization', `Bearer ${professionalToken}`)
                 .query({
                    startDate: '2025-08-01',
                    endDate: '2025-08-31'
                });

            expect(response.statusCode).toBe(200);
            // Verifica a estrutura da resposta
            expect(response.body).toHaveProperty('summary');
            expect(response.body).toHaveProperty('details');
            // Verifica os valores dentro do objeto 'summary'
            expect(response.body.summary.totalServices).toBe(1);
            expect(response.body.summary).toHaveProperty('totalCommission');
        });
        
        it('deve permitir que o admin delete uma despesa', async () => {
            const response = await request(app)
                .delete(`/api/financials/expenses/${expenseId}`)
                .set('Authorization', `Bearer ${adminToken}`);

            // Uma operação DELETE bem-sucedida geralmente retorna 204 No Content
            expect(response.statusCode).toBe(204);
        });
    });
});
