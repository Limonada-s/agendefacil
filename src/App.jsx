import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from "react-router-dom";
import Layout from "@/components/layout/Layout";

import { Toaster } from "@/components/ui/toaster";

// Páginas existentes
import HomePage from "@/pages/HomePage";
import AppointmentsPage from "@/pages/AppointmentsPage";
import ClientsPage from "@/pages/ClientsPage";
import ServicesPage from "@/pages/ServicesPage"; 
import ProfessionalsPage from "@/pages/ProfessionalsPage"; 
import LoginPage from "@/pages/LoginPage";
import FinancialDashboardPage from "@/pages/FinancialDashboardPage"; 
import ClientServiceDiscoveryPage from "@/pages/ClientServiceDiscoveryPage"; 
import CompanyRegistrationPage from "@/pages/CompanyRegistrationPage"; 
import PricingPage from "@/pages/PricingPage"; 
import CompanyProfilePage from "@/pages/CompanyProfilePage"; 
import AppearanceSettingsPage from "@/pages/AppearanceSettingsPage";
import CheckoutPage from "@/pages/CheckoutPage"; 
import PaymentSuccessPage from "@/pages/PaymentSuccessPage";
import PaymentFailedPage from "@/pages/PaymentFailedPage";
import CompanySettingsPage from "@/pages/CompanySettingsPage";
import MyBookingsPage from "@/pages/MyBookingsPage";
import ScheduleAppointmentPage from "@/pages/ScheduleAppointmentPage";
import ServiceHistoryPage from "@/pages/ServiceHistoryPage";
import EmpresaDetalhesPage from '@/pages/EmpresaDetalhesPage';
import ManageReviewsPage from '@/pages/ManageReviewsPage';

// Páginas do Profissional
import ProfessionalAgendaPage from "@/pages/ProfessionalAgendaPage";
import ProfessionalProfilePage from "@/pages/ProfessionalProfilePage";
import ProfessionalEarningsPage from "@/pages/ProfessionalEarningsPage";
import ProfessionalSchedulePage from '@/pages/ProfessionalSchedulePage';

// Páginas do Super Admin
import SuperAdminDashboardPage from '@/pages/SuperAdminDashboardPage';
import ManageCompaniesPage from '@/pages/ManageCompaniesPage';
import SuperAdminLoginPage from '@/pages/SuperAdminLoginPage';

// Páginas para redefinição de senha
import ForgotPasswordPage from '@/pages/ForgotPasswordPage';
import ResetPasswordPage from '@/pages/ResetPasswordPage';

import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { BusinessProvider } from "@/contexts/BusinessContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AppointmentsProvider } from "@/contexts/AppointmentsContext";

const StandaloneLayout = () => (
  <div className="min-h-screen bg-background">
    <Outlet /> {/* O Outlet renderiza a rota filha (ex: LoginPage, PaymentSuccessPage) */}
  </div>
);

const MainAppLayout = () => {
  const { userType } = useAuth();
  return (
    <Layout>
      <Routes>
        {/* Rota principal (redireciona com base no tipo de usuário) */}
        <Route path="/" element={
            userType === 'admin' ? <HomePage /> :
            userType === 'cliente' ? <Navigate to="/descobrir-servicos" replace /> :
            userType === 'professional' ? <Navigate to="/minha-agenda" replace /> :
            userType === 'superadmin' ? <Navigate to="/superadmin/dashboard" replace /> :
            <Navigate to="/login" replace />
        } />

        {/* Rotas de Administrador */}
        {userType === 'admin' && (
          <>
            <Route path="/agendamentos" element={<AppointmentsPage />} />
            <Route path="/clientes" element={<ClientsPage />} />
            <Route path="/servicos" element={<ServicesPage />} />
            <Route path="/profissionais" element={<ProfessionalsPage />} />
            <Route path="/financeiro" element={<FinancialDashboardPage />} />
            <Route path="/historico-atendimentos" element={<ServiceHistoryPage />} />
            <Route path="/configuracoes/aparencia" element={<AppearanceSettingsPage />} /> 
            <Route path="/configuracoes/empresa" element={<CompanySettingsPage />} />
            <Route path="/gerenciar-avaliacoes" element={<ManageReviewsPage />} />
            <Route path="/planos" element={<PricingPage />} />
          </>
        )}

        {/* Rotas de Cliente */}
        {userType === 'cliente' && (
          <>
            <Route path="/descobrir-servicos" element={<ClientServiceDiscoveryPage />} />
            <Route path="/meus-agendamentos" element={<MyBookingsPage />} />
            <Route path="/empresas/:id" element={<EmpresaDetalhesPage />} />
            <Route path="/agendar" element={<ScheduleAppointmentPage />} />
          </>
        )}
        
        {/* Rotas para o tipo 'professional' */}
        {userType === 'professional' && (
          <>
            <Route path="/minha-agenda" element={<ProfessionalAgendaPage />} />
            <Route path="/meu-perfil-profissional" element={<ProfessionalProfilePage />} />
            <Route path="/meus-ganhos" element={<ProfessionalEarningsPage />} />
            <Route path="/meus-horarios" element={<ProfessionalSchedulePage />} />
          </>
        )}

        {/* Rotas para o tipo 'superadmin' */}
        {userType === 'superadmin' && (
          <>
            <Route path="/superadmin/dashboard" element={<SuperAdminDashboardPage />} />
            <Route path="/superadmin/companies" element={<ManageCompaniesPage />} />
          </>
        )}

        {/* Rota de fallback para qualquer outra URL quando logado */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
};


const AppContent = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <div className="flex h-screen items-center justify-center">Carregando...</div>;

  return (
    <Routes>
      {!isAuthenticated && (
        <Route element={<StandaloneLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/registrar-empresa" element={<CompanyRegistrationPage />} />
          <Route path="/super-login" element={<SuperAdminLoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          {/* Qualquer outra rota redireciona para o login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Route>
      )}

      {/* Se o usuário ESTIVER autenticado, ele acessa estas rotas */}
      {isAuthenticated && (
        <>
          {/* Rotas de pagamento ficam em um layout separado, sem o menu principal */}
          <Route element={<StandaloneLayout />}>
            <Route path="/pagamento/sucesso" element={<PaymentSuccessPage />} />
            <Route path="/pagamento/falha" element={<PaymentFailedPage />} />
          </Route>

          {/* Todas as outras rotas protegidas usam o Layout principal */}
          <Route path="/*" element={<MainAppLayout />} />
        </>
      )}
    </Routes>
  );
};


const App = () => {
  return (
    <Router>
      <ThemeProvider>
        <BusinessProvider>
          <AuthProvider>
            <AppointmentsProvider>
              <AppContent />
              <Toaster />
            </AppointmentsProvider>
          </AuthProvider>
        </BusinessProvider>
      </ThemeProvider>
    </Router>
  );
};

export default App;
