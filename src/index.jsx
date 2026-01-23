// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import Patient from './Patient.js'; // Import your Patient component

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Patient />
  </React.StrictMode>
);