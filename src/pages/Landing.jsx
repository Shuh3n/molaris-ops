import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import LanguageToggle from '../components/LanguageToggle';
import LicensesSection from '../components/LicensesSection';

// Custom SVG Icons
const Icons = {
  WhatsApp: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 1 1-7.6-7.6 8.38 8.38 0 0 1 3.8.9L22 4l-2 5z"/></svg>
  ),
  Bill: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/><path d="M12 11h4"/><path d="M12 16h4"/><path d="M8 11h.01"/><path d="M8 16h.01"/></svg>
  ),
  Team: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
  ),
  Calendar: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
  ),
  Dashboard: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/></svg>
  ),
  Check: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
  ),
  Zap: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
  )
};

const Landing = () => {
  const { t } = useTranslation();
  const [showDemo, setShowDemo] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 overflow-x-hidden">
      {/* Decorative Blobs */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[10%] right-[-5%] w-[35%] h-[35%] bg-secondary/10 blur-[120px] rounded-full" />
      </div>

      {/* Navbar */}
      <motion.nav
        initial={{ y: -24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.55, ease: 'easeOut' }}
        className="flex justify-between items-center px-6 md:px-12 py-5 sticky top-0 bg-white/70 backdrop-blur-2xl z-50 border-b border-slate-100"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl editorial-gradient flex items-center justify-center shadow-lg shadow-primary/20">
            <img src="/favicon.svg" alt="Molaris logo" className="w-5 h-5 object-contain brightness-0 invert" />
          </div>
          <span className="font-headline font-black text-xl tracking-tight text-slate-900">{t('landing.title')}</span>
        </div>
        <div className="flex gap-4 md:gap-8 items-center">
          <div className="hidden sm:block"><LanguageToggle /></div>
          <Link to="/login" className="px-6 py-2 bg-slate-900 text-white rounded-full font-bold shadow-xl hover:bg-primary transition-all cursor-pointer text-sm">
            {t('landing.login_btn')}
          </Link>
        </div>
      </motion.nav>

      <main className="relative z-10 flex flex-col items-center">
        <div className="w-full lg:max-w-[70%] xl:max-w-[70%] space-y-24 md:space-y-40 py-16 md:py-24 px-6">
          
          {/* Hero Section Refactor */}
          <section className="relative flex flex-col items-center text-center space-y-12">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="space-y-6 max-w-4xl"
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white shadow-sm border border-slate-100 text-primary rounded-full text-[10px] font-black uppercase tracking-widest">
                <Icons.Zap />
                <span>Gestión Dental de Nueva Generación</span>
              </div>
              
              <h1 className="text-6xl md:text-8xl font-black leading-[0.95] tracking-tighter text-slate-900">
                Tu Clínica, <br/>
                <span className="text-primary">Evolucionada</span>.
              </h1>
              
              <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed font-medium">
                Molaris OPS es el centro de mando que automatiza tu operación. 
                Eficiencia clínica y administrativa en una sola plataforma minimalista.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
            >
              <Link to="/register" className="px-10 py-5 bg-primary text-white rounded-2xl font-black text-lg shadow-2xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all">
                Empezar Ahora — Gratis
              </Link>
              <button 
                onClick={() => setShowDemo(true)}
                className="px-10 py-5 bg-white text-slate-700 border border-slate-200 rounded-2xl font-black text-lg hover:bg-slate-50 transition-all shadow-sm flex items-center justify-center gap-2"
              >
                <Icons.Calendar />
                Ver Demo Interactiva
              </button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 1 }}
              className="relative w-full"
            >
              <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full scale-50" />
              <div className="relative bg-white p-3 rounded-[3rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.12)] border border-slate-100 overflow-hidden">
                <img 
                  src="/molaris-og.jpg" 
                  alt="Molaris Dashboard" 
                  className="rounded-[2.2rem] w-full border border-slate-50"
                />
              </div>
              
              {/* Stats Overlay */}
              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-10 -right-10 bg-white/80 backdrop-blur-xl p-6 rounded-3xl shadow-2xl border border-white/50 hidden md:flex items-center gap-4"
              >
                <div className="w-12 h-12 bg-green-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/20">
                  <Icons.Check />
                </div>
                <div className="text-left">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Estado</p>
                  <p className="text-xl font-black text-slate-900">100% Operativo</p>
                </div>
              </motion.div>
            </motion.div>
          </section>

          {/* Features Grid */}
          <section className="space-y-20">
            <div className="text-center space-y-4">
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">Potencia tu práctica</h2>
              <p className="text-slate-500 text-lg font-medium max-w-xl mx-auto">Funciones diseñadas para eliminar el trabajo manual y maximizar la atención al paciente.</p>
            </div>

            <motion.div 
              variants={{
                hidden: { opacity: 0 },
                show: {
                  opacity: 1,
                  transition: { staggerChildren: 0.15 }
                }
              }}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
            >
              <FeatureCard icon={<Icons.WhatsApp />} title="WhatsApp" desc="Recordatorios automáticos que reducen el ausentismo." color="green" />
              <FeatureCard icon={<Icons.Bill />} title="Finanzas" desc="Facturación inteligente y control de caja real." color="blue" />
              <FeatureCard icon={<Icons.Team />} title="Equipo" desc="Roles definidos para una coordinación perfecta." color="purple" />
            </motion.div>
          </section>

          {/* Problem Section */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-10">
              <h2 className="text-4xl md:text-6xl font-black text-slate-900 leading-none tracking-tighter">
                Elimina el <br/>
                <span className="text-primary italic">Caos Administrativo</span>
              </h2>
              <div className="space-y-5">
                <ProblemItem text="Citas olvidadas y sillones vacíos." />
                <ProblemItem text="Procesos manuales que roban tiempo clínico." />
                <ProblemItem text="Falta de visibilidad sobre los ingresos reales." />
              </div>
            </div>
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="p-10 bg-slate-900 text-white rounded-[2.5rem] shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-3xl rounded-full" />
              <h3 className="text-2xl font-black mb-3">La Solución Molaris</h3>
              <p className="text-slate-400 font-medium leading-relaxed">
                Automatizamos lo aburrido para que brilles en lo importante. 
                Operación fluida, pacientes felices, clínica rentable.
              </p>
            </motion.div>
          </section>

          {/* Licenses Section */}
          <LicensesSection />

          {/* Final CTA */}
          <section>
            <motion.div 
              whileHover={{ y: -5 }}
              className="p-12 md:p-20 bg-primary rounded-[3.5rem] text-white text-center relative overflow-hidden shadow-2xl shadow-primary/20"
            >
              <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
              <div className="relative z-10 space-y-10">
                <h2 className="text-4xl md:text-7xl font-black leading-tight tracking-tighter">
                  Tu clínica merece <br/> lo mejor.
                </h2>
                <div className="pt-4">
                  <Link to="/register" className="px-12 py-6 bg-white text-primary rounded-2xl font-black text-xl shadow-2xl hover:scale-105 transition-all inline-block">
                    Crea tu Cuenta — 15 Días Gratis
                  </Link>
                </div>
              </div>
            </motion.div>
          </section>
        </div>
      </main>

      <footer className="py-20 border-t border-slate-100 text-center bg-white">
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-lg editorial-gradient flex items-center justify-center shadow-md">
            <img src="/favicon.svg" alt="Molaris" className="w-5 h-5 brightness-0 invert" />
          </div>
          <span className="font-headline font-black text-xl text-slate-900 uppercase tracking-tighter">Molaris OPS</span>
        </div>
        <p className="text-slate-400 font-bold text-sm tracking-wide">SOFTWARE DENTAL PARA LA EXCELENCIA CLÍNICA</p>
      </footer>

      <AnimatePresence>
        {showDemo && <DemoModal onClose={() => setShowDemo(false)} />}
      </AnimatePresence>
    </div>
  );
};


