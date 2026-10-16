import React from 'react';
import ReactDOM from 'react-dom/client';
import { MotionConfig } from 'motion/react';
import App from './App';
import { AppStateProvider } from './contexts/AppStateContext';
import './styles/global.css';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    {/* reducedMotion="user" gates every motion component on the OS
        prefers-reduced-motion setting — one switch for the whole app. */}
    <MotionConfig reducedMotion="user">
      <AppStateProvider>
        <App />
      </AppStateProvider>
    </MotionConfig>
  </React.StrictMode>,
);
