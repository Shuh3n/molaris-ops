import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, NavLink, Outlet, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import LanguageToggle from '../components/LanguageToggle';
import AppointmentModal from '../components/AppointmentModal';
import { useToast } from '../components/ToastContext';

const DashboardRecepcionista = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const [isPinned, setIsPinned] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [logs, setLogs] = useState([]);
  const [hasNewLogs, setHasNewLogs] = useState(false);
  const { addToast } = useToast();
  const hoverTimerRef = useRef(null);
  const notificationsRef = useRef(null);

  const fetchLogs = async (clinicaId) => {
    try {
      const { data, error } = await supabase
        .from('logs_actividad')
        .select(`
          *,
          perfiles (nombre_completo)
        `)
        .eq('clinica_id', clinicaId)
        .order('creado_en', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      
      // Check if there are new logs compared to last viewed or just stored
      if (logs.length > 0 && data.length > 0 && data[0].id !== logs[0].id) {
        setHasNewLogs(true);
      } else if (logs.length === 0 && data.length > 0) {
        // Initial fetch with data shows badge
        setHasNewLogs(true);
      }
      
      setLogs(data);
    } catch (error) {
      console.error("Error fetching logs:", error);
    }
  };

  const handleOpenNotifications = () => {
    setIsNotificationsOpen(!isNotificationsOpen);
    if (!isNotificationsOpen) {
      setHasNewLogs(false); // Clear badge when opening
    }
  };

  useEffect(() => {
    if (userProfile?.clinica_id) {
      fetchLogs(userProfile.clinica_id);
    }
  }, [userProfile]);

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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setIsNotificationsOpen(false);
      }
    };

    if (isNotificationsOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isNotificationsOpen]);

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
                <NavItem to="/dashboard/recepcionista" end icon="dashboard" label={t('common.dashboard')} expanded={isExpanded} />
                <NavItem to="/dashboard/recepcionista/citas" icon="calendar_today" label={t('common.appointments')} expanded={isExpanded} />
                <NavItem to="/dashboard/recepcionista/facturacion" icon="payments" label={t('common.billing')} expanded={isExpanded} />
                <NavItem to="/dashboard/recepcionista/pacientes" icon="group" label={t('common.patients')} expanded={isExpanded} />
                <NavItem to="/dashboard/recepcionista/gestion" icon="manage_accounts" label={t('common.settings')} expanded={isExpanded} />
              </nav>

              <div className="mt-auto p-3 border-t border-slate-100">
                <motion.div className={`flex items-center ${isExpanded ? 'gap-3 px-4' : 'justify-center'} py-3 text-slate-500 rounded-xl cursor-pointer hover:bg-slate-50 transition-all duration-300 font-semibold text-sm overflow-hidden`}>
                  <span className="material-symbols-outlined shrink-0">account_circle</span>
                  {isExpanded && (
                    <div className="flex flex-col overflow-hidden whitespace-nowrap">
                      <span className="truncate font-bold text-slate-900">{userProfile?.nombre_completo || 'Usuario'}</span>
                      <span className="text-[10px] text-slate-400 font-black uppercase truncate">{t('settings.access.front')}</span>
                    </div>
                  )}
                </motion.div>
                <button onClick={handleLogout} className={`w-full flex items-center ${isExpanded ? 'gap-3 px-4' : 'justify-center'} py-3 text-red-500 hover:bg-red-50 transition-all duration-300 rounded-xl font-bold text-sm group cursor-pointer overflow-hidden`}>
                  <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform shrink-0">logout</span>
                  {isExpanded && <span className="whitespace-nowrap">{t('common.logout')}</span>}
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
              <input className="w-full pl-12 pr-6 py-3 bg-slate-100/50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-slate-400 font-medium" placeholder={t('common.search')} type="text" />
            </div>
          </div>
          <div className="flex items-center gap-4 lg:gap-8 ml-4">
            <div className="hidden md:flex items-center gap-6 pr-6 border-r border-slate-100 shrink-0">
              <LanguageToggle />
            </div>
            <div className="flex items-center gap-2 lg:gap-4 shrink-0 relative" ref={notificationsRef}>
              <button 
                onClick={handleOpenNotifications}
                className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all relative ${isNotificationsOpen ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-400 hover:text-primary hover:bg-primary/5'}`}
              >
                <span className="material-symbols-outlined">notifications</span>
                {hasNewLogs && (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                )}
              </button>

              <AnimatePresence>
                {isNotificationsOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 top-full mt-3 w-80 sm:w-96 bg-white rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-slate-100 overflow-hidden z-[100]"
                  >
                    <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                      <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">{t('common.notifications')}</h3>
                      <span className="text-[10px] font-black bg-primary/10 text-primary px-2 py-1 rounded-lg">LOGS</span>
                    </div>
                    <div className="max-h-[400px] overflow-y-auto no-scrollbar">
                      {logs.length === 0 ? (
                        <div className="p-10 text-center text-slate-300">
                          <span className="material-symbols-outlined text-4xl mb-2 opacity-20">history</span>
                          <p className="text-xs italic font-medium">No hay actividad reciente</p>
                        </div>
                      ) : (
                        <div className="divide-y divide-slate-50">
                          {logs.map((log) => (
                            <div key={log.id} className="p-4 hover:bg-slate-50 transition-colors flex gap-4">
                              <div className={`w-10 h-10 rounded-xl shrink-0 flex items-center justify-center ${
                                log.accion === 'creacion' ? 'bg-green-50 text-green-500' :
                                log.accion === 'cambio_estado' ? 'bg-blue-50 text-blue-500' :
                                'bg-slate-50 text-slate-500'
                              }`}>
                                <span className="material-symbols-outlined text-lg">
                                  {log.entidad_tipo === 'citas' ? 'calendar_month' : 'person'}
                                </span>
                              </div>
                              <div className="flex-1 min-w-0 text-left">
                                <p className="text-xs font-bold text-slate-900 leading-tight">
                                  {log.perfiles?.nombre_completo || 'Sistema'} 
                                  <span className="font-medium text-slate-500 ml-1">
                                    {log.accion === 'creacion' ? 'creó' : 
                                     log.accion === 'cambio_estado' ? 'actualizó el estado de' : 
                                     'actualizó'} una {log.entidad_tipo === 'citas' ? 'cita' : 'paciente'}
                                  </span>
                                </p>
                                {log.detalles?.estado_nuevo && (
                                  <span className="inline-block mt-1 px-2 py-0.5 bg-slate-100 rounded text-[9px] font-black uppercase tracking-tighter text-slate-500">
                                    → {log.detalles.estado_nuevo}
                                  </span>
                                )}
                                <p className="text-[9px] text-slate-400 mt-1 font-medium">
                                  {new Date(log.creado_en).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(log.creado_en).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="p-4 bg-slate-50/50 border-t border-slate-50 text-center">
                      <button onClick={() => { setIsNotificationsOpen(false); navigate('/dashboard/recepcionista/logs'); }} className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline transition-all">
                        Ver todo el historial
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <button onClick={() => setIsAppointmentModalOpen(true)} className="bg-primary text-white px-4 lg:px-6 py-3 rounded-2xl font-black text-sm shadow-lg shadow-primary/20 active:scale-95 transition-all flex items-center gap-2 shrink-0 cursor-pointer">
              <span className="material-symbols-outlined text-lg">add_circle</span>
              <span className="hidden sm:inline uppercase tracking-widest text-xs">{t('appointments.new_appointment')}</span>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-hidden relative">
          <div className="absolute inset-0 scroll-container">
            <motion.div key={location.pathname} initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.3 }} className="p-6 lg:p-10">
              {location.pathname === '/dashboard/recepcionista' ? <DashboardHome userProfile={userProfile} t={t} /> : <Outlet />}
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

const DashboardHome = ({ userProfile, t }) => {
  const { i18n } = useTranslation();
  const currentLocale = i18n.language.startsWith('es') ? 'es-ES' : 'en-US';
  const [stats, setStats] = useState({ today: 0, pending: 0 });
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!userProfile?.clinica_id) return;
      setLoading(true);
      try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Stats: Today's appointments
        const { count: todayCount } = await supabase
          .from('citas')
          .select('*, estados_cita!inner(nombre)', { count: 'exact', head: true })
          .eq('clinica_id', userProfile.clinica_id)
          .gte('fecha_hora', today.toISOString())
          .lt('fecha_hora', tomorrow.toISOString())
          .neq('estados_cita.nombre', 'cancelada');

        // Stats: Pending appointments
        const { count: pendingCount } = await supabase
          .from('citas')
          .select('*, estados_cita!inner(nombre)', { count: 'exact', head: true })
          .eq('clinica_id', userProfile.clinica_id)
          .eq('estados_cita.nombre', 'programada');

        setStats({ today: todayCount || 0, pending: pendingCount || 0 });

        // Upcoming schedule
        const { data: upcoming } = await supabase
          .from('citas')
          .select(`
            id,
            fecha_hora,
            pacientes (nombre, apellido),
            motivos_consulta:motivo_id (nombre),
            estados_cita:estado_id (nombre)
          `)
          .eq('clinica_id', userProfile.clinica_id)
          .gte('fecha_hora', today.toISOString())
          .order('fecha_hora', { ascending: true })
          .limit(5);

        // Map state name for component consumption
        const mappedUpcoming = upcoming?.map(apt => ({
          ...apt,
          estado: apt.estados_cita?.nombre
        })) || [];

        setUpcomingAppointments(mappedUpcoming);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [userProfile]);
  
  return (
    <div>
      <div className="mb-10 text-left">
        <h2 className="text-3xl lg:text-4xl font-black tracking-tight text-slate-900">
          {t('dashboard.welcome').split(',')[0]}, {userProfile?.nombre_completo?.split(' ')[0]}
        </h2>
        <p className="text-slate-500 font-medium italic mt-1 opacity-70">
          {new Date().toLocaleDateString(currentLocale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-8">
          <section className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
            <div className="px-8 py-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/30 text-left">
              <div>
                <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest">{t('dashboard.schedule.title')}</h2>
                <p className="text-slate-900 font-black text-lg mt-1 tracking-tight">
                  Próximas Citas
                </p>
              </div>
              <span className="material-symbols-outlined text-primary bg-white p-2 rounded-xl shadow-sm border border-slate-50">calendar_view_week</span>
            </div>
            
            <div className="min-h-[400px] bg-white relative overflow-hidden">
              {loading ? (
                <div className="h-full flex flex-col items-center justify-center gap-4 text-slate-300 py-20">
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full" />
                  <p className="italic text-sm font-medium">Cargando horario dinámico...</p>
                </div>
              ) : upcomingAppointments.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center gap-4 text-slate-300 py-20">
                  <span className="material-symbols-outlined text-6xl opacity-20">event_busy</span>
                  <p className="italic text-sm font-medium">No hay citas próximas programadas.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-50">
                  {upcomingAppointments.map((apt) => (
                    <div key={apt.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors group">
                      <div className="flex items-center gap-6">
                        <div className="text-center min-w-[60px] border-r border-slate-100 pr-6">
                          <p className="text-sm font-black text-primary">
                            {new Date(apt.fecha_hora).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                          <p className="text-[10px] font-bold text-slate-300 uppercase">
                            {new Date(apt.fecha_hora).toLocaleDateString(undefined, { day: '2-digit', month: 'short' })}
                          </p>
                        </div>
                        <div className="text-left">
                          <h4 className="font-bold text-slate-900 tracking-tight">{apt.pacientes?.nombre} {apt.pacientes?.apellido}</h4>
                          <p className="text-xs text-slate-400 font-medium">{apt.motivos_consulta?.nombre || 'Consulta General'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                          apt.estado === 'programada' ? 'bg-blue-50 text-blue-600' : 
                          apt.estado === 'completada' ? 'bg-green-50 text-green-600' : 'bg-slate-50 text-slate-500'
                        }`}>
                          {t(`appointments.status.${apt.estado}`)}
                        </span>
                        <span className="material-symbols-outlined text-slate-200 group-hover:text-primary transition-colors">chevron_right</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-white to-transparent pointer-events-none"></div>
            </div>
          </section>
        </div>

        <div className="space-y-8">
          <section className="bg-primary rounded-[2.5rem] p-10 text-white shadow-xl shadow-primary/20 relative overflow-hidden text-left">
            <div className="relative z-10">
              <h3 className="text-2xl font-black mb-2 tracking-tight">{t('dashboard.quick_actions.title')}</h3>
              <p className="text-blue-100 text-sm font-medium mb-10 opacity-80 uppercase tracking-widest text-[10px] font-black">{t('dashboard.glance')}</p>
              <div className="space-y-6">
                <div className="bg-white/10 backdrop-blur-md rounded-[1.8rem] p-6 flex items-center justify-between border border-white/5 group hover:bg-white/20 transition-all cursor-pointer">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-70">{t('dashboard.stats.appointments')}</span>
                    <p className="text-3xl font-black mt-1">{stats.today}</p>
                  </div>
                  <span className="material-symbols-outlined text-4xl opacity-30">check_circle</span>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-[1.8rem] p-6 flex items-center justify-between border border-white/5 group hover:bg-white/20 transition-all cursor-pointer">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-70">{t('dashboard.stats.pending')}</span>
                    <p className="text-3xl font-black mt-1">{stats.pending}</p>
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
};

const NavItem = ({ to, icon, label, expanded = false, end = false }) => (
  <motion.div whileHover={{ x: expanded ? 5 : 0 }} whileActive={{ scale: 0.98 }}>
    <NavLink to={to} end={end} className={({ isActive }) => `flex items-center ${expanded ? 'gap-4 px-4' : 'justify-center'} py-3.5 transition-all rounded-2xl font-bold text-sm ${isActive ? 'text-primary bg-primary/5 shadow-[0_4px_20px_rgba(0,97,164,0.08)] border border-primary/5' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'} group whitespace-nowrap overflow-hidden`}>
      <span className={`material-symbols-outlined transition-transform text-[22px] shrink-0`}>{icon}</span>
      {expanded && <span className="truncate uppercase tracking-widest text-[11px] font-black">{label}</span>}
    </NavLink>
  </motion.div>
);

export default DashboardRecepcionista;
