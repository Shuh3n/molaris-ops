import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';

const MainLayout = ({ children }) => {
  const { t, i18n } = useTranslation();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [hasNotifications, setHasNotifications] = useState(true); // Demo: starts with notifications
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === 'es' ? 'en' : 'es';
    i18n.changeLanguage(newLang);
  };

  return (
    <div className="bg-background text-on-surface selection:bg-primary/20 min-h-screen flex">
      {/* Sidebar */}
      <aside className={`h-screen ${isSidebarCollapsed ? 'w-20' : 'w-64'} fixed left-0 top-0 border-r-0 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-[20px_0px_40px_rgba(0,97,164,0.03)] flex flex-col p-4 gap-2 z-50 transition-all duration-300`}>
        <div className="mb-8 px-4 py-2 flex items-center justify-between">
          {!isSidebarCollapsed && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h1 className="text-xl font-bold bg-gradient-to-br from-primary to-blue-400 bg-clip-text text-transparent font-headline">MOLARIS OPS</h1>
              <p className="text-[10px] tracking-widest text-slate-400 font-bold uppercase">{t('common.clinic_slogan')}</p>
            </motion.div>
          )}
          <button 
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 cursor-pointer"
          >
            <span className="material-symbols-outlined">{isSidebarCollapsed ? 'menu' : 'menu_open'}</span>
          </button>
        </div>

        <nav className="flex-1 flex flex-col gap-1">
          <SidebarItem to="/dashboard" icon="dashboard" label={t('common.dashboard')} collapsed={isSidebarCollapsed} />
          <SidebarItem to="/appointments" icon="calendar_today" label={t('common.appointments')} collapsed={isSidebarCollapsed} />
          <SidebarItem to="/billing" icon="payments" label={t('common.billing')} collapsed={isSidebarCollapsed} />
          <SidebarItem to="/patients" icon="group" label={t('common.patients')} collapsed={isSidebarCollapsed} />
          <SidebarItem to="/dashboard/recepcionista/gestion" icon="manage_accounts" label={t('common.settings')} collapsed={isSidebarCollapsed} />
        </nav>

        <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800 space-y-1">
          <div className="flex items-center gap-3 px-4 py-3 text-slate-500 rounded-xl font-headline tracking-tight text-sm font-semibold">
            <span className="material-symbols-outlined">account_circle</span>
            {!isSidebarCollapsed && <span>{t('common.profile')}</span>}
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 transition-all duration-300 rounded-xl font-headline tracking-tight text-sm font-bold group cursor-pointer"
          >
            <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">logout</span>
            {!isSidebarCollapsed && <span>{t('common.logout')}</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 ${isSidebarCollapsed ? 'ml-20' : 'ml-64'} transition-all duration-300`}>
        {/* Header */}
        <header className="sticky top-0 h-16 z-40 bg-white/70 backdrop-blur-2xl flex items-center justify-between px-8 border-b border-slate-100">
          <div className="flex items-center flex-1 max-w-xl">
            <div className="relative w-full group">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
              <input 
                className="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-full text-sm focus:ring-2 focus:ring-primary/10 transition-all" 
                placeholder={t('common.search')} 
                type="text"
              />
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4 text-slate-400">
              <button onClick={toggleLanguage} className="text-[10px] font-black uppercase tracking-widest hover:text-primary transition-colors cursor-pointer">
                {i18n.language === 'es' ? 'EN' : 'ES'}
              </button>
              <button 
                onClick={() => setHasNotifications(false)}
                className="hover:text-primary transition-colors relative cursor-pointer"
              >
                <span className="material-symbols-outlined">notifications</span>
                {hasNotifications && (
                  <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                )}
              </button>
              <button className="hover:text-primary transition-colors cursor-pointer">
                <span className="material-symbols-outlined">help_outline</span>
              </button>
            </div>
            <button className="bg-gradient-to-br from-primary to-blue-400 text-white px-6 py-2.5 rounded-full font-headline font-bold text-sm shadow-lg shadow-primary/20 active:scale-95 transition-transform flex items-center gap-2 cursor-pointer">
              <span className="material-symbols-outlined text-lg">add</span>
              {t('common.new_appointment')}
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-slate-100">
                <div className="text-right hidden sm:block">
                    <p className="font-bold text-on-surface text-xs">Dr. Smith</p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-tighter">Director Clínico</p>
                </div>
                <div className="h-10 w-10 rounded-full overflow-hidden bg-slate-200 border-2 border-white shadow-sm">
                    <img alt="Dr. Smith" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB_maDeuvebhsx2LczqbCVOGKi6DjEGuFyQzZZhyXQqz3Mx0z0S_CsLRneCMY-Ks0WTTe2LRu9n_iESa3s3f-vAaGYYsVTBjJ2eEDDWFB8MkpClwqFp8kZ9YV8DQInyKH7q9nKdLYzIg9l_4GcxltSX1X3O82Ke_dkEXccxpSTna-je3I-67ROtrHN8gS7rRlCU5jiqp2BsHqRtnc9z-Qpk0P5uD0oK3YUoASU0bg42t4Ejvi0q_WEOjsg6VXwFv8R5z-G_UNvY" className="w-full h-full object-cover" />
                </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-8">
            {children}
        </div>
      </main>
    </div>
  );
};

const SidebarItem = ({ to, icon, label, collapsed }) => (
  <NavLink 
    to={to}
    className={({ isActive }) => `
      flex items-center gap-3 px-4 py-3 transition-all duration-300 rounded-xl font-headline tracking-tight text-sm
      ${isActive ? 'text-primary font-bold bg-primary/5 shadow-sm' : 'text-slate-400 hover:text-primary hover:bg-slate-50'}
      group
    `}
  >
    <span className="material-symbols-outlined group-active:scale-95 transition-transform">{icon}</span>
    {!collapsed && <span>{label}</span>}
  </NavLink>
);

export default MainLayout;