const ProblemItem = ({ text }) => (
  <div className="flex items-center gap-5 group">
    <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
      <Icons.Check />
    </div>
    <span className="text-slate-600 font-bold text-xl">{text}</span>
  </div>
);

const FeatureCard = ({ icon, title, desc, color, delay }) => {
  const colors = {
    green: "bg-green-50 text-green-600 group-hover:bg-green-600 group-hover:text-white",
    blue: "bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white",
    purple: "bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white"
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.6 }}
      whileHover={{ y: -10 }}
      className="p-10 rounded-[3rem] bg-white border border-slate-100 shadow-2xl shadow-slate-200/50 text-left space-y-8 group transition-all duration-500 hover:border-primary/20"
    >
      <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center transition-all duration-500 ${colors[color]}`}>
        {React.cloneElement(icon, { size: 32 })}
      </div>
      <div className="space-y-4">
        <h3 className="text-2xl font-black text-slate-900 group-hover:text-primary transition-colors">{title}</h3>
        <p className="text-slate-500 font-medium leading-relaxed text-lg">{desc}</p>
      </div>
    </motion.div>
  );
};

const DemoModal = ({ onClose }) => {
  const [role, setRole] = useState('recepcionista');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, [role, activeTab]);
  
  const mockData = {
    citas: [
      { id: 1, hora: '09:00', paciente: 'Carlos Rodríguez', motivo: 'Ortodoncia', estado: 'completada' },
      { id: 2, hora: '10:30', paciente: 'Elena Gómez', motivo: 'Limpieza', estado: 'confirmada' },
      { id: 3, hora: '11:15', paciente: 'Mateo Sánchez', motivo: 'Consulta', estado: 'programada' },
      { id: 4, hora: '14:00', paciente: 'Sofía Castro', motivo: 'Diseño Sonrisa', estado: 'confirmada' },
    ],
    facturas: [
      { id: 'FAC-001', paciente: 'Carlos Rodríguez', fecha: '2026-05-04', total: '$120.000', estado: 'pagada' },
      { id: 'FAC-002', paciente: 'Lucía Méndez', fecha: '2026-05-03', total: '$85.000', estado: 'pendiente' },
      { id: 'FAC-003', paciente: 'Andrés Villa', fecha: '2026-05-02', total: '$250.000', estado: 'pagada' },
    ],
    equipo: [
      { id: 1, nombre: 'Dr. Arango', rol: 'Ortodoncista', estado: 'activo' },
      { id: 2, nombre: 'Dra. Casas', rol: 'Endodoncista', estado: 'activo' },
      { id: 3, nombre: 'Juana Pérez', rol: 'Recepcionista', estado: 'activo' },
    ],
    servicios: [
      { id: 1, nombre: 'Consulta General', precio: '$50.000' },
      { id: 2, nombre: 'Limpieza Profunda', precio: '$85.000' },
      { id: 3, nombre: 'Ortodoncia (Control)', precio: '$120.000' },
    ]
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/95 backdrop-blur-xl p-0 md:p-8"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-white w-full h-full md:max-w-7xl md:rounded-[3rem] shadow-2xl relative flex flex-col overflow-hidden"
      >
        {/* Header de la Demo */}
        <div className="h-20 border-b border-slate-100 flex items-center justify-between px-8 bg-white shrink-0">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg editorial-gradient flex items-center justify-center">
                 <img src="/favicon.svg" className="w-5 h-5 brightness-0 invert" alt="logo" />
              </div>
              <span className="font-headline font-black text-slate-900 tracking-tight">DEMO INTERACTIVA</span>
            </div>
            
            <div className="hidden lg:flex bg-slate-100 p-1.5 rounded-2xl">
              <button 
                onClick={() => setRole('recepcionista')}
                className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${role === 'recepcionista' ? 'bg-white text-primary shadow-sm' : 'text-slate-500'}`}
              >
                Modo Recepcionista
              </button>
              <button 
                onClick={() => setRole('odontologo')}
                className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${role === 'odontologo' ? 'bg-white text-primary shadow-sm' : 'text-slate-500'}`}
              >
                Modo Odontólogo
              </button>
            </div>
          </div>
          
          <button onClick={onClose} className="w-12 h-12 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <div className="flex-grow flex overflow-hidden">
          {/* Sidebar */}
          <div className="w-20 lg:w-72 bg-white border-r border-slate-100 flex flex-col py-10 shrink-0">
            <div className="px-8 mb-10 hidden lg:block">
               <div className="p-5 bg-primary/5 rounded-3xl border border-primary/10">
                  <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">Clínica Demo</p>
                  <p className="text-sm font-bold text-slate-900 truncate">Santuario Dental</p>
               </div>
            </div>
            
            <nav className="space-y-2 px-4">
              <DemoSidebarLink icon={<Icons.Dashboard />} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
              <DemoSidebarLink icon={<Icons.Calendar />} label="Citas" active={activeTab === 'citas'} onClick={() => setActiveTab('citas')} />
              <DemoSidebarLink icon={<Icons.Team />} label="Pacientes" active={activeTab === 'pacientes'} onClick={() => setActiveTab('pacientes')} />
              {role === 'recepcionista' && (
                <>
                  <DemoSidebarLink icon={<Icons.Bill />} label="Facturación" active={activeTab === 'facturacion'} onClick={() => setActiveTab('facturacion')} />
                  <DemoSidebarLink icon={<Icons.Team />} label="Gestión" active={activeTab === 'gestion'} onClick={() => setActiveTab('gestion')} />
                </>
              )}
            </nav>
            
            <div className="mt-auto px-6 hidden lg:block">
               <div className="p-5 bg-slate-50 rounded-3xl flex items-center gap-4 border border-slate-100">
                  <div className="w-10 h-10 rounded-2xl bg-primary text-white flex items-center justify-center font-black">
                    {role[0].toUpperCase()}
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-sm font-bold text-slate-900 truncate">{role === 'recepcionista' ? 'Juana Pérez' : 'Dr. Arango'}</p>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{role}</p>
                  </div>
               </div>
            </div>
          </div>

          {/* Viewport */}
          <div className="flex-grow overflow-y-auto bg-slate-50/50 p-6 md:p-12 custom-scrollbar relative">
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div 
                  key="loader"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm z-10"
                >
                  <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                </motion.div>
              ) : (
                <motion.div
                  key={activeTab + role}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="max-w-6xl mx-auto space-y-12 text-left"
                >
                  {activeTab === 'dashboard' && (
                    <>
                      <header>
                        <h2 className="text-4xl font-black text-slate-900 mb-2 tracking-tight">Hola, {role === 'recepcionista' ? 'Juana' : 'Dr. Arango'} 👋</h2>
                        <p className="text-slate-500 font-medium text-lg">Resumen de actividad para hoy.</p>
                      </header>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <StatCard label="Citas Hoy" value="12" icon={<Icons.Calendar />} color="blue" />
                        <StatCard label="WhatsApp" value="28" icon={<Icons.WhatsApp />} color="green" />
                        <StatCard label="Recaudo" value="$2.4M" icon={<Icons.Bill />} color="purple" />
                      </div>

                      <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-2xl shadow-slate-200/50">
                        <div className="flex items-center justify-between mb-8">
                          <h3 className="text-2xl font-black text-slate-900">Próximas Citas</h3>
                          <button className="text-primary font-black text-sm uppercase tracking-widest hover:underline">Ver todas</button>
                        </div>
                        <div className="space-y-4">
                          {mockData.citas.map(cita => (
                            <div key={cita.id} className="flex items-center justify-between p-6 bg-slate-50 rounded-[2rem] hover:bg-white hover:shadow-lg transition-all border border-transparent hover:border-slate-100">
                               <div className="flex items-center gap-6">
                                  <span className="text-lg font-black text-primary w-16">{cita.hora}</span>
                                  <div>
                                     <p className="text-lg font-bold text-slate-900">{cita.paciente}</p>
                                     <p className="text-xs font-black uppercase text-slate-400 tracking-widest">{cita.motivo}</p>
                                  </div>
                               </div>
                               <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${cita.estado === 'confirmada' ? 'bg-green-100 text-green-600' : cita.estado === 'completada' ? 'bg-blue-100 text-blue-600' : 'bg-primary/10 text-primary'}`}>
                                 {cita.estado}
                               </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {activeTab === 'citas' && (
                    <div className="space-y-10">
                      <div className="flex items-center justify-between">
                         <h2 className="text-4xl font-black text-slate-900 tracking-tight">Agenda Maestra</h2>
                         <button className="px-8 py-3 bg-primary text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 transition-all">+ Agendar Cita</button>
                      </div>
                      <div className="grid grid-cols-7 gap-6">
                         {['LUN','MAR','MIE','JUE','VIE','SAB','DOM'].map((dia, idx) => (
                           <div key={dia} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm text-center space-y-2">
                              <p className="text-[10px] font-black text-slate-400 tracking-widest uppercase">{dia}</p>
                              <p className={`text-2xl font-black ${idx === 1 ? 'text-primary' : 'text-slate-800'}`}>{idx + 12}</p>
                              {idx === 1 && <div className="w-1.5 h-1.5 bg-primary rounded-full mx-auto" />}
                           </div>
                         ))}
                      </div>
                      <div className="bg-white p-24 rounded-[3rem] border-2 border-dashed border-slate-200 text-center space-y-4">
                         <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
                            <Icons.Calendar />
                         </div>
                         <p className="text-xl font-bold text-slate-400 italic">Vista de calendario interactiva en la versión completa.</p>
                      </div>
                    </div>
                  )}

                  {activeTab === 'pacientes' && (
                    <div className="space-y-10">
                      <div className="flex items-center justify-between">
                         <h2 className="text-4xl font-black text-slate-900 tracking-tight">Directorio</h2>
                         <div className="flex gap-4">
                            <div className="bg-white px-6 py-3 rounded-2xl border border-slate-100 flex items-center gap-3 shadow-sm">
                               <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                               <input placeholder="Buscar paciente..." className="bg-transparent border-0 text-sm font-bold outline-none w-48" />
                            </div>
                            <button className="px-8 py-3 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest">+ Nuevo</button>
                         </div>
                      </div>
                      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-2xl overflow-hidden">
                         <table className="w-full text-left border-collapse">
                            <thead>
                               <tr className="bg-slate-50/50">
                                  <th className="px-10 py-6 text-xs font-black uppercase text-slate-400 tracking-widest">Paciente</th>
                                  <th className="px-10 py-6 text-xs font-black uppercase text-slate-400 tracking-widest">Estado</th>
                                  <th className="px-10 py-6 text-xs font-black uppercase text-slate-400 tracking-widest">Última Visita</th>
                                  <th className="px-10 py-6"></th>
                               </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                               {['Carlos Rodríguez', 'Elena Gómez', 'Mateo Sánchez', 'Sofía Castro'].map(name => (
                                 <tr key={name} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-10 py-8">
                                       <div className="flex items-center gap-4">
                                          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center font-black text-slate-400">{name[0]}</div>
                                          <p className="font-bold text-slate-900 text-lg">{name}</p>
                                       </div>
                                    </td>
                                    <td className="px-10 py-8">
                                       <span className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-[10px] font-black uppercase">Activo</span>
                                    </td>
                                    <td className="px-10 py-8 text-slate-500 font-medium italic">Ayer</td>
                                    <td className="px-10 py-8 text-right">
                                       <button className="p-3 bg-slate-50 rounded-xl text-slate-400 hover:text-primary transition-colors">
                                          <Icons.Zap />
                                       </button>
                                    </td>
                                 </tr>
                               ))}
                            </tbody>
                         </table>
                      </div>
                    </div>
                  )}

                  {activeTab === 'facturacion' && (
                    <div className="space-y-10">
                      <header>
                        <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Facturación</h2>
                        <p className="text-slate-500 font-medium">Control de ingresos y estados de cuenta.</p>
                      </header>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                         <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl space-y-6">
                            <h3 className="text-xl font-black text-slate-900">Ingresos del Mes</h3>
                            <p className="text-5xl font-black text-primary">$12.450.000</p>
                            <div className="h-4 bg-slate-50 rounded-full overflow-hidden">
                               <div className="h-full bg-primary w-[70%]" />
                            </div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Meta: $18M (70% completado)</p>
                         </div>
                         <div className="bg-slate-900 p-10 rounded-[3rem] text-white space-y-6 flex flex-col justify-center">
                            <h3 className="text-xl font-black">Factura Rápida</h3>
                            <p className="text-slate-400">Genera cobros instantáneos para servicios comunes.</p>
                            <button className="mt-4 px-8 py-4 bg-white text-slate-900 rounded-2xl font-black uppercase text-xs tracking-widest shadow-2xl hover:bg-primary hover:text-white transition-all">
                               + Nueva Factura
                            </button>
                         </div>
                      </div>
                      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl overflow-hidden">
                         <div className="px-10 py-8 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="text-lg font-black text-slate-900">Facturas Recientes</h3>
                         </div>
                         <div className="p-4">
                            {mockData.facturas.map(f => (
                               <div key={f.id} className="flex items-center justify-between p-6 hover:bg-slate-50 rounded-[2rem] transition-all">
                                  <div className="flex gap-6">
                                     <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shrink-0">
                                        <Icons.Bill />
                                     </div>
                                     <div>
                                        <p className="font-bold text-slate-900">{f.id} - {f.paciente}</p>
                                        <p className="text-xs font-bold text-slate-400">{f.fecha}</p>
                                     </div>
                                  </div>
                                  <div className="text-right">
                                     <p className="font-black text-slate-900 text-lg">{f.total}</p>
                                     <span className={`text-[10px] font-black uppercase ${f.estado === 'pagada' ? 'text-green-500' : 'text-amber-500'}`}>
                                        {f.estado}
                                     </span>
                                  </div>
                               </div>
                            ))}
                         </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'gestion' && (
                    <div className="space-y-10">
                      <header>
                        <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Gestión de Clínica</h2>
                        <p className="text-slate-500 font-medium">Configuración maestra y gestión de equipo.</p>
                      </header>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                         {/* Configuración de Agenda */}
                         <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl space-y-8 text-left">
                            <div className="flex items-center gap-3">
                               <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                                  <Icons.Calendar />
                               </div>
                               <h3 className="text-xl font-black text-slate-900">Agenda</h3>
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                               <div className="space-y-1">
                                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Apertura</p>
                                  <p className="font-bold text-slate-700">08:00 AM</p>
                               </div>
                               <div className="space-y-1">
                                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cierre</p>
                                  <p className="font-bold text-slate-700">06:00 PM</p>
                               </div>
                               <div className="space-y-1">
                                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Turno</p>
                                  <p className="font-bold text-slate-700">30 min</p>
                               </div>
                               <div className="space-y-1">
                                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Limpieza</p>
                                  <p className="font-bold text-slate-700">10 min</p>
                               </div>
                            </div>
                            <button className="w-full py-3 bg-slate-50 text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-widest border border-dashed border-slate-200 cursor-not-allowed">
                               Editar (Solo Pro)
                            </button>
                         </div>

                         {/* Servicios */}
                         <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl space-y-8 text-left">
                            <div className="flex items-center gap-3">
                               <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center">
                                  <Icons.Zap />
                               </div>
                               <h3 className="text-xl font-black text-slate-900">Servicios</h3>
                            </div>
                            <div className="space-y-4">
                               {mockData.servicios.map(s => (
                                 <div key={s.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                                    <span className="font-bold text-slate-700">{s.nombre}</span>
                                    <span className="font-black text-primary">{s.precio}</span>
                                 </div>
                               ))}
                            </div>
                         </div>
                      </div>

                      {/* Equipo */}
                      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl overflow-hidden text-left">
                         <div className="px-10 py-8 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="text-lg font-black text-slate-900">Equipo</h3>
                            <button className="px-6 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest">+ Invitar</button>
                         </div>
                         <div className="overflow-x-auto">
                            <table className="w-full text-left">
                               <thead>
                                  <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50/50">
                                     <th className="px-10 py-6">Miembro</th>
                                     <th className="px-10 py-6">Rol</th>
                                     <th className="px-10 py-6">Estado</th>
                                  </tr>
                               </thead>
                               <tbody className="divide-y divide-slate-50">
                                  {mockData.equipo.map(m => (
                                    <tr key={m.id} className="hover:bg-slate-50/50 transition-colors">
                                       <td className="px-10 py-6">
                                          <div className="flex items-center gap-4">
                                             <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-primary">{m.nombre[0]}</div>
                                             <span className="font-bold text-slate-700">{m.nombre}</span>
                                          </div>
                                       </td>
                                       <td className="px-10 py-6 text-sm text-slate-500 font-medium">{m.rol}</td>
                                       <td className="px-10 py-6">
                                          <span className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-[10px] font-black uppercase tracking-tighter">Activo</span>
                                       </td>
                                    </tr>
                                  ))}
                               </tbody>
                            </table>
                         </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Floating CTA footer en la Demo */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur-2xl px-12 py-6 rounded-full border border-white/10 shadow-2xl z-50 flex items-center gap-12">
           <p className="text-white text-sm font-black tracking-tight whitespace-nowrap">¿TE GUSTA ESTA EXPERIENCIA?</p>
           <Link to="/register" onClick={onClose} className="px-10 py-3 bg-primary text-white rounded-full font-black text-xs uppercase tracking-widest hover:scale-105 hover:shadow-2xl shadow-primary/30 transition-all">
              REGÍSTRATE GRATIS
           </Link>
        </div>
      </motion.div>
    </motion.div>
  );
};

const DemoSidebarLink = ({ icon, label, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-5 px-6 py-4 rounded-[1.5rem] transition-all duration-300 ${active ? 'bg-primary/10 text-primary shadow-sm' : 'text-slate-400 hover:text-slate-900 hover:bg-slate-50'}`}
  >
    <div className={`shrink-0 transition-transform duration-300 ${active ? 'scale-110' : ''}`}>
       {React.cloneElement(icon, { size: 22, strokeWidth: active ? 2.5 : 2 })}
    </div>
    <span className="hidden lg:block text-sm font-black tracking-tight">{label}</span>
  </button>
);

const StatCard = ({ label, value, icon, color }) => {
  const colors = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    purple: "bg-purple-50 text-purple-600"
  };

  return (
    <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-2xl shadow-slate-200/50 flex flex-col gap-6 text-left group hover:border-primary/20 transition-all">
       <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${colors[color]} group-hover:scale-110 transition-transform`}>
          {React.cloneElement(icon, { size: 24 })}
       </div>
       <div>
          <p className="text-xs font-black uppercase text-slate-400 tracking-widest mb-1">{label}</p>
          <p className="text-4xl font-black text-slate-900">{value}</p>
       </div>
    </div>
  );
};

export default Landing;

