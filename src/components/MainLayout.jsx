import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';

const MainLayout = ({ children }) => {
  const { t, i18n } = useTranslation();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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
    <div className="bg-background text-on-surface selection:bg-primary/20 min-h-screen flex flex-col lg:flex-row overflow-x-hidden">
      {/* Sidebar (Desktop only) */}
      <aside className={`
        h-screen fixed left-0 top-0 border-r-0 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-xl 
        shadow-[20px_0px_40px_rgba(0,97,164,0.03)] hidden lg:flex flex-col p-4 gap-2 z-[70] transition-all duration-300
        ${isSidebarCollapsed ? 'w-20' : 'w-64'}
      `}>
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
            <span className="material-symbols-outlined">
              {isSidebarCollapsed ? 'menu' : 'menu_open'}
            </span>
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

      {/* Main Content Area */}
      <main className={`flex-1 transition-all duration-300 ${isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
        {/* Header */}
        <header className="sticky top-0 h-16 z-[80] bg-white/70 backdrop-blur-2xl flex items-center justify-between px-6 lg:px-8 border-b border-slate-100 gap-4">
          <div className="flex items-center gap-4 flex-1">
            <div className="lg:hidden font-black text-primary text-xl tracking-tighter">MOLARIS</div>
            <div className="relative w-full max-w-xl group hidden md:block">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
              <input 
                className="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-full text-sm focus:ring-2 focus:ring-primary/10 transition-all" 
                placeholder={t('common.search')} 
                type="text"
              />
            </div>
          </div>
          <div className="flex items-center gap-3 lg:gap-6">
            <div className="flex items-center gap-2 lg:gap-4 text-slate-400">
              <button onClick={toggleLanguage} className="text-[10px] font-black uppercase tracking-widest hover:text-primary transition-colors cursor-pointer px-2">
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
            </div>
            <button className="bg-gradient-to-br from-primary to-blue-400 text-white p-2 lg:px-6 lg:py-2.5 rounded-full font-headline font-bold text-sm shadow-lg shadow-primary/20 active:scale-95 transition-transform flex items-center gap-2 cursor-pointer">
              <span className="material-symbols-outlined text-lg">add</span>
              <span className="hidden lg:inline">{t('common.new_appointment')}</span>
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-slate-100 hidden sm:flex">
                <div className="h-8 w-8 lg:h-10 lg:w-10 rounded-full overflow-hidden bg-slate-200 border-2 border-white shadow-sm shrink-0">
                    <img alt="Dr. Smith" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB_maDeuvebhsx2LczqbCVOGKi6DjEGuFyQzZZhyXQqz3Mx0z0S_CsLRneCMY-Ks0WTTe2LRu9n_iESa3s3f-vAaGYYsVTBjJ2eEDDWFB8MkpClwqFp8kZ9YV8DQInyKH7q9nKdLYzIg9l_4GcxltSX1X3O82Ke_dkEXccxpSTna-je3I-67ROtrHN8gS7rRlCU5jiqp2BsHqRtnc9z-Qpk0P5uD0oK3YUoASU0bg42t4Ejvi0q_WEOjsg6VXwFv8R5z-G_UNvY" className="w-full h-full object-cover" />
                </div>
            </div>
          </div>
        </header>

        {/* Mobile Full-Menu Overlay (Drawer) */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMobileMenuOpen(false)}
                className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[90] lg:hidden"
              />
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[3rem] shadow-[0_-20px_60px_rgba(0,0,0,0.1)] z-[100] lg:hidden p-8 pb-32 overflow-hidden"
              >
                <div className="w-12 h-1.5 bg-slate-100 rounded-full mx-auto mb-8" />
                <h3 className="text-2xl font-black text-slate-900 mb-8 px-2 tracking-tight uppercase italic">{t('common.menu_title') || 'Menu'}</h3>
                <nav className="grid grid-cols-2 gap-4">
                  <SidebarItem to="/dashboard" icon="dashboard" label={t('common.dashboard')} collapsed={false} onClick={() => setIsMobileMenuOpen(false)} />
                  <SidebarItem to="/appointments" icon="calendar_today" label={t('common.appointments')} collapsed={false} onClick={() => setIsMobileMenuOpen(false)} />
                  <SidebarItem to="/billing" icon="payments" label={t('common.billing')} collapsed={false} onClick={() => setIsMobileMenuOpen(false)} />
                  <SidebarItem to="/patients" icon="group" label={t('common.patients')} collapsed={false} onClick={() => setIsMobileMenuOpen(false)} />
                  <SidebarItem to="/dashboard/recepcionista/gestion" icon="manage_accounts" label={t('common.settings')} collapsed={false} onClick={() => setIsMobileMenuOpen(false)} />
                  <button 
                    onClick={handleLogout}
                    className="flex flex-col items-center justify-center gap-2 p-6 text-red-500 bg-red-50 rounded-[2rem] font-headline tracking-tight text-xs font-bold transition-all active:scale-95"
                  >
                    <span className="material-symbols-outlined text-3xl">logout</span>
                    <span>{t('common.logout')}</span>
                  </button>
                </nav>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Bottom Navbar (Mobile only) */}
        <div className="fixed bottom-0 left-0 right-0 h-20 bg-white/80 backdrop-blur-2xl border-t border-slate-100 z-[85] lg:hidden flex items-center justify-around px-6 pb-2">
            <BottomNavItem to="/dashboard" icon="grid_view" label={t('common.dashboard')} />
            <BottomNavItem to="/appointments" icon="calendar_month" label={t('common.appointments')} />
            <BottomNavItem to="/patients" icon="group" label={t('common.patients')} />
            <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className={`flex flex-col items-center gap-1 transition-all duration-300 ${isMobileMenuOpen ? 'text-primary' : 'text-slate-400'}`}
            >
                <div className={`p-2.5 rounded-2xl transition-all ${isMobileMenuOpen ? 'bg-primary/10' : ''}`}>
                    <span className="material-symbols-outlined text-2xl">{isMobileMenuOpen ? 'close' : 'menu'}</span>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest">{t('common.menu') || 'Menu'}</span>
            </button>
        </div>

        {/* Page Content */}
        <div className="p-6 lg:p-10 pb-32 lg:pb-10">
            {children}
        </div>
      </main>
    </div>
  );
};

const SidebarItem = ({ to, icon, label, collapsed, onClick }) => (
  <NavLink 
    to={to}
    onClick={onClick}
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

const BottomNavItem = ({ to, icon, label }) => (
  <NavLink 
    to={to}
    className={({ isActive }) => `
      flex flex-col items-center gap-1 transition-all duration-300
      ${isActive ? 'text-primary' : 'text-slate-400 hover:text-slate-600'}
    `}
  >
    {({ isActive }) => (
      <>
        <div className={`p-2.5 rounded-2xl transition-all ${isActive ? 'bg-primary/10 shadow-inner' : ''}`}>
            <span className="material-symbols-outlined text-2xl">{icon}</span>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-widest truncate max-w-[60px] text-center">{label}</span>
      </>
    )}
  </NavLink>
);

export default MainLayout;
