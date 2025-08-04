// src/lib/serviceApi.js (ajustado para rotas reais)
import api from './api';

export const fetchServices = async (companyId) => {
  try {
    const response = await api.get(`/empresas/${companyId}/servicos`);
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar serviços:', error);
    return [];
  }
};

export const saveService = async (service) => {
  try {
    if (service.id) {
      const response = await api.put(`/servicos/${service.id}`, service);
      return response.data;
    } else {
      const response = await api.post('/servicos', service);
      return response.data;
    }
  } catch (error) {
    console.error('Erro ao salvar serviço:', error);
    throw error;
  }
};

export const deleteService = async (id) => {
  try {
    await api.delete(`/servicos/${id}`);
    return true;
  } catch (error) {
    console.error('Erro ao deletar serviço:', error);
    throw error;
  }
};


export const buscarEmpresasProximas = async (lat, lng, raio = 10) => {
  try {
    const response = await api.get('/empresas/proximas', {
      params: { lat, lng, raio },
    });
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar empresas próximas:', error);
    return [];
  }
};

export const getCompanyAppointments = async () => {
  try {
    const response = await api.get('/agendamentos/empresa'); 
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar agendamentos da empresa:", error);
    throw error;
  }
};

export const getProfessionals = async () => {
  try {
    const response = await api.get('/profissionais');
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar profissionais:', error);
    // Lança o erro para que o componente que chamou possa tratá-lo (ex: exibir toast)
    throw error;
  }
};

/**
 * Cria um novo profissional.
 * @param {object} professionalData - Dados do formulário (name, email, password, role, etc.)
 */
export const createProfessional = async (professionalData) => {
  try {
    const response = await api.post('/profissionais', professionalData);
    return response.data;
  } catch (error) {
    console.error('Erro ao criar profissional:', error);
    throw error;
  }
};

/**
 * Atualiza um profissional existente.
 * @param {string} id - ID do perfil profissional (não o login_id)
 * @param {object} professionalData - Dados do formulário
 */
export const updateProfessional = async (id, professionalData) => {
  try {
    const response = await api.put(`/profissionais/${id}`, professionalData);
    return response.data;
  } catch (error) {
    console.error('Erro ao atualizar profissional:', error);
    throw error;
  }
};

/**
 * Deleta um profissional.
 * @param {string} id - ID do perfil profissional
 */
export const deleteProfessional = async (id) => {
  try {
    await api.delete(`/profissionais/${id}`);
    return true;
  } catch (error) {
    console.error('Erro ao deletar profissional:', error);
    throw error;
  }
};


export const getMyProfessionalAppointments = async () => {
  try {
    const response = await api.get('/agendamentos/meus-agendamentos-profissional');
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar meus agendamentos:', error);
    throw error;
  }
};

/**
 * Busca os dados de perfil do profissional logado.
 */
export const getMyProfessionalProfile = async () => {
  try {
    const response = await api.get('/profissionais/meu-perfil');
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar meu perfil profissional:', error);
    throw error;
  }
};

export const getMyEarnings = async (timeRange) => {
  try {
    const response = await api.get(`/financials/my-earnings?range=${timeRange}`);
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar meus ganhos:', error);
    throw error;
  }
};

export const loginSuperAdmin = async (credentials) => {
  // Chama a nova rota de login do super admin
  const response = await api.post('/users/super-login', credentials);
  return response.data;
};
export const createReview = async (reviewData) => {
    const response = await api.post('/reviews', reviewData);
    return response.data;
};
export const getReviewsForAdmin = async () => {
  try {
    const response = await api.get('/reviews/manage');
    return response.data; // Retorna diretamente o array de dados
  } catch (error) {
    console.error("Erro em getReviewsForAdmin:", error);
    throw error; // Propaga o erro para o componente tratar
  }
};
export const updateReviewStatus = async (reviewId, status) => {
  try {
    const response = await api.put(`/reviews/${reviewId}/status`, { status });
    return response.data; // Retorna o review atualizado
  } catch (error) {
    console.error("Erro em updateReviewStatus:", error);
    throw error;
  }
};
export const getSystemStats = () => api.get('/superadmin/stats');
export const getAllCompanies = () => api.get('/superadmin/companies');
export const updateCompanySubscription = (id, data) => api.put(`/superadmin/companies/${id}/subscription`, data);


export const updateAppointmentStatusByProfessional = (id, status) => {
  return api.put(`/agendamentos/professional/${id}`, { status });
};

export const getMyFullProfessionalProfile = async () => {
  try {
    // Usamos a rota 'meu-perfil' que já existe
    const response = await api.get('/profissionais/meu-perfil');
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar perfil completo do profissional:', error);
    throw error;
  }
};

/**
 * Atualiza os horários de trabalho padrão do profissional logado.
 * @param {object} workingHours - O objeto JSON com os horários da semana.
 */
export const updateMySchedule = async (workingHours) => {
  try {
    const response = await api.put('/profissionais/my-schedule', { workingHours });
    return response.data;
  } catch (error) {
    console.error('Erro ao atualizar horários de trabalho:', error);
    throw error;
  }
};

export const updateMyBlockedSlots = async (blockedSlots) => {
  try {
    const response = await api.put('/profissionais/my-blocked-slots', { blockedSlots });
    return response.data;
  } catch (error) {
    console.error('Erro ao atualizar horários bloqueados:', error);
    throw error;
  }
};

export const forgotPassword = async (email) => {
  try {
    const response = await api.post('/users/forgot-password', { email });
    return response.data;
  } catch (error) {
    console.error('Erro ao solicitar redefinição de senha:', error);
    throw error;
  }
};

/**
 * Redefine a senha usando um token válido.
 * @param {string} token - O token de redefinição da URL.
 * @param {string} novaSenha - A nova senha digitada pelo usuário.
 */
export const resetPassword = async (token, novaSenha) => {
  try {
    const response = await api.post('/users/reset-password', { token, novaSenha });
    return response.data;
  } catch (error) {
    console.error('Erro ao redefinir senha:', error);
    throw error;
  }
};

