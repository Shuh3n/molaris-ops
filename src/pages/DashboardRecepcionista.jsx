import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const DashboardRecepcionista = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="bg-background text-on-surface selection:bg-primary/20 min-h-screen flex"
    >
      {/* Sidebar Colapsable */}
      <aside className={`h-screen ${isSidebarCollapsed ? 'w-20' : 'w-64'} fixed left-0 top-0 border-r-0 bg-white/80 backdrop-blur-xl shadow-[20px_0px_40px_rgba(0,97,164,0.03)] flex flex-col p-4 gap-2 z-50 transition-all duration-300`}>
        <div className="mb-8 px-4 py-2 flex items-center justify-between">
          {!isSidebarCollapsed && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h1 className="text-xl font-bold bg-gradient-to-br from-primary to-blue-400 bg-clip-text text-transparent">MOLARIS OPS</h1>
              <p className="text-[10px] tracking-widest text-slate-400 font-bold uppercase">Santuario Dental</p>
            </motion.div>
          )}
          <button 
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-400"
          >
            <span className="material-symbols-outlined">{isSidebarCollapsed ? 'menu' : 'menu_open'}</span>
          </button>
        </div>

        <nav className="flex-1 flex flex-col gap-1">
          <NavItem icon="dashboard" label="Dashboard" collapsed={isSidebarCollapsed} />
          <NavItem icon="calendar_today" label="Citas" active collapsed={isSidebarCollapsed} />
          <NavItem icon="payments" label="Facturación" collapsed={isSidebarCollapsed} />
          <NavItem icon="group" label="Pacientes" collapsed={isSidebarCollapsed} />
          <NavItem icon="notifications" label="Notificaciones" collapsed={isSidebarCollapsed} />
          <NavItem icon="settings" label="Ajustes" collapsed={isSidebarCollapsed} />
        </nav>

        <div className="mt-auto pt-4 border-t border-slate-100 space-y-1">
          <div className="flex items-center gap-3 px-4 py-3 text-slate-500 rounded-xl font-headline tracking-tight text-sm font-semibold">
            <span className="material-symbols-outlined">account_circle</span>
            {!isSidebarCollapsed && <span>Perfil Usuario</span>}
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 transition-all duration-300 rounded-xl font-headline tracking-tight text-sm font-bold group cursor-pointer"
          >
            <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">logout</span>
            {!isSidebarCollapsed && <span>Cerrar Sesión</span>}
          </button>
        </div>
      </aside>

      {/* Contenido Principal */}
      <main className={`flex-1 ${isSidebarCollapsed ? 'ml-20' : 'ml-64'} transition-all duration-300`}>
        {/* Header */}
        <header className="sticky top-0 h-16 z-40 bg-white/70 backdrop-blur-2xl flex items-center justify-between px-8 border-b border-slate-100">
          <div className="flex items-center flex-1 max-w-xl">
            <div className="relative w-full group">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
              <input className="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-full text-sm focus:ring-2 focus:ring-primary/10 transition-all" placeholder="Buscar pacientes o horarios..." type="text"/>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4 text-slate-400">
              <button className="hover:text-primary transition-colors relative">
                <span className="material-symbols-outlined">notifications</span>
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
              </button>
              <button className="hover:text-primary transition-colors">
                <span className="material-symbols-outlined">help_outline</span>
              </button>
            </div>
            <button className="bg-gradient-to-br from-primary to-blue-400 text-white px-6 py-2.5 rounded-full font-headline font-bold text-sm shadow-lg shadow-primary/20 active:scale-95 transition-transform flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">add</span>
              Nueva Cita
            </button>
          </div>
        </header>

        {/* Canvas de Contenido */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }} 
          animate={{ y: 0, opacity: 1 }} 
          transition={{ delay: 0.2, duration: 0.5 }}
          className="p-8 flex flex-col xl:flex-row gap-8"
        >
          {/* ... resto del contenido igual ... */}
          {/* Mantenemos la estructura previa para no romper nada */}
          <div className="flex-1 space-y-8">
            <section className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Horario Semanal</h2>
                  <p className="text-slate-500 text-sm font-medium">Octubre 21 — 27, 2026</p>
                </div>
              </div>
              <div className="grid grid-cols-7 border-b border-slate-50 bg-slate-50/30 text-center">
                 {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(d => <div key={d} className="p-4 text-[10px] font-bold text-slate-400 uppercase">{d}</div>)}
              </div>
              <div className="h-[400px] flex items-center justify-center text-slate-300 italic">Cargando horario dinámico...</div>
            </section>
          </div>
        </motion.div>
      </main>
    </motion.div>
  );
};

const NavItem = ({ icon, label, active = false, collapsed = false }) => (
  <a className={`flex items-center gap-3 px-4 py-3 transition-all duration-300 rounded-xl font-headline tracking-tight text-sm ${active ? 'text-primary font-bold bg-primary/5 shadow-sm' : 'text-slate-400 hover:text-primary hover:bg-slate-50'} group`} href="#">
    <span className="material-symbols-outlined group-active:scale-95 transition-transform">{icon}</span>
    {!collapsed && <span>{label}</span>}
  </a>
);

export default DashboardRecepcionista;
