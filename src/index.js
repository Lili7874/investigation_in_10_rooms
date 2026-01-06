// src/index.js
import React from 'react';
import { createRoot } from 'react-dom/client';
import './styles/index.css';
import App from './App';

const container = document.getElementById('root');
createRoot(container).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
