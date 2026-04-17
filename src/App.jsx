import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import DashboardRecepcionista from './pages/DashboardRecepcionista';
import Dashboard from './pages/Dashboard';
import Billing from './pages/Billing';
import InvoicePreview from './pages/InvoicePreview';
import Patients from './pages/Patients';
import Appointments from './pages/Appointments';
import Settings from './pages/Settings';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        
        {/* Dashboard y sus secciones usando tu DashboardRecepcionista como Layout */}
        <Route path="/dashboard/recepcionista" element={<DashboardRecepcionista />}>
          <Route index element={<Dashboard />} />
          <Route path="citas" element={<Appointments />} />
          <Route path="facturacion" element={<Billing />} />
          <Route path="facturacion/invoice/:id" element={<InvoicePreview />} />
          <Route path="pacientes" element={<Patients />} />
          <Route path="notificaciones" element={<Dashboard />} />
          <Route path="ajustes" element={<Settings />} />
        </Route>

        {/* Redirecciones de conveniencia */}
        <Route path="/dashboard" element={<Navigate to="/dashboard/recepcionista" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
