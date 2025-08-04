
import { companyCategories as allCompanyCategoriesData } from './companyCategories';

export const initializeData = () => {
  if (!localStorage.getItem('services')) {
    localStorage.setItem('services', JSON.stringify([
      { id: 's1', name: 'Corte Feminino Essencial', description: 'Corte moderno e estilizado.', duration: 60, price: 80, companyCategory: 'fem_cabelo', image: 'url_corte_feminino.jpg', companyId: 'comp1' },
      { id: 's2', name: 'Manicure Simples e Rápida', description: 'Cutilagem e esmaltação.', duration: 45, price: 30, companyCategory: 'fem_unhas', image: 'url_manicure.jpg', companyId: 'comp3' },
      { id: 's3', name: 'Escova Progressiva Premium', description: 'Alisamento duradouro com tratamento.', duration: 180, price: 250, companyCategory: 'fem_cabelo', image: 'url_progressiva.jpg', companyId: 'comp1' },
      { id: 's4', name: 'Maquiagem Social Deslumbrante', description: 'Maquiagem para eventos especiais.', duration: 90, price: 150, companyCategory: 'fem_maquiagem', image: 'url_maquiagem.jpg', companyId: 'comp1' },
      { id: 's5', name: 'Limpeza de Pele Profunda', description: 'Limpeza profunda com extração e máscara.', duration: 75, price: 120, companyCategory: 'fem_pele', image: 'url_limpeza_pele.jpg', companyId: 'comp1' },
      { id: 's6', name: 'Corte Masculino Clássico', description: 'Corte clássico ou moderno para homens.', duration: 40, price: 50, companyCategory: 'masc_cabelo', image: 'url_corte_masculino.jpg', companyId: 'comp2' },
      { id: 's7', name: 'Barba Terapia Relaxante', description: 'Modelagem e hidratação completa da barba.', duration: 45, price: 60, companyCategory: 'masc_barba', image: 'url_barba.jpg', companyId: 'comp2' },
      { id: 's8_unha_gel_mock', name: 'Unha de Gel (Mock)', description: 'Alongamento em gel com alta durabilidade.', duration: 120, price: 120, companyCategory: 'fem_unhas', companyId: 'comp3' },
    ]));
  }

  if (!localStorage.getItem('professionals')) {
    localStorage.setItem('professionals', JSON.stringify([
      { id: 'p1', name: 'Ana Silva', role: 'Cabeleireira Master', specialties: ['Cortes Longos', 'Coloração', 'Progressiva'], phone: '11999990001', email: 'ana@example.com', services: ['s1', 's3', 's4'], image: 'url_ana.jpg', availability: { monday: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'], tuesday: [], wednesday: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'], thursday: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'], friday: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'], saturday: ['09:00', '10:00', '11:00', '12:00'], sunday: [] }, companyId: 'comp1', commissionRate: 50 },
      { id: 'p2', name: 'Beatriz Costa', role: 'Manicure e Pedicure', specialties: ['Unhas Artísticas', 'Spa dos Pés'], phone: '11999990002', email: 'beatriz@example.com', services: ['s2'], image: 'url_beatriz.jpg', availability: { monday: ['09:30', '10:30', '11:30', '13:30', '14:30', '15:30', '16:30'], tuesday: ['09:30', '10:30', '11:30', '13:30', '14:30', '15:30', '16:30'], wednesday: [], thursday: ['09:30', '10:30', '11:30', '13:30', '14:30', '15:30', '16:30'], friday: ['09:30', '10:30', '11:30', '13:30', '14:30', '15:30', '16:30'], saturday: ['09:30', '10:30', '11:30'], sunday: [] }, companyId: 'comp3', commissionRate: 40 },
      { id: 'p3', name: 'Carlos Lima', role: 'Barbeiro Chefe', specialties: ['Cortes Clássicos', 'Navalha', 'Barba Terapia'], phone: '11999990003', email: 'carlos@example.com', services: ['s6', 's7'], image: 'url_carlos.jpg', availability: { monday: [], tuesday: ['08:00', '09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00', '18:00'], wednesday: ['08:00', '09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00', '18:00'], thursday: ['08:00', '09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00', '18:00'], friday: ['08:00', '09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00', '18:00'], saturday: ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00'], sunday: [] }, companyId: 'comp2', commissionRate: 60 },
    ]));
  }

  if (!localStorage.getItem('clients')) {
    localStorage.setItem('clients', JSON.stringify([
      { id: 'c1', name: 'Juliana Moreira', cpf: '111.111.111-11', phone: '11988880001', email: 'juliana@example.com', birthdate: '1990-05-15', notes: 'Prefere esmalte claro', password: '123' },
      { id: 'c2', name: 'Ricardo Alves', cpf: '222.222.222-22', phone: '11988880002', email: 'ricardo@example.com', birthdate: '1985-10-20', notes: 'Cliente VIP', password: '123' },
    ]));
  }

  if (!localStorage.getItem('appointments')) {
    localStorage.setItem('appointments', JSON.stringify([
      { id: 'a1', clientId: 'c1', professionalId: 'p1', serviceId: 's1', date: '2025-06-10', time: '10:00', status: 'concluido', notes: 'Chegar 10 min antes', companyId: 'comp1', price: 80 },
      { id: 'a2', clientId: 'c2', professionalId: 'p3', serviceId: 's6', date: '2025-06-11', time: '14:30', status: 'agendado', notes: '', companyId: 'comp2', price: 50 },
    ]));
  }
  
  if (!localStorage.getItem('companies')) {
    localStorage.setItem('companies', JSON.stringify([
      { 
        id: 'comp1', 
        name: 'Salão Glamour Total', 
        cnpj: '11.111.111/0001-11',
        ownerName: 'Maria Glamour',
        email: 'contato@glamourtotal.com',
        phone: '(11) 5555-1234',
        address: 'Rua das Palmeiras, 123, São Paulo, SP',
        companyCategories: ['fem_cabelo', 'fem_maquiagem', 'fem_pele'], 
        description: 'O melhor salão da região, especializado em cortes, colorações e tratamentos capilares de luxo.',
        coverImage: 'https://images.unsplash.com/photo-1599387739544-73c856a40268?q=80&w=1200&auto=format&fit=crop',
        rating: 4.8,
        reviewsCount: 120,
        openingHours: [
            { day: 'Segunda a Sexta', hours: '09:00 - 19:00' },
            { day: 'Sábado', hours: '09:00 - 17:00' },
            { day: 'Domingo', hours: 'Fechado' }
        ],
        serviceIds: ['s1', 's3', 's4', 's5'], 
        professionalIds: ['p1'],
        productIds: ['prod1', 'prod2'],
        allowClientToChooseProfessional: true,
      },
      { 
        id: 'comp2', 
        name: 'Barbearia Dom Bigode', 
        cnpj: '22.222.222/0001-22',
        ownerName: 'Pedro Bigode',
        email: 'contato@dombigode.com',
        phone: '(21) 5555-5678',
        address: 'Avenida Central, 45, Rio de Janeiro, RJ',
        companyCategories: ['masc_cabelo', 'masc_barba'], 
        description: 'Cortes clássicos e modernos, barba terapia e um ambiente premium para o homem moderno.',
        coverImage: 'https://images.unsplash.com/photo-1621607512022-6aecc4fed814?q=80&w=1200&auto=format&fit=crop',
        rating: 4.9,
        reviewsCount: 95,
        openingHours: [
            { day: 'Terça a Sábado', hours: '10:00 - 20:00' },
            { day: 'Domingo e Segunda', hours: 'Fechado' }
        ],
        serviceIds: ['s6', 's7'], 
        professionalIds: ['p3'],
        productIds: ['prod3'],
        allowClientToChooseProfessional: true,
      },
      { 
        id: 'comp3', 
        name: 'Unhas de Diva Esmalteria',
        cnpj: '33.333.333/0001-33',
        ownerName: 'Carla Unhas',
        email: 'contato@unhasdiva.com',
        phone: '(31) 5555-8765',
        address: 'Rua das Flores, 789, Belo Horizonte, MG',
        companyCategories: ['fem_unhas'], 
        description: 'Especializadas em unhas artísticas, alongamentos e spa dos pés e mãos. Venha ser uma diva!',
        coverImage: 'https://images.unsplash.com/photo-1604654894610-df62318583e1?q=80&w=1200&auto=format&fit=crop',
        rating: 4.7,
        reviewsCount: 78,
        openingHours: [
            { day: 'Segunda a Sábado', hours: '09:00 - 18:00' },
            { day: 'Domingo', hours: 'Fechado' }
        ],
        serviceIds: ['s2', 's8_unha_gel_mock'], 
        professionalIds: ['p2'],
        productIds: [],
        allowClientToChooseProfessional: false,
      }
    ]));
  }

  if (!localStorage.getItem('products')) {
    localStorage.setItem('products', JSON.stringify([
        { id: 'prod1', name: 'Shampoo Hidratante Luxo', description: 'Shampoo para cabelos secos e danificados, com óleo de argan.', price: 55.00, image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=300&auto=format&fit=crop' },
        { id: 'prod2', name: 'Condicionador Fortalecedor', description: 'Condicionador para fortalecimento e brilho.', price: 60.00, image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=300&auto=format&fit=crop' },
        { id: 'prod3', name: 'Óleo para Barba Premium', description: 'Óleo hidratante e modelador para barba.', price: 45.00, image: 'https://images.unsplash.com/photo-1631730165003-308912595c25?q=80&w=300&auto=format&fit=crop' }
    ]));
  }
  if (!localStorage.getItem('companyExpenses')) {
    localStorage.setItem('companyExpenses', JSON.stringify([]));
  }
};

export const getServices = () => {
  return JSON.parse(localStorage.getItem('services') || '[]');
};
export const getServiceById = (id) => {
  const services = getServices();
  return services.find(service => service.id === id);
};
export const saveService = (service) => {
  let services = getServices();
  if (service.id) { 
    services = services.map(s => s.id === service.id ? service : s);
  } else { 
    service.id = `s${Date.now()}`; 
    services.push(service);
  }
  localStorage.setItem('services', JSON.stringify(services));
};
export const deleteService = (id) => {
  let services = getServices();
  services = services.filter(s => s.id !== id);
  localStorage.setItem('services', JSON.stringify(services));
};

export const getProfessionals = () => {
  return JSON.parse(localStorage.getItem('professionals') || '[]');
};
export const getProfessionalById = (id) => {
  const professionals = getProfessionals();
  return professionals.find(prof => prof.id === id);
};
export const saveProfessional = (professional) => {
  let professionals = getProfessionals();
  if (professional.id) {
    professionals = professionals.map(p => p.id === professional.id ? professional : p);
  } else {
    professional.id = `p${Date.now()}`;
    if (!professional.availability) {
        professional.availability = { /* default */ };
    }
    if (!professional.services) professional.services = [];
    if (professional.commissionRate === undefined) professional.commissionRate = 0;
    professionals.push(professional);
  }
  localStorage.setItem('professionals', JSON.stringify(professionals));
};
export const deleteProfessional = (id) => {
  let professionals = getProfessionals();
  professionals = professionals.filter(p => p.id !== id);
  localStorage.setItem('professionals', JSON.stringify(professionals));
};

export const getClients = () => {
  return JSON.parse(localStorage.getItem('clients') || '[]');
};
export const getClientById = (id) => {
  const clients = getClients();
  return clients.find(client => client.id === id);
};
export const saveClient = (client) => {
  let clients = getClients();
  if (client.id) {
    const existingClient = clients.find(c => c.id === client.id);
    if (existingClient && !client.password) {
        client.password = existingClient.password;
    }
    clients = clients.map(c => c.id === client.id ? client : c);
  } else {
    client.id = `c${Date.now()}`;
    if (!client.password) throw new Error("Senha é obrigatória para novos clientes.");
    clients.push(client);
  }
  localStorage.setItem('clients', JSON.stringify(clients));
};
export const deleteClient = (id) => {
  let clients = getClients();
  clients = clients.filter(c => c.id !== id);
  localStorage.setItem('clients', JSON.stringify(clients));
};

export const getAppointments = () => {
  return JSON.parse(localStorage.getItem('appointments') || '[]');
};
export const getAppointmentsByClient = (clientId) => {
  const appointments = getAppointments();
  return appointments.filter(app => app.clientId === clientId);
};
export const getAppointmentsByProfessional = (professionalId) => {
  const appointments = getAppointments();
  return appointments.filter(app => app.professionalId === professionalId);
};
export const getAppointmentsByProfessionalAndDate = (professionalId, date) => {
  const appointments = getAppointments();
  return appointments.filter(app => app.professionalId === professionalId && app.date === date && app.status !== 'cancelado');
};

export const saveAppointment = (appointment) => {
  let appointments = getAppointments();
  if (appointment.id) {
    appointments = appointments.map(a => a.id === appointment.id ? appointment : a);
  } else {
    appointment.id = `a${Date.now()}`;
    appointments.push(appointment);
  }
  localStorage.setItem('appointments', JSON.stringify(appointments));
};
export const deleteAppointment = (id) => {
  let appointments = getAppointments();
  appointments = appointments.filter(a => a.id !== id);
  localStorage.setItem('appointments', JSON.stringify(appointments));
};

export const getCompanies = () => {
  return JSON.parse(localStorage.getItem('companies') || '[]');
};

export const getCompanyById = (companyId) => {
  const companies = getCompanies();
  return companies.find(company => company.id === companyId);
};

export const saveCompany = (companyData) => {
  let companies = getCompanies();
  if (companyData.id) {
    companies = companies.map(c => c.id === companyData.id ? { ...c, ...companyData } : c);
  } else {
    console.error("Tentativa de salvar nova empresa sem ID via saveCompany.");
    return; 
  }
  localStorage.setItem('companies', JSON.stringify(companies));
};


export const getServicesByCompanyId = (companyId) => {
  const company = getCompanyById(companyId);
  if (!company || !company.serviceIds) return [];
  const allServices = getServices();
  return company.serviceIds.map(serviceId => allServices.find(s => s.id === serviceId)).filter(Boolean);
};

export const getProductsByCompanyId = (companyId) => {
  const company = getCompanyById(companyId);
  if (!company || !company.productIds) return [];
  const allProducts = JSON.parse(localStorage.getItem('products') || '[]');
  return company.productIds.map(productId => allProducts.find(p => p.id === productId)).filter(Boolean);
};

export const getProfessionalsByCompanyId = (companyId) => {
  const allProfessionals = getProfessionals();
  return allProfessionals.filter(p => p.companyId === companyId);
};

const timeToMinutes = (timeStr) => {
  if (!timeStr || !timeStr.includes(':')) return 0;
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};

const minutesToTime = (totalMinutes) => {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};

export const getAvailableTimeSlots = (professionalId, date, serviceDuration = 60) => {
  const professional = getProfessionalById(professionalId);
  if (!professional || !professional.availability) {
    return [];
  }

  const dayOfWeek = new Date(date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  const dailySchedule = professional.availability[dayOfWeek];
  
  if (!dailySchedule || dailySchedule.length === 0) return [];

  const bookedAppointments = getAppointmentsByProfessionalAndDate(professionalId, date);
  
  const availableSlots = [];
  const slotInterval = 30; 

  const dayStartTime = timeToMinutes(dailySchedule[0]);
  const dayEndTime = timeToMinutes(dailySchedule[dailySchedule.length -1]) + slotInterval;

  for (let currentTimeInMinutes = dayStartTime; currentTimeInMinutes < dayEndTime; currentTimeInMinutes += slotInterval) {
    const slotStartTime = currentTimeInMinutes;
    const slotEndTime = currentTimeInMinutes + serviceDuration;
    const slotStartTimeStr = minutesToTime(slotStartTime);
    
    if (!dailySchedule.includes(slotStartTimeStr)) {
        continue;
    }
    
    let conflict = false;
    for (const appointment of bookedAppointments) {
      const appointmentService = getServiceById(appointment.serviceId);
      const appointmentDuration = appointmentService?.duration || 60; 
      const appointmentStartTime = timeToMinutes(appointment.time);
      const appointmentEndTime = appointmentStartTime + appointmentDuration;

      if (slotStartTime < appointmentEndTime && slotEndTime > appointmentStartTime) {
        conflict = true;
        break;
      }
    }

    if (!conflict) {
      availableSlots.push(slotStartTimeStr);
    }
  }
  return availableSlots;
};

export const getCompanyExpenses = (companyId) => {
  const allExpenses = JSON.parse(localStorage.getItem('companyExpenses') || '[]');
  return allExpenses.filter(expense => expense.companyId === companyId);
};

export const saveCompanyExpense = (expense) => {
  let expenses = JSON.parse(localStorage.getItem('companyExpenses') || '[]');
  if (expense.id) {
    expenses = expenses.map(e => e.id === expense.id ? expense : e);
  } else {
    expense.id = `exp${Date.now()}`;
    expenses.push(expense);
  }
  localStorage.setItem('companyExpenses', JSON.stringify(expenses));
};

export const deleteCompanyExpense = (id) => {
  let expenses = JSON.parse(localStorage.getItem('companyExpenses') || '[]');
  expenses = expenses.filter(e => e.id !== id);
  localStorage.setItem('companyExpenses', JSON.stringify(expenses));
};


initializeData();
