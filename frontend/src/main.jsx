// src/main.jsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './index.css';
import { StockProvider } from './Context/StockContext.jsx';
const queryClient = new QueryClient();


createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <StockProvider>
      <StrictMode>
        <App />
      </StrictMode>
    </StockProvider>
  </BrowserRouter>
);
