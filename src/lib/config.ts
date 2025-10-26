// Arquivo de configuração de ambiente
// IMPORTANTE: Este arquivo deve ser adicionado ao .gitignore em produção
// Para usar variáveis de ambiente, crie um arquivo .env.local na raiz do projeto

export const firebaseConfig = {
  apiKey: "AIzaSyCmrjyT6S4fYfQSPQu7BZRPKCdu4d63dbU",
  authDomain: "votacao-online-bcec9.firebaseapp.com",
  databaseURL: "https://votacao-online-bcec9-default-rtdb.firebaseio.com",
  projectId: "votacao-online-bcec9",
  storageBucket: "votacao-online-bcec9.firebasestorage.app",
  messagingSenderId: "1055298610339",
  appId: "1:1055298610339:web:3f3942703e716b9bbbcb16"
};

// Configurações de debug
export const DEBUG_MODE = import.meta.env.VITE_DEBUG_MODE === 'true' || false;

// URLs da aplicação
export const APP_URLS = {
  enterRoom: '/enter-room',
  adminLogin: '/admin/login',
  adminDashboard: '/admin/dashboard',
  createRoom: '/admin/create-room',
  roomManagement: (id: string) => `/admin/room/${id}`,
  roomVote: (id: string) => `/room/${id}/vote`,
  votationResults: (id: string) => `/admin/votation/${id}/results`
};

// Configurações de timeout
export const TIMEOUTS = {
  firebase: 10000, // 10 segundos
  retry: 3000,    // 3 segundos
  maxRetries: 3
};
