import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import DashboardRecepcionista from './pages/DashboardRecepcionista';
import DashboardDentista from './pages/DashboardDentista';
import DashboardAdminGlobal from './pages/DashboardAdminGlobal';
import DentistWorkstation from './pages/DentistWorkstation';
import Dashboard from './pages/Dashboard';
import Billing from './pages/Billing';
import InvoicePreview from './pages/InvoicePreview';
import Patients from './pages/Patients';
import Appointments from './pages/Appointments';
import Logs from './pages/Logs';
import Settings from './pages/Settings';
import AdminStats from './pages/AdminStats';
import ScrollToTop from './components/ScrollToTop';
import { PrivacyPolicy, TermsOfService, CookiesPolicy } from './pages/LegalPages';
import { supabase } from './lib/supabase';

const RoleRedirect = ({ toSettings = false }) => {
  const [target, setTarget] = React.useState(null);

  React.useEffect(() => {
    const getRedirect = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setTarget('/login');
        return;
      }

      const { data: profile } = await supabase
        .from('perfiles')
        .select('roles(nombre)')
        .eq('id', session.user.id)
        .single();

      const role = profile?.roles?.nombre;
      if (role === 'ADMIN_GLOBAL') {
        setTarget(toSettings ? '/dashboard/adminglobal/gestion' : '/dashboard/adminglobal');
      } else if (role === 'ORTODONCISTA') {
        setTarget(toSettings ? '/dashboard/dentista/pacientes' : '/dashboard/dentista');
      } else {
        setTarget(toSettings ? '/dashboard/recepcionista/gestion' : '/dashboard/recepcionista');
      }
    };
    getRedirect();
  }, [toSettings]);

  if (!target) return null;
  return <Navigate to={target} replace />;
};

function App() {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Dashboard Admin Global */}
        <Route path="/dashboard/adminglobal" element={<DashboardAdminGlobal />}>
          <Route index element={<Dashboard />} />
          <Route path="pacientes" element={<Patients />} />
          <Route path="estadisticas" element={<AdminStats />} />
          <Route path="equipo" element={<Settings />} />
          <Route path="gestion" element={<Settings />} />
        </Route>

        {/* Dashboard Recepcionista */}
        <Route path="/dashboard/recepcionista" element={<DashboardRecepcionista />}>
          <Route index element={<Dashboard />} />
          <Route path="citas" element={<Appointments />} />
          <Route path="facturacion" element={<Billing />} />
          <Route path="facturacion/invoice/:id" element={<InvoicePreview />} />
          <Route path="pacientes" element={<Patients />} />
          <Route path="logs" element={<Logs />} />
          <Route path="gestion" element={<Settings />} />
        </Route>

        {/* Dashboard Dentista */}
        <Route path="/dashboard/dentista" element={<DashboardDentista />}>
          <Route index element={<DentistWorkstation />} />
          <Route path="pacientes" element={<Patients />} />
        </Route>

        <Route path="/privacidad" element={<PrivacyPolicy />} />
        <Route path="/terminos" element={<TermsOfService />} />
        <Route path="/cookies" element={<CookiesPolicy />} />

        {/* Redirecciones de conveniencia */}
        <Route path="/dashboard" element={<RoleRedirect />} />
        <Route path="/settings" element={<RoleRedirect toSettings />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
