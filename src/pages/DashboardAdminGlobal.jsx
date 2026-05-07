import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, NavLink, Outlet, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import LanguageToggle from '../components/LanguageToggle';
import { useToast } from '../components/ToastContext';

const Motion = motion;

const DashboardAdminGlobal = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const [isPinned, setIsPinned] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 1024);
  const { addToast } = useToast();
  const hoverTimerRef = useRef(null);

  const adminNavItems = [
    { to: '/dashboard/adminglobal', icon: 'dashboard', label: t('common.dashboard'), end: true },
    { to: '/dashboard/adminglobal/estadisticas', icon: 'monitoring', label: 'Estadísticas' },
    { to: '/dashboard/adminglobal/pacientes', icon: 'group', label: t('common.patients') },
    { to: '/dashboard/adminglobal/equipo', icon: 'badge', label: 'Equipo' },
    { to: '/dashboard/adminglobal/gestion', icon: 'settings', label: t('common.settings') },
  ];

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) setIsMobileMenuOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
          roles (nombre),
          clinicas (nombre_consultorio)
        `)
        .eq('id', session.user.id)
        .single();

      if (error || profile?.roles?.nombre !== 'ADMIN_GLOBAL') {
        console.error('Acceso denegado o error de perfil', error);
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
    if (isMobile) return;
    hoverTimerRef.current = setTimeout(() => setIsHovered(true), 600);
  };

  const handleMouseLeave = () => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    setIsHovered(false);
  };

  const isExpanded = isPinned || isHovered;

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <Motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="bg-[#F8FAFC] text-slate-900 selection:bg-primary/20 h-screen flex overflow-hidden">
      <AnimatePresence>
        {!isMobile && (
          <Motion.aside
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            initial={false}
            animate={{ width: isExpanded ? 280 : 80 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="h-screen flex-shrink-0 bg-white/80 backdrop-blur-xl border-r border-slate-100 shadow-[20px_0px_40px_rgba(0,97,164,0.03)] flex flex-col z-50 overflow-hidden group relative"
          >
            <div className={`h-20 flex items-center shrink-0 border-b border-transparent relative transition-all duration-300 ${isExpanded ? 'px-5 justify-between' : 'justify-center px-0'}`}>
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-10 h-10 rounded-xl editorial-gradient flex items-center justify-center shadow-lg shrink-0">
                  <img src="/favicon.svg" alt="Molaris logo" className="w-7 h-7" />
                </div>
                {isExpanded && (
                  <Motion.div key="logo-text" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="flex flex-col overflow-hidden whitespace-nowrap">
                    <h1 className="text-lg font-black bg-gradient-to-br from-blue-700 to-blue-400 bg-clip-text text-transparent">ADMIN PANEL</h1>
                  </Motion.div>
                )}
              </div>
              <button onClick={() => setIsPinned(!isPinned)} className={`w-10 h-10 flex items-center justify-center text-slate-400 hover:text-primary transition-all hover:bg-primary/5 rounded-xl z-10 shrink-0 ${!isExpanded ? 'absolute inset-0 w-full h-full opacity-0 group-hover:opacity-100 bg-white/60 backdrop-blur-sm' : ''}`}>
                <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: isPinned ? "'FILL' 1" : "''" }}>
                  {isExpanded ? 'push_pin' : 'menu'}
                </span>
              </button>
            </div>

            <nav className="flex-1 flex flex-col gap-1 p-3 overflow-y-auto no-scrollbar">
              {adminNavItems.map((item) => (
                <NavItem key={item.to} {...item} expanded={isExpanded} />
              ))}
            </nav>

            <div className="mt-auto p-3 border-t border-slate-100">
              <Motion.div className={`flex items-center ${isExpanded ? 'gap-3 px-4' : 'justify-center'} py-3 text-slate-500 rounded-xl cursor-pointer hover:bg-slate-50 transition-all duration-300 font-semibold text-sm overflow-hidden`}>
                <span className="material-symbols-outlined shrink-0 text-primary">admin_panel_settings</span>
                {isExpanded && (
                  <div className="flex flex-col overflow-hidden whitespace-nowrap">
                    <span className="truncate font-bold text-slate-900">{userProfile?.nombre_completo || 'Admin'}</span>
                    <span className="text-[10px] text-slate-400 font-black uppercase truncate">Administrador Clínica</span>
                  </div>
                )}
              </Motion.div>
              <button onClick={handleLogout} className={`w-full flex items-center ${isExpanded ? 'gap-3 px-4' : 'justify-center'} py-3 text-red-500 hover:bg-red-50 transition-all duration-300 rounded-xl font-bold text-sm group cursor-pointer overflow-hidden`}>
                <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform shrink-0">logout</span>
                {isExpanded && <span className="whitespace-nowrap">{t('common.logout')}</span>}
              </button>
            </div>
          </Motion.aside>
        )}
      </AnimatePresence>

      <main className="flex-1 flex flex-col min-w-0 bg-[#F8FAFC]">
        <header className="h-20 shrink-0 z-40 bg-white/80 backdrop-blur-xl flex items-center justify-between px-4 sm:px-6 lg:px-10 border-b border-slate-100 gap-4">
          <div className="flex items-center gap-4">
            <h2 className="hidden md:block text-sm font-black uppercase tracking-[0.2em] text-slate-400">
              {userProfile?.clinicas?.nombre_consultorio || 'Clínica'}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <LanguageToggle />
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-primary border border-slate-200">
              {userProfile?.nombre_completo?.charAt(0) || 'A'}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-hidden relative">
          <div className="absolute inset-0 scroll-container">
            <Motion.div key={location.pathname} initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.3 }} className="p-4 pb-28 sm:p-6 lg:p-10 lg:pb-10">
              <Outlet />
            </Motion.div>
          </div>
        </div>
      </main>

      {/* Mobile Nav */}
      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 z-[50] border-t border-slate-200 bg-white/95 backdrop-blur-xl px-3 pt-2 pb-[calc(env(safe-area-inset-bottom,0px)+0.5rem)]">
          <div className="grid grid-cols-4 gap-1">
            <BottomNavItem to="/dashboard/adminglobal" icon="dashboard" label={t('common.dashboard')} end />
            <BottomNavItem to="/dashboard/adminglobal/estadisticas" icon="monitoring" label="Stats" />
            <BottomNavItem to="/dashboard/adminglobal/pacientes" icon="group" label="Pacientes" />
            <button onClick={() => setIsMobileMenuOpen(true)} className="flex flex-col items-center gap-1 rounded-2xl px-2 py-2 text-slate-400">
              <span className="material-symbols-outlined text-[26px]">menu</span>
              <span className="text-[10px] font-black uppercase tracking-widest">{t('common.menu')}</span>
            </button>
          </div>
        </div>
      )}

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {isMobile && isMobileMenuOpen && (
          <>
            <Motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsMobileMenuOpen(false)} className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[55]" />
            <Motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 220 }} className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[2rem] shadow-[0_-20px_60px_rgba(0,0,0,0.12)] z-[60] px-5 pt-5 pb-8">
              <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-6" />
              <nav className="grid grid-cols-2 gap-3">
                {adminNavItems.map((item) => (
                  <MobileMenuItem key={item.to} {...item} onClick={() => setIsMobileMenuOpen(false)} />
                ))}
                <button onClick={handleLogout} className="flex flex-col items-center justify-center gap-2 rounded-[1.5rem] bg-red-50 text-red-500 p-5 font-black text-[11px] uppercase tracking-widest">
                  <span className="material-symbols-outlined text-3xl">logout</span>
                  <span>{t('common.logout')}</span>
                </button>
              </nav>
            </Motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

const NavItem = ({ to, icon, label, expanded = false, end = false }) => (
  <Motion.div whileHover={{ x: expanded ? 5 : 0 }} whileActive={{ scale: 0.98 }}>
    <NavLink to={to} end={end} className={({ isActive }) => `flex items-center ${expanded ? 'gap-4 px-4' : 'justify-center'} py-3.5 transition-all rounded-2xl font-bold text-sm ${isActive ? 'text-primary bg-primary/5 shadow-[0_4px_20px_rgba(0,97,164,0.08)] border border-primary/5' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'} group whitespace-nowrap overflow-hidden`}>
      <span className="material-symbols-outlined transition-transform text-[22px] shrink-0">{icon}</span>
      {expanded && <span className="truncate uppercase tracking-widest text-[11px] font-black">{label}</span>}
    </NavLink>
  </Motion.div>
);

const MobileMenuItem = ({ to, icon, label, onClick, end = false }) => (
  <NavLink to={to} end={end} onClick={onClick} className={({ isActive }) => `flex flex-col items-center justify-center gap-2 rounded-[1.5rem] p-5 text-center transition-all ${isActive ? 'bg-primary/10 text-primary' : 'bg-slate-50 text-slate-500'}`}>
    <span className="material-symbols-outlined text-3xl">{icon}</span>
    <span className="text-[11px] font-black uppercase tracking-widest">{label}</span>
  </NavLink>
);

const BottomNavItem = ({ to, icon, label, end = false }) => (
  <NavLink to={to} end={end} className={({ isActive }) => `flex flex-col items-center gap-1 rounded-2xl px-2 py-2 transition-all ${isActive ? 'text-primary' : 'text-slate-400'}`}>
    {({ isActive }) => (
      <>
        <span className={`material-symbols-outlined text-[26px] ${isActive ? 'rounded-2xl bg-primary/10 p-2' : ''}`}>{icon}</span>
        <span className="text-[10px] font-black uppercase tracking-widest text-center">{label}</span>
      </>
    )}
  </NavLink>
);

export default DashboardAdminGlobal;
