import db from '../models/index.js';
import logger from '../logger.js';
import bcrypt from 'bcryptjs';

const { Login, Professional, Servico, sequelize } = db;

export const createProfessional = async (req, res) => {
    const { name, email, password, phone, birthDate, role, specialties, commissionRate } = req.body;
    const empresaId = req.user.companyId;
    if (!name || !email || !password || !role) {
        return res.status(400).json({ erro: 'Nome, email, senha e função são obrigatórios.' });
    }
    const t = await sequelize.transaction();
    try {
        const userExists = await Login.findOne({ where: { email } });
        if (userExists) {
            await t.rollback();
            return res.status(409).json({ erro: 'Este email já está em uso.' });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newLogin = await Login.create({
            nome: name, email, senha: hashedPassword, telefone: phone,
            data_nascimento: birthDate || null, tipo: 'professional'
        }, { transaction: t });

        // ✅ SOLUÇÃO: Define um horário de trabalho padrão para evitar erros.
        // O profissional começa com todos os dias inativos e pode configurar depois.
        const defaultWorkingHours = {
            "seg": { "ativo": false, "inicio": "09:00", "fim": "18:00" },
            "ter": { "ativo": false, "inicio": "09:00", "fim": "18:00" },
            "qua": { "ativo": false, "inicio": "09:00", "fim": "18:00" },
            "qui": { "ativo": false, "inicio": "09:00", "fim": "18:00" },
            "sex": { "ativo": false, "inicio": "09:00", "fim": "18:00" },
            "sab": { "ativo": false, "inicio": "09:00", "fim": "13:00" },
            "dom": { "ativo": false, "inicio": "09:00", "fim": "13:00" }
        };

        const newProfessional = await Professional.create({
            role, 
            specialties: specialties || [], 
            commissionRate: commissionRate || 0,
            empresa_id: empresaId, 
            login_id: newLogin.id,
            workingHours: defaultWorkingHours // Adiciona o horário padrão na criação
        }, { transaction: t });

        await t.commit();
        const result = await Professional.findByPk(newProfessional.id, {
            include: [{ model: Login, as: 'loginDetails' }]
        });
        res.status(201).json(result);
    } catch (err) {
        await t.rollback();
        logger.error('erro_create_professional_transaction', { error: err.message });
        res.status(500).json({ erro: 'Erro interno ao criar o profissional.' });
    }
};

export const getCompanyProfessionals = async (req, res) => {
    try {
        const empresaId = req.user.companyId;
        const professionals = await Professional.findAll({
            where: { empresa_id: empresaId },
            include: [
                { model: Login, as: 'loginDetails', attributes: ['id', 'nome', 'email', 'telefone'] },
                { model: Servico, as: 'servicos', attributes: ['id', 'name', 'price'], through: { attributes: [] } }
            ],
            order: [[{ model: Login, as: 'loginDetails' }, 'nome', 'ASC']]
        });
        res.json(professionals);
    } catch (err) {
        logger.error('erro_get_professionals', { error: err.message });
        res.status(500).json({ erro: 'Erro interno ao buscar profissionais.' });
    }
};

export const getMyProfessionalProfile = async (req, res) => {
    try {
        const loginId = req.user.id;
        const professionalProfile = await db.Professional.findOne({
            where: { login_id: loginId },
        });
        if (!professionalProfile) {
            return res.status(404).json({ erro: 'Perfil profissional não encontrado para este usuário.' });
        }
        res.json(professionalProfile);
    } catch (error) {
        logger.error('erro_get_my_profile', { error: error.message, userId: req.user?.id });
        res.status(500).json({ erro: 'Erro ao buscar perfil profissional.' });
    }
};

export const getAllCompanyProfessionals = async (req, res) => {
    try {
        const empresaId = req.user.companyId;
        const professionals = await Professional.findAll({
            where: { empresa_id: empresaId },
            include: [{
                model: Login,
                as: 'loginDetails',
                attributes: ['nome']
            }],
            attributes: ['id'],
            order: [[{ model: Login, as: 'loginDetails' }, 'nome', 'ASC']]
        });
        res.json(professionals);
    } catch (error) {
        logger.error('erro_get_all_professionals', { error: error.message });
        res.status(500).json({ erro: 'Erro ao buscar lista de profissionais.' });
    }
};

export const updateProfessional = async (req, res) => {
    const { id } = req.params;
    const { name, phone, role, specialties, commissionRate } = req.body;
    const empresaId = req.user.companyId;
    const t = await sequelize.transaction();
    try {
        const professional = await Professional.findOne({ where: { id, empresa_id: empresaId }, transaction: t });
        if (!professional) {
            await t.rollback();
            return res.status(404).json({ erro: 'Profissional não encontrado.' });
        }
        professional.role = role ?? professional.role;
        professional.specialties = specialties ?? professional.specialties;
        professional.commissionRate = commissionRate ?? professional.commissionRate;
        await professional.save({ transaction: t });
        const login = await Login.findByPk(professional.login_id, { transaction: t });
        if (login) {
            login.nome = name ?? login.nome;
            login.telefone = phone ?? login.telefone;
            await login.save({ transaction: t });
        }
        await t.commit();
        const updatedProfessional = await Professional.findByPk(id, {
            include: [{ model: Login, as: 'loginDetails' }, { model: Servico, as: 'servicos', through: { attributes: [] } }]
        });
        res.json(updatedProfessional);
    } catch (err) {
        await t.rollback();
        logger.error('erro_update_professional', { error: err.message });
        res.status(500).json({ erro: 'Erro interno ao atualizar o profissional.' });
    }
};

export const deleteProfessional = async (req, res) => {
    try {
        const { id } = req.params;
        const empresaId = req.user.companyId;

        const professional = await db.Professional.findOne({ where: { id, empresa_id: empresaId } });
        if (!professional) {
            return res.status(404).json({ erro: 'Profissional não encontrado.' });
        }

        professional.status = 'inactive';
        await professional.save();

        await db.Login.update({ status: 'inactive' }, { where: { id: professional.login_id } });

        logger.info('professional_inativado', { professionalId: id, empresaId });
        res.status(204).send();

    } catch (err) {
        logger.error('erro_delete_professional', { error: err.message });
        res.status(500).json({ erro: 'Erro interno ao excluir profissional.' });
    }
};

export const updateMySchedule = async (req, res) => {
    try {
        const loginId = req.user.id;
        const { workingHours } = req.body;

        const professional = await db.Professional.findOne({ where: { login_id: loginId } });
        if (!professional) {
            return res.status(404).json({ erro: 'Perfil profissional não encontrado.' });
        }

        professional.workingHours = workingHours;
        await professional.save();

        logger.info('horarios_de_trabalho_atualizados', { professionalId: professional.id });
        res.json({ message: 'Horários de trabalho atualizados com sucesso.', workingHours });

    } catch (error) {
        logger.error('erro_update_my_schedule', { error: error.message, userId: req.user?.id });
        res.status(500).json({ erro: 'Erro ao salvar horários de trabalho.' });
    }
};

export const updateBlockedSlots = async (req, res) => {
    try {
        const loginId = req.user.id;
        const { blockedSlots } = req.body;

        const professional = await db.Professional.findOne({ where: { login_id: loginId } });
        if (!professional) {
            return res.status(404).json({ erro: 'Perfil profissional não encontrado.' });
        }

        professional.blockedSlots = blockedSlots;
        await professional.save();

        logger.info('horarios_bloqueados_atualizados', { professionalId: professional.id });
        res.json({ message: 'Horários bloqueados atualizados com sucesso.', blockedSlots });

    } catch (error) {
        logger.error('erro_update_blocked_slots', { error: error.message, userId: req.user?.id });
        res.status(500).json({ erro: 'Erro ao salvar horários bloqueados.' });
    }
};
