import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const ProtectedRoute = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    // Se não estiver autenticado, redireciona para a página de login,
    // guardando a localização original para redirecionar de volta após o login.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Se autenticado, renderiza o conteúdo da rota filha.
  return <Outlet />;
};

export default ProtectedRoute;