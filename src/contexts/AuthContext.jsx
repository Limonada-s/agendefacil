// Em: src/contexts/AuthContext.jsx

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api'; 
import { jwtDecode } from 'jwt-decode';

export const userRoles = {
  ADMIN: 'admin',
  PROFESSIONAL: 'professional',
  CLIENT: 'cliente',
  SUPER_ADMIN: 'superadmin',
};

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  const loadUserFromToken = useCallback(() => {
    console.log("%c[AUTH SPY - RELOAD] Verificando token no localStorage...", "color: orange; font-weight: bold;");
    const storedToken = localStorage.getItem('token');
    
    if (storedToken) {
      try {
        const decoded = jwtDecode(storedToken);
        console.log("%c[AUTH SPY - RELOAD] Token encontrado e decodificado:", "color: green; font-weight: bold;", decoded);

        if (decoded.exp * 1000 < Date.now()) throw new Error("Token expirado");
        setUser(decoded);
        setToken(storedToken);
      } catch (err) {
        console.error("[AUTH SPY - RELOAD] Erro ao carregar token:", err);
        localStorage.removeItem('token');
        setUser(null);
        setToken(null);
      }
    } else {
        console.log("%c[AUTH SPY - RELOAD] Nenhum token encontrado no localStorage.", "color: red;");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadUserFromToken();
  }, [loadUserFromToken]);

  // ===================================================================
  // FUNÇÃO DE ATUALIZAÇÃO CORRIGIDA COM SINCRONIZAÇÃO FORÇADA
  // ===================================================================
  const updateUserAndToken = (newToken, newUser) => {
      console.log("Salvando o NOVO token no localStorage...");
      localStorage.setItem('token', newToken);
      
      // Força a releitura do token que acabamos de salvar.
      // Isso garante que o estado do AuthContext está 100% sincronizado
      // com a fonte da verdade (localStorage) ANTES de qualquer navegação.
      console.log("Forçando a releitura do token para sincronizar o estado do React...");
      loadUserFromToken(); 
  };

  const login = async (email, password) => {
    try {
      const res = await api.post('/users/login', { email, senha: password });
      const { token: newToken, usuario: newUser } = res.data;
      
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(newUser);
      
      return newUser;
    } catch (error) {
      localStorage.removeItem('token');
      setUser(null);
      setToken(null);
      console.error('[AuthContext Error] Detalhes do erro recebido do Axios:', error.response);
      if (error.response && error.response.data) {
        throw error.response.data;
      } else {
        throw { erro: 'Erro de conexão ou resposta inesperada do servidor.' };
      }
    }
  };

  const registerCompanyAndLogin = async (companyData) => {
    try {
      await api.post('/empresas/register-company', companyData);
      const loggedInUser = await login(companyData.email_admin, companyData.senha);
      return loggedInUser;
    } catch (error) {
      setUser(null);
      localStorage.removeItem('token');
      throw error;
    }
  };

  const signUp = async (userData) => {
    try {
      const response = await api.post('/users/register', userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  };

  const loginSuperAdmin = async (credentials) => {
    try {
      const res = await api.post('/users/super-login', credentials);
      localStorage.setItem('token', res.data.token);
      loadUserFromToken(); 
      return res.data.usuario;
    } catch (error) {
      localStorage.removeItem('token');
      setUser(null);
      setToken(null);
      throw error.response?.data || error;
    }
  };

  const logout = async (navigate) => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    try { 
      await api.post('/users/logout'); 
    } catch (error) { 
      console.error("Erro no logout da API, deslogando no frontend.", error);
    }
    navigate('/login', { replace: true });
  };

  const isAuthenticated = !!user;
  const userType = user ? user.tipo : null;

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, userType, loading, login, signUp, loginSuperAdmin, logout, registerCompanyAndLogin, updateUserAndToken }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
