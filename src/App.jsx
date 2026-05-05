import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import DashboardRecepcionista from './pages/DashboardRecepcionista';
import DashboardDentista from './pages/DashboardDentista';
import DentistWorkstation from './pages/DentistWorkstation';
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
        <Route path="/register" element={<Register />} />
        
        {/* Dashboard Recepcionista */}
        <Route path="/dashboard/recepcionista" element={<DashboardRecepcionista />}>
          <Route index element={<Dashboard />} />
          <Route path="citas" element={<Appointments />} />
          <Route path="facturacion" element={<Billing />} />
          <Route path="facturacion/invoice/:id" element={<InvoicePreview />} />
          <Route path="pacientes" element={<Patients />} />
          <Route path="gestion" element={<Settings />} />
        </Route>

        {/* Dashboard Dentista */}
        <Route path="/dashboard/dentista" element={<DashboardDentista />}>
          <Route index element={<DentistWorkstation />} />
          <Route path="pacientes" element={<Patients />} />
        </Route>

        {/* Redirecciones de conveniencia */}
        <Route path="/dashboard" element={<Navigate to="/dashboard/recepcionista" replace />} />
        <Route path="/settings" element={<Navigate to="/dashboard/recepcionista/gestion" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
