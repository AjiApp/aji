import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App.jsx';
import './styles/variables.css';
import './styles/global.css';
import './styles/animations.css';
import './index.css';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Désactiver le refetch lors du focus de fenêtre
      retry: 1, // Nombre de tentatives en cas d'échec
      staleTime: 5 * 60 * 1000, // 5 minutes (temps durant lequel les données sont considérées comme "fraîches")
      cacheTime: 30 * 60 * 1000, // 30 minutes (temps durant lequel les données sont conservées en cache)
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>,
);