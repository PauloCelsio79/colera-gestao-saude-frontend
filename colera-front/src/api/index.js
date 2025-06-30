import axios from 'axios';

// Cria uma instância do Axios
const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api', // A URL base da sua API Laravel
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Adiciona um interceptor de requisição para incluir o token de autenticação
api.interceptors.request.use(
  (config) => {
    // Pega o token do localStorage
    const token = localStorage.getItem('authToken');
    if (token) {
      // Adiciona o token ao cabeçalho de autorização
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    // Faz algo com o erro da requisição
    return Promise.reject(error);
  }
);

export default api;