import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, NavLink, Outlet, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import LanguageToggle from '../components/LanguageToggle';

const DashboardDentista = () => {
  const { t } = useTranslation();
  const [isPinned, setIsPinned] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const hoverTimerRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate('/login'); return; }

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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const isExpanded = isPinned || isHovered;

  if (loading) return null;

  return (
    <div className="bg-[#F8FAFC] text-slate-900 h-screen flex overflow-hidden">
      <motion.aside 
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        animate={{ width: isExpanded ? 280 : 80 }}
        className="h-screen bg-white border-r border-slate-100 shadow-sm flex flex-col z-50 overflow-hidden relative"
      >
        <div className={`h-20 flex items-center ${isExpanded ? 'px-5 justify-between' : 'justify-center'} border-b border-transparent`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shrink-0">
              <img src="/favicon.svg" alt="logo" className="w-7 h-7" />
            </div>
            {isExpanded && <h1 className="text-lg font-black text-primary">MOLARIS CLINIC</h1>}
          </div>
        </div>

        <nav className="flex-1 flex flex-col gap-1 p-3">
          <NavItem to="/dashboard/dentista" end icon="edit_calendar" label="Mi Agenda" expanded={isExpanded} />
          <NavItem to="/dashboard/dentista/pacientes" icon="group" label="Pacientes" expanded={isExpanded} />
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
            {isExpanded && <span>Salir</span>}
          </button>
        </div>
      </motion.aside>

      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-20 bg-white/80 backdrop-blur-xl flex items-center justify-between px-10 border-b border-slate-100">
           <div className="flex items-center gap-4">
              <span className="material-symbols-outlined text-primary">verified_user</span>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Panel Clínico</span>
           </div>
           <LanguageToggle />
        </header>
        <div className="flex-1 overflow-y-auto no-scrollbar p-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

const NavItem = ({ to, icon, label, expanded, end = false }) => (
  <NavLink to={to} end={end} className={({ isActive }) => `flex items-center ${expanded ? 'gap-4 px-4' : 'justify-center'} py-4 rounded-2xl font-bold text-sm transition-all ${isActive ? 'text-primary bg-primary/5' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}>
    <span className="material-symbols-outlined text-[22px]">{icon}</span>
    {expanded && <span className="uppercase tracking-widest text-[11px] font-black">{label}</span>}
  </NavLink>
);

export default DashboardDentista;
