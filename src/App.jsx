import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/MainLayout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Billing from './pages/Billing';
import InvoicePreview from './pages/InvoicePreview';
import Patients from './pages/Patients';
import Settings from './pages/Settings';

const Placeholder = ({ title }) => (
  <div className="flex items-center justify-center h-full">
    <h2 className="text-2xl font-bold text-slate-300 italic">{title} - Próximamente</h2>
  </div>
);

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        
        {/* Protected Routes (MainLayout) */}
        <Route path="/dashboard" element={<MainLayout><Dashboard /></MainLayout>} />
        <Route path="/appointments" element={<MainLayout><Placeholder title="Citas" /></MainLayout>} />
        <Route path="/billing" element={<MainLayout><Billing /></MainLayout>} />
        <Route path="/billing/invoice/:id" element={<MainLayout><InvoicePreview /></MainLayout>} />
        <Route path="/patients" element={<MainLayout><Patients /></MainLayout>} />
        <Route path="/notifications" element={<MainLayout><Placeholder title="Notificaciones" /></MainLayout>} />
        <Route path="/settings" element={<MainLayout><Settings /></MainLayout>} />
        
        {/* Legacy / Redirects */}
        <Route path="/dashboard/recepcionista" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
