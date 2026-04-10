import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, NavLink, Outlet, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import LanguageToggle from '../components/LanguageToggle';

const DashboardRecepcionista = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/login');
        return;
      }

      const { data: profile, error } = await supabase
        .from('perfiles')
        .select(`
          nombre_completo,
          rol_id,
          roles (nombre),
          clinicas (nombre_consultorio)
        `)
        .eq('id', session.user.id)
        .single();

      if (error || profile?.roles?.nombre !== 'RECEPCIONISTA') {
        console.error("Acceso denegado o error de perfil", error);
        navigate('/login');
        return;
      }

      setUserProfile(profile);
      setLoading(false);
    };

    checkUser();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <motion.div 
          animate={{ rotate: 360 }} 
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="bg-[#F8FAFC] text-slate-900 selection:bg-primary/20 min-h-screen flex">
      {/* Sidebar Colapsable */}
      <motion.aside 
        initial={false}
        animate={{ width: isSidebarCollapsed ? 80 : 280 }}
        className="h-screen fixed left-0 top-0 border-r-0 bg-slate-50/80 backdrop-blur-xl shadow-[20px_0px_40px_rgba(0,97,164,0.03)] flex flex-col p-4 gap-2 z-50 overflow-hidden"
      >
        <div className="mb-8 px-4 py-2 flex items-center gap-3 min-h-[64px]">
          <div className="w-10 h-10 rounded-xl editorial-gradient flex items-center justify-center shadow-lg shrink-0">
            <span className="material-symbols-outlined text-white text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>dentistry</span>
          </div>
          <AnimatePresence mode="wait">
            {!isSidebarCollapsed && (
              <motion.div 
                key="logo"
                initial={{ opacity: 0, x: -10 }} 
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex flex-col overflow-hidden"
              >
                <h1 className="text-xl font-bold bg-gradient-to-br from-blue-700 to-blue-400 bg-clip-text text-transparent truncate">MOLARIS OPS</h1>
                <p className="text-[10px] tracking-widest text-slate-400 font-bold uppercase truncate">
                  {userProfile?.clinicas?.nombre_consultorio || 'Santuario Dental'}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <nav className="flex-1 flex flex-col gap-1">
          <NavItem to="/dashboard/recepcionista" end icon="dashboard" label="Dashboard" collapsed={isSidebarCollapsed} />
          <NavItem to="/dashboard/recepcionista/citas" icon="calendar_today" label="Citas" collapsed={isSidebarCollapsed} />
          <NavItem to="/dashboard/recepcionista/facturacion" icon="payments" label="Facturación" collapsed={isSidebarCollapsed} />
          <NavItem to="/dashboard/recepcionista/pacientes" icon="group" label="Pacientes" collapsed={isSidebarCollapsed} />
          <NavItem to="/dashboard/recepcionista/notificaciones" icon="notifications" label="Notificaciones" collapsed={isSidebarCollapsed} />
          <NavItem to="/dashboard/recepcionista/ajustes" icon="settings" label="Ajustes" collapsed={isSidebarCollapsed} />
        </nav>

        <div className="mt-auto pt-4 border-t border-slate-100">
          <motion.div 
            whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.4)" }}
            className="flex items-center gap-3 px-4 py-3 text-slate-500 rounded-xl cursor-pointer transition-all duration-300 font-semibold text-sm"
          >
            <span className="material-symbols-outlined">account_circle</span>
            {!isSidebarCollapsed && (
              <div className="flex flex-col overflow-hidden">
                <span className="truncate">{userProfile?.nombre_completo || 'Usuario'}</span>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Recepcionista</span>
              </div>
            )}
          </motion.div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 transition-all duration-300 rounded-xl font-bold text-sm group cursor-pointer"
          >
            <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">logout</span>
            {!isSidebarCollapsed && <span>Cerrar Sesión</span>}
          </button>
        </div>
      </motion.aside>

      {/* Contenido Principal */}
      <main className={`flex-1 transition-all duration-300 ${isSidebarCollapsed ? 'ml-20' : 'ml-[280px]'}`}>
        {/* Header */}
        <header className="sticky top-0 h-20 z-40 bg-white/80 backdrop-blur-xl flex items-center justify-between px-10 border-b border-slate-100">
          <div className="flex items-center flex-1 max-w-xl">
            <div className="relative w-full group">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
              <input 
                className="w-full pl-12 pr-6 py-3 bg-slate-100/50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-slate-400" 
                placeholder="Buscar pacientes, citas o doctores..." 
                type="text"
              />
            </div>
          </div>
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-6 pr-6 border-r border-slate-100">
              <LanguageToggle />
            </div>
            <div className="flex items-center gap-4">
              <button className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-all relative">
                <span className="material-symbols-outlined">notifications</span>
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
              </button>
              <button 
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                className="w-10 h-10 flex items-center justify-center text-slate-400 hover:bg-slate-50 rounded-xl transition-all"
              >
                <span className="material-symbols-outlined">{isSidebarCollapsed ? 'menu' : 'menu_open'}</span>
              </button>
            </div>
            <button className="bg-primary text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-lg shadow-primary/20 active:scale-95 transition-all flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">add_circle</span>
              Nueva Cita
            </button>
          </div>
        </header>

        {/* El Outlet renderiza la página correspondiente a la ruta actual */}
        <motion.div 
          key={location.pathname}
          initial={{ y: 20, opacity: 0 }} 
          animate={{ y: 0, opacity: 1 }} 
          transition={{ duration: 0.3 }}
        >
          {location.pathname === '/dashboard/recepcionista' ? (
            <DashboardHome userProfile={userProfile} />
          ) : (
            <Outlet />
          )}
        </motion.div>
      </main>
    </div>
  );
};

