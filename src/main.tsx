import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { AlertConfirmProvider } from './context/AlertConfirmContext.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AlertConfirmProvider>
      <App />
    </AlertConfirmProvider>
  </StrictMode>,
);

