import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, NavLink, Outlet, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import LanguageToggle from '../components/LanguageToggle';

const Motion = motion;

const DashboardDentista = () => {
  const { t } = useTranslation();
  const [isPinned, setIsPinned] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 1024);
  const navigate = useNavigate();
  const location = useLocation();

  const dentistNavItems = [
    { to: '/dashboard/dentista', icon: 'edit_calendar', label: t('dentist.today_agenda'), end: true },
    { to: '/dashboard/dentista/pacientes', icon: 'group', label: t('common.patients') },
  ];

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
          roles (nombre)
        `)
        .eq('id', session.user.id)
        .single();

      if (error || profile?.roles?.nombre !== 'ORTODONCISTA') {
        navigate('/login');
        return;
      }

      setUserProfile(profile);
      setLoading(false);
    };

    checkUser();
  }, [navigate]);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);

      if (!mobile) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const isExpanded = isPinned || isHovered;

  if (loading) return null;

  return (
    <div className="bg-[#F8FAFC] text-slate-900 h-screen flex overflow-hidden">
      <AnimatePresence>
        {!isMobile && (
          <Motion.aside
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            animate={{ width: isExpanded ? 280 : 80 }}
            className="h-screen bg-white border-r border-slate-100 shadow-sm flex flex-col z-50 overflow-hidden relative"
          >
            <div className={`h-20 flex items-center ${isExpanded ? 'px-5 justify-between' : 'justify-center'} border-b border-transparent`}>
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shrink-0">
                  <img src="/favicon.svg" alt="logo" className="w-7 h-7" />
                </div>
                {isExpanded && <h1 className="text-lg font-black text-primary whitespace-nowrap">MOLARIS CLINIC</h1>}
              </div>
              {isExpanded && (
                <button onClick={() => setIsPinned(!isPinned)} className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-primary transition-all hover:bg-primary/5 rounded-xl shrink-0">
                  <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: isPinned ? "'FILL' 1" : "''" }}>
                    push_pin
                  </span>
                </button>
              )}
            </div>

            <nav className="flex-1 flex flex-col gap-1 p-3">
              {dentistNavItems.map((item) => (
                <NavItem key={item.to} {...item} expanded={isExpanded} />
              ))}
            </nav>

            <div className="mt-auto p-3 border-t border-slate-100 text-left">
              <div className={`flex items-center ${isExpanded ? 'gap-3 px-4' : 'justify-center'} py-3 text-slate-500`}>
                <span className="material-symbols-outlined">medical_services</span>
                {isExpanded && (
                  <div className="overflow-hidden">
                    <p className="truncate font-bold text-slate-900 text-sm">{userProfile?.nombre_completo}</p>
                    <p className="text-[10px] text-slate-400 font-black uppercase">Dentista</p>
                  </div>
                )}
              </div>
              <button onClick={handleLogout} className={`w-full flex items-center ${isExpanded ? 'gap-3 px-4' : 'justify-center'} py-3 text-red-500 hover:bg-red-50 rounded-xl font-bold text-sm transition-all`}>
                <span className="material-symbols-outlined">logout</span>
                {isExpanded && <span>{t('common.logout')}</span>}
              </button>
            </div>
          </Motion.aside>
        )}
      </AnimatePresence>

      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-20 bg-white/80 backdrop-blur-xl flex items-center justify-between px-4 sm:px-6 lg:px-10 border-b border-slate-100 gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <span className="material-symbols-outlined text-primary">verified_user</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 truncate">Panel Clínico</span>
          </div>
          <div className="shrink-0">
            <LanguageToggle />
          </div>
        </header>
        <div className="flex-1 overflow-y-auto no-scrollbar p-4 pb-28 sm:p-6 lg:p-10 lg:pb-10">
          <Outlet key={location.pathname} />
        </div>
      </main>

      <AnimatePresence>
        {isMobile && isMobileMenuOpen && (
          <>
            <Motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[55]"
            />
            <Motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[2rem] shadow-[0_-20px_60px_rgba(0,0,0,0.12)] z-[60] px-5 pt-5 pb-8"
            >
              <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-6" />
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-sm font-black uppercase tracking-[0.2em] text-slate-900">{t('common.menu_title')}</h2>
                <button onClick={() => setIsMobileMenuOpen(false)} className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              <nav className="grid grid-cols-2 gap-3">
                {dentistNavItems.map((item) => (
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

      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 z-[50] border-t border-slate-200 bg-white/95 backdrop-blur-xl px-3 pt-2 pb-[calc(env(safe-area-inset-bottom,0px)+0.5rem)]">
          <div className="grid grid-cols-3 gap-1">
            <BottomNavItem to="/dashboard/dentista" icon="edit_calendar" label={t('dentist.today_agenda')} end />
            <BottomNavItem to="/dashboard/dentista/pacientes" icon="group" label={t('common.patients')} />
            <button onClick={() => setIsMobileMenuOpen((current) => !current)} className={`flex flex-col items-center gap-1 rounded-2xl px-2 py-2 transition-all ${isMobileMenuOpen ? 'text-primary' : 'text-slate-400'}`}>
              <span className={`material-symbols-outlined text-[26px] ${isMobileMenuOpen ? 'rounded-2xl bg-primary/10 p-2' : ''}`}>
                {isMobileMenuOpen ? 'close' : 'menu'}
              </span>
              <span className="text-[10px] font-black uppercase tracking-widest">{t('common.menu')}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const NavItem = ({ to, icon, label, expanded, end = false }) => (
  <NavLink to={to} end={end} className={({ isActive }) => `flex items-center ${expanded ? 'gap-4 px-4' : 'justify-center'} py-4 rounded-2xl font-bold text-sm transition-all ${isActive ? 'text-primary bg-primary/5' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}>
    <span className="material-symbols-outlined text-[22px]">{icon}</span>
    {expanded && <span className="uppercase tracking-widest text-[11px] font-black truncate">{label}</span>}
  </NavLink>
);

const MobileMenuItem = ({ to, icon, label, onClick, end = false }) => (
  <NavLink
    to={to}
    end={end}
    onClick={onClick}
    className={({ isActive }) => `flex flex-col items-center justify-center gap-2 rounded-[1.5rem] p-5 text-center transition-all ${isActive ? 'bg-primary/10 text-primary' : 'bg-slate-50 text-slate-500'}`}
  >
    <span className="material-symbols-outlined text-3xl">{icon}</span>
    <span className="text-[11px] font-black uppercase tracking-widest">{label}</span>
  </NavLink>
);

const BottomNavItem = ({ to, icon, label, end = false }) => (
  <NavLink
    to={to}
    end={end}
    className={({ isActive }) => `flex flex-col items-center gap-1 rounded-2xl px-2 py-2 transition-all ${isActive ? 'text-primary' : 'text-slate-400'}`}
  >
    {({ isActive }) => (
      <>
        <span className={`material-symbols-outlined text-[26px] ${isActive ? 'rounded-2xl bg-primary/10 p-2' : ''}`}>{icon}</span>
        <span className="text-[10px] font-black uppercase tracking-widest text-center">{label}</span>
      </>
    )}
  </NavLink>
);

export default DashboardDentista;
