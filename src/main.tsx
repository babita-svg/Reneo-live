import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { AuthProvider } from './context/AuthContext.tsx';
import { LiveProvider } from './context/LiveContext.tsx';
import { CartProvider } from './context/CartContext.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <LiveProvider>
        <CartProvider>
          <App />
        </CartProvider>
      </LiveProvider>
    </AuthProvider>
  </StrictMode>
);
