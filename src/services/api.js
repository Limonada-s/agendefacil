import axios from 'axios';

const api = axios.create({
  baseURL: 'https://agendefacil-backend-849628377389.southamerica-east1.run.app/api',
  
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  } 
});

// O interceptor para adicionar o token já está correto e pode continuar.
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

export default api;
