import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 15000 // 15 segundos de timeout para tolerar oscilações de sinal no campo
});

export default api;