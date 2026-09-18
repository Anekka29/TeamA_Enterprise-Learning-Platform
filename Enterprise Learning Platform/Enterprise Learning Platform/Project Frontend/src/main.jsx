import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

// Bootstrap CSS + Icons
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

// AOS
import AOS from 'aos';
import 'aos/dist/aos.css';

// Global Design System
import './styles/design-system.css';
import './styles/dashboard-layout.css';

// App
import App from './App.jsx';

// Initialise AOS
AOS.init({ duration: 700, once: true, easing: 'ease-out-cubic' });

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
