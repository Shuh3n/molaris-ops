import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, NavLink, Outlet, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import LanguageToggle from '../components/LanguageToggle';
import AppointmentModal from '../components/AppointmentModal';
import { useToast } from '../components/ToastContext';

const DashboardRecepcionista = () => {
  const [isPinned, setIsPinned] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const { addToast } = useToast();
  const hoverTimerRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const handleSaveAppointment = async (formData) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/manage-appointments`;
      
      const appointmentData = {
        ...formData,
        clinica_id: userProfile.clinica_id
      };

      const response = await fetch(FUNCTION_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
        },
        body: JSON.stringify(appointmentData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save appointment');
      }
      
      addToast('Cita programada exitosamente', 'success');
      
      if (location.pathname.includes('/citas')) {
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    } catch (error) {
      console.error("Error saving appointment:", error);
      addToast('Error al guardar la cita', 'error');
      throw error;
    }
  };

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
          clinica_id,
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

  const handleMouseEnter = () => {
    if (window.innerWidth <= 1024) return;
    hoverTimerRef.current = setTimeout(() => {
      setIsHovered(true);
    }, 600);
  };

  const handleMouseLeave = () => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
    }
    setIsHovered(false);
  };

  const isExpanded = isPinned || isHovered;

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <motion.div 
          animate={{ rotate: 360 }} 
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="bg-[#F8FAFC] text-slate-900 selection:bg-primary/20 h-screen flex overflow-hidden">
      <AnimatePresence>
        {(window.innerWidth > 1024 || isExpanded) && (
          <>
            {isExpanded && window.innerWidth <= 1024 && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => { setIsPinned(false); setIsHovered(false); }}
                className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[45] lg:hidden"
              />
            )}
            <motion.aside 
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              initial={window.innerWidth <= 1024 ? { x: -280 } : false}
              animate={{ 
                width: isExpanded ? 280 : (window.innerWidth <= 1024 ? 0 : 80),
                x: (!isExpanded && window.innerWidth <= 1024) ? -280 : 0
              }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className={`h-screen flex-shrink-0 bg-white/80 backdrop-blur-xl border-r border-slate-100 shadow-[20px_0px_40px_rgba(0,97,164,0.03)] flex flex-col z-50 overflow-hidden group ${window.innerWidth <= 1024 ? 'fixed left-0 top-0' : 'relative'}`}
            >
              <div className={`h-20 flex items-center shrink-0 border-b border-transparent relative transition-all duration-300 ${isExpanded ? 'px-5 justify-between' : 'justify-center px-0'}`}>
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-10 h-10 rounded-xl editorial-gradient flex items-center justify-center shadow-lg shrink-0">
                    <img src="/favicon.svg" alt="Molaris logo" className="w-7 h-7" />
                  </div>
                  <AnimatePresence mode="wait">
                    {isExpanded && (
                      <motion.div key="logo-text" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="flex flex-col overflow-hidden whitespace-nowrap">
                        <h1 className="text-lg font-black bg-gradient-to-br from-blue-700 to-blue-400 bg-clip-text text-transparent">MOLARIS OPS</h1>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <button onClick={() => setIsPinned(!isPinned)} className={`w-10 h-10 flex items-center justify-center text-slate-400 hover:text-primary transition-all hover:bg-primary/5 rounded-xl z-10 shrink-0 ${!isExpanded ? 'absolute inset-0 w-full h-full opacity-0 group-hover:opacity-100 bg-white/60 backdrop-blur-sm' : ''}`}>
                  <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: isPinned ? "'FILL' 1" : "''" }}>
                    {isExpanded ? 'push_pin' : 'menu'}
                  </span>
                </button>
              </div>

              <nav className="flex-1 flex flex-col gap-1 p-3 overflow-y-auto no-scrollbar">
                <NavItem to="/dashboard/recepcionista" end icon="dashboard" label="Dashboard" expanded={isExpanded} />
                <NavItem to="/dashboard/recepcionista/citas" icon="calendar_today" label="Citas" expanded={isExpanded} />
                <NavItem to="/dashboard/recepcionista/facturacion" icon="payments" label="Facturación" expanded={isExpanded} />
                <NavItem to="/dashboard/recepcionista/pacientes" icon="group" label="Pacientes" expanded={isExpanded} />
                <NavItem to="/dashboard/recepcionista/notificaciones" icon="notifications" label="Notificaciones" expanded={isExpanded} />
                <NavItem to="/dashboard/recepcionista/ajustes" icon="settings" label="Ajustes" expanded={isExpanded} />
              </nav>

              <div className="mt-auto p-3 border-t border-slate-100">
                <motion.div className={`flex items-center ${isExpanded ? 'gap-3 px-4' : 'justify-center'} py-3 text-slate-500 rounded-xl cursor-pointer hover:bg-slate-50 transition-all duration-300 font-semibold text-sm overflow-hidden`}>
                  <span className="material-symbols-outlined shrink-0">account_circle</span>
                  {isExpanded && (
                    <div className="flex flex-col overflow-hidden whitespace-nowrap">
                      <span className="truncate font-bold text-slate-900">{userProfile?.nombre_completo || 'Usuario'}</span>
                      <span className="text-[10px] text-slate-400 font-black uppercase truncate">Recepcionista</span>
                    </div>
                  )}
                </motion.div>
                <button onClick={handleLogout} className={`w-full flex items-center ${isExpanded ? 'gap-3 px-4' : 'justify-center'} py-3 text-red-500 hover:bg-red-50 transition-all duration-300 rounded-xl font-bold text-sm group cursor-pointer overflow-hidden`}>
                  <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform shrink-0">logout</span>
                  {isExpanded && <span className="whitespace-nowrap">Cerrar Sesión</span>}
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <main className="flex-1 flex flex-col min-w-0 bg-[#F8FAFC]">
        <header className="h-20 shrink-0 z-40 bg-white/80 backdrop-blur-xl flex items-center justify-between px-6 lg:px-10 border-b border-slate-100">
          <div className="flex items-center flex-1 max-w-xl">
            <div className="relative w-full group">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
              <input className="w-full pl-12 pr-6 py-3 bg-slate-100/50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-slate-400 font-medium" placeholder="Buscar pacientes, citas o doctores..." type="text" />
            </div>
          </div>
          <div className="flex items-center gap-4 lg:gap-8 ml-4">
            <div className="hidden md:flex items-center gap-6 pr-6 border-r border-slate-100 shrink-0">
              <LanguageToggle />
            </div>
            <div className="flex items-center gap-2 lg:gap-4 shrink-0">
              <button className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-all relative">
                <span className="material-symbols-outlined">notifications</span>
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
              </button>
            </div>
            <button onClick={() => setIsAppointmentModalOpen(true)} className="bg-primary text-white px-4 lg:px-6 py-3 rounded-2xl font-black text-sm shadow-lg shadow-primary/20 active:scale-95 transition-all flex items-center gap-2 shrink-0 cursor-pointer">
              <span className="material-symbols-outlined text-lg">add_circle</span>
              <span className="hidden sm:inline uppercase tracking-widest text-xs">Nueva Cita</span>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-hidden relative">
          <div className="absolute inset-0 scroll-container">
            <motion.div key={location.pathname} initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.3 }} className="p-6 lg:p-10">
              {location.pathname === '/dashboard/recepcionista' ? <DashboardHome userProfile={userProfile} /> : <Outlet />}
            </motion.div>
          </div>
        </div>
      </main>

      <AppointmentModal 
        isOpen={isAppointmentModalOpen} 
        onClose={() => setIsAppointmentModalOpen(false)} 
        onSave={handleSaveAppointment}
      />
    </div>
  );
};

const DashboardHome = ({ userProfile }) => (
  <div>
    <div className="mb-10">
      <h2 className="text-3xl lg:text-4xl font-black tracking-tight text-slate-900">Bienvenido, {userProfile?.nombre_completo?.split(' ')[0]}</h2>
      <p className="text-slate-500 font-medium italic mt-1 opacity-70">Hoy es lunes, 21 de octubre de 2026</p>
    </div>

    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
      <div className="xl:col-span-2 space-y-8">
        <section className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
          <div className="px-8 py-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
            <div>
              <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest">Horario Semanal</h2>
              <p className="text-slate-900 font-black text-lg mt-1 tracking-tight">Octubre 21 — 27, 2026</p>
            </div>
            <span className="material-symbols-outlined text-primary bg-white p-2 rounded-xl shadow-sm border border-slate-50">calendar_view_week</span>
          </div>
          <div className="grid grid-cols-7 border-b border-slate-50 bg-slate-50/20">
              {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(d => (
                <div key={d} className="p-4 text-[10px] font-black text-slate-400 uppercase text-center border-r border-slate-100 last:border-r-0">{d}</div>
              ))}
          </div>
          <div className="h-[400px] flex items-center justify-center bg-white relative overflow-hidden group">
            <div className="flex flex-col items-center gap-4 text-slate-300 relative z-10">
              <span className="material-symbols-outlined text-6xl group-hover:scale-110 transition-transform duration-500">calendar_month</span>
              <p className="italic text-sm font-medium">Cargando horario dinámico...</p>
            </div>
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-50/50"></div>
          </div>
        </section>
      </div>

      <div className="space-y-8">
        <section className="bg-primary rounded-[2.5rem] p-10 text-white shadow-xl shadow-primary/20 relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-2xl font-black mb-2 tracking-tight">Resumen del Día</h3>
            <p className="text-blue-100 text-sm font-medium mb-10 opacity-80 uppercase tracking-widest text-[10px] font-black">12 citas programadas para hoy</p>
            <div className="space-y-6">
              <div className="bg-white/10 backdrop-blur-md rounded-[1.8rem] p-6 flex items-center justify-between border border-white/5 group hover:bg-white/20 transition-all cursor-pointer">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-70">Completadas</span>
                  <p className="text-3xl font-black mt-1">4</p>
                </div>
                <span className="material-symbols-outlined text-4xl opacity-30">check_circle</span>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-[1.8rem] p-6 flex items-center justify-between border border-white/5 group hover:bg-white/20 transition-all cursor-pointer">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-70">Pendientes</span>
                  <p className="text-3xl font-black mt-1">8</p>
                </div>
                <span className="material-symbols-outlined text-4xl opacity-30">pending</span>
              </div>
            </div>
          </div>
          <div className="absolute top-[-20%] right-[-20%] w-56 h-56 bg-white/10 rounded-full blur-3xl"></div>
        </section>
      </div>
    </div>
  </div>
);

const NavItem = ({ to, icon, label, expanded = false, end = false }) => (
  <motion.div whileHover={{ x: expanded ? 5 : 0 }} whileActive={{ scale: 0.98 }}>
    <NavLink to={to} end={end} className={({ isActive }) => `flex items-center ${expanded ? 'gap-4 px-4' : 'justify-center'} py-3.5 transition-all rounded-2xl font-bold text-sm ${isActive ? 'text-primary bg-primary/5 shadow-[0_4px_20px_rgba(0,97,164,0.08)] border border-primary/5' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'} group whitespace-nowrap overflow-hidden`}>
      <span className={`material-symbols-outlined transition-transform text-[22px] shrink-0`}>{icon}</span>
      {expanded && <span className="truncate uppercase tracking-widest text-[11px] font-black">{label}</span>}
    </NavLink>
  </motion.div>
);

export default DashboardRecepcionista;
