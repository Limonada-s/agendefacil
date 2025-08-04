import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import { useAuth } from './AuthContext';
import api from '../services/api';

const AppointmentsContext = createContext();

export const useAppointments = () => useContext(AppointmentsContext);

export const AppointmentsProvider = ({ children }) => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated, userType, user } = useAuth();

  const fetchAppointments = useCallback(async () => {
    if (!isAuthenticated) {
      setAppointments([]);
      setLoading(false);
      return;
    }

    let endpoint = '';
    if (userType === 'admin' && user?.companyId) {
      endpoint = `/agendamentos/empresa`;
    } else if (userType === 'cliente' || userType === 'user') { // <-- CORREÇÃO APLICADA AQUI
      // Agora aceita 'cliente' ou 'user' como um tipo de usuário válido
      endpoint = `/agendamentos/cliente`;
    } else {
      setAppointments([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await api.get(endpoint);
      setAppointments(response.data);
    } catch (error) {
      console.error('🔴 [AppointmentsContext] ERRO na API:', error);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, userType, user?.companyId]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  // A função para recarregar os dados é exportada com o nome 'reloadAppointments'
  const value = { appointments, loading, reloadAppointments: fetchAppointments };

  return (
    <AppointmentsContext.Provider value={value}>
      {children}
    </AppointmentsContext.Provider>
  );
};
