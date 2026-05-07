import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';

import LanguageToggle from '../components/LanguageToggle';

const Login = () => {
  const { t } = useTranslation(); // Quitamos i18n ya que no lo usamos directamente aquí
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      const { data: profile, error: profileError } = await supabase
        .from('perfiles')
        .select('rol_id, roles(nombre), clinicas(activa, fecha_vencimiento)')
        .eq('id', data.user.id)
        .single();

      if (profileError) throw profileError;

      // Verificar licencia
      const clinic = profile.clinicas;
      const isExpired = clinic?.fecha_vencimiento && new Date(clinic.fecha_vencimiento) < new Date();
      
      if (!clinic?.activa || isExpired) {
        await supabase.auth.signOut();
        throw new Error('Licencia inactiva o vencida. Contacte al administrador.');
      }

      const roleName = profile.roles?.nombre;
      if (roleName === 'RECEPCIONISTA') {
        navigate('/dashboard/recepcionista');
      } else if (roleName === 'ORTODONCISTA') {
        navigate('/dashboard/dentista');
      } else {
        navigate('/dashboard/recepcionista');
      }

    } catch (err) {
      const msg = err.message === 'Invalid login credentials' ? 'Credenciales incorrectas' : err.message;
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-background font-body text-on-surface min-h-screen flex flex-col items-center justify-center p-6 pt-24 selection:bg-primary-fixed selection:text-on-primary-fixed relative overflow-hidden"
    >
      {/* Language Toggle */}
      <div className="absolute top-6 right-6 z-20">
        <LanguageToggle />
      </div>

      <div className="absolute top-6 left-6 z-20">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 hover:bg-white text-slate-700 font-bold text-sm shadow-md transition-all"
        >
          <span className="material-symbols-outlined text-base">arrow_back</span>
          Volver al inicio
        </Link>
      </div>

      <motion.main 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="w-full lg:w-[70vw] max-w-[1600px] grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
      >
        {/* Left Column: Branding & Experience */}
        <section className="hidden lg:flex flex-col gap-8 pr-12">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl editorial-gradient flex items-center justify-center shadow-lg">
              <img src="/favicon.svg" alt="Molaris logo" className="w-8 h-8" />
            </div>
            <h1 className="font-headline font-extrabold text-3xl tracking-tight text-primary">MOLARIS OPS</h1>
          </div>
          <div className="space-y-6">
            <h2 className="font-headline text-5xl font-extrabold text-on-surface leading-tight tracking-tighter">
              {t('login.precision')} <br/>{t('login.meets')} <span className="text-primary italic">{t('login.serenity')}</span>
            </h2>
            <p className="text-on-surface-variant text-lg leading-relaxed max-w-md">
              {t('login.branding_desc')}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-8">
            <div className="p-6 rounded-xl bg-surface-container-low border-0 flex flex-col gap-2 shadow-sm">
              <span className="material-symbols-outlined text-primary">security</span>
              <span className="font-headline font-bold text-sm">HIPAA Compliant</span>
              <span className="text-xs text-on-surface-variant">Bank-grade data encryption for every patient record.</span>
            </div>
            <div className="p-6 rounded-xl bg-surface-container-low border-0 flex flex-col gap-2 shadow-sm">
              <span className="material-symbols-outlined text-primary">bolt</span>
              <span className="font-headline font-bold text-sm">Real-time Sync</span>
              <span className="text-xs text-on-surface-variant">Instant updates across all clinic workstations.</span>
            </div>
          </div>
        </section>

        {/* Right Column: Login Form Card */}
        <section className="w-full flex justify-center lg:justify-end">
          <div className="w-full max-w-[480px] glass-panel rounded-[2.5rem] p-10 lg:p-14 ambient-shadow border border-white/20">
            <div className="flex flex-col items-center lg:items-start gap-2 mb-10">
              <div className="lg:hidden w-16 h-16 rounded-2xl editorial-gradient flex items-center justify-center mb-4 shadow-lg">
                <img src="/favicon.svg" alt="Molaris logo" className="w-10 h-10" />
              </div>
              <h3 className="font-headline text-3xl font-bold tracking-tight text-on-surface">{t('login.welcome')}</h3>
              <p className="text-on-surface-variant text-sm font-medium">{t('login.subtitle')}</p>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-xs font-bold flex items-center gap-2 overflow-hidden"
                >
                  <span className="material-symbols-outlined text-sm">error</span>
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <form className="space-y-6" onSubmit={handleLogin}>
              <div className="space-y-2">
                <label className="font-headline font-semibold text-sm text-on-surface ml-1" htmlFor="email">{t('login.email')}</label>
                <div className="bg-slate-100/50 rounded-2xl flex items-center px-4 py-1 border border-transparent focus-within:bg-white focus-within:border-primary/20 focus-within:ring-4 focus-within:ring-primary/5 transition-all">
                  <span className="material-symbols-outlined text-slate-400 mr-3">alternate_email</span>
                  <input 
                    className="bg-transparent border-0 focus:ring-0 w-full py-4 text-on-surface placeholder:text-slate-400 font-medium disabled:opacity-50" 
                    id="email" 
                    placeholder="dr.smith@molaris.com" 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <label className="font-headline font-semibold text-sm text-on-surface" htmlFor="password">{t('login.password')}</label>
                  <a className="text-xs font-bold text-primary hover:underline transition-all" href="#">{t('login.forgot')}</a>
                </div>
                <div className="bg-slate-100/50 rounded-2xl flex items-center px-4 py-1 border border-transparent focus-within:bg-white focus-within:border-primary/20 focus-within:ring-4 focus-within:ring-primary/5 transition-all relative">
                  <span className="material-symbols-outlined text-slate-400 mr-3">lock</span>
                  <input 
                    className="bg-transparent border-0 focus:ring-0 w-full py-4 text-on-surface placeholder:text-slate-400 font-medium disabled:opacity-50 pr-12" 
                    id="password" 
                    placeholder="••••••••" 
                    type={showPassword ? "text" : "password"} 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 text-slate-400 hover:text-primary transition-colors focus:outline-none"
                  >
                    <span className="material-symbols-outlined">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3 px-1 py-2">
                <input 
                  className="w-5 h-5 rounded-lg border-slate-200 text-primary focus:ring-primary/20 bg-surface-container-highest transition-all cursor-pointer" 
                  id="remember" 
                  type="checkbox"
                />
                <label className="text-sm font-medium text-on-surface-variant cursor-pointer" htmlFor="remember">{t('login.remember')}</label>
              </div>

              <button 
                className={`w-full py-5 rounded-full editorial-gradient text-white font-headline font-bold text-lg shadow-xl hover:shadow-primary/20 hover:scale-[1.02] active:scale-[0.96] transition-all flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed`} 
                type="submit"
                disabled={loading}
              >
                {loading ? (
                  <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    {t('login.enter')}
                    <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
                  </>
                )}
              </button>
            </form>

            <div className="mt-12 pt-8 border-t border-slate-100 text-center text-slate-400 text-xs font-medium">
              {t('login.new')} <Link to="/register" className="text-primary font-bold hover:underline">{t('login.request')}</Link>
            </div>
          </div>
        </section>
      </motion.main>

      {/* Background Decoration */}
      <div className="fixed top-[-10%] right-[-5%] w-[40rem] h-[40rem] bg-primary/5 rounded-full blur-[120px] -z-10"></div>
      <div className="fixed bottom-[-10%] left-[-5%] w-[35rem] h-[35rem] bg-secondary/5 rounded-full blur-[100px] -z-10"></div>

      <footer className="mt-12 text-center text-slate-400 text-xs font-medium">
        © 2026 MOLARIS OPS. All systems operational. 
      </footer>
    </motion.div>
  );
};

export default Login;