const DashboardHome = ({ userProfile }) => (
  <div className="p-10">
    <div className="mb-10">
      <h2 className="text-3xl font-black tracking-tight text-slate-900">Bienvenido, {userProfile?.nombre_completo?.split(' ')[0]}</h2>
      <p className="text-slate-500 font-medium">Hoy es lunes, 21 de octubre de 2026</p>
    </div>

    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
      <div className="xl:col-span-2 space-y-8">
        <section className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
          <div className="px-8 py-8 border-b border-slate-50 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">Horario Semanal</h2>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Octubre 21 — 27, 2026</p>
            </div>
          </div>
          <div className="grid grid-cols-7 border-b border-slate-50 bg-slate-50/50">
              {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(d => (
                <div key={d} className="p-4 text-[10px] font-black text-slate-400 uppercase text-center border-r border-slate-100 last:border-r-0">{d}</div>
              ))}
          </div>
          <div className="h-[460px] flex items-center justify-center bg-white">
            <div className="flex flex-col items-center gap-4 text-slate-300">
              <span className="material-symbols-outlined text-5xl">calendar_month</span>
              <p className="italic text-sm font-medium">Cargando horario dinámico...</p>
            </div>
          </div>
        </section>
      </div>

      <div className="space-y-8">
        <section className="bg-primary rounded-[2rem] p-8 text-white shadow-xl shadow-primary/20 relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-xl font-bold mb-2">Resumen del Día</h3>
            <p className="text-primary-fixed-dim text-sm font-medium mb-6 opacity-80">Tienes 12 citas programadas para hoy.</p>
            <div className="space-y-4">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 flex items-center justify-between">
                <span className="text-sm font-bold">Completadas</span>
                <span className="text-2xl font-black">4</span>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 flex items-center justify-between">
                <span className="text-sm font-bold">Pendientes</span>
                <span className="text-2xl font-black">8</span>
              </div>
            </div>
          </div>
          <div className="absolute top-[-20%] right-[-20%] w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
        </section>
      </div>
    </div>
  </div>
);

const NavItem = ({ to, icon, label, collapsed = false, end = false }) => (
  <motion.div
    whileHover={{ x: 5 }}
    whileActive={{ scale: 0.98 }}
  >
    <NavLink 
      to={to}
      end={end}
      className={({ isActive }) => `flex items-center gap-4 px-4 py-3.5 transition-all rounded-2xl font-bold text-sm ${
        isActive 
          ? 'text-primary bg-primary/5 shadow-[0_4px_20px_rgba(0,97,164,0.08)]' 
          : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
      } group whitespace-nowrap`} 
    >
      <span className={`material-symbols-outlined transition-transform`}>{icon}</span>
      {!collapsed && <span>{label}</span>}
    </NavLink>
  </motion.div>
);

export default DashboardRecepcionista;
