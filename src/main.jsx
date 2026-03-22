import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { reseedStudents } from './services/seedFirestore';
window.__reseedStudents = reseedStudents;

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
