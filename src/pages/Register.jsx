import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { useToast } from '../components/ToastContext';

import LanguageToggle from '../components/LanguageToggle';

const Register = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { addToast } = useToast();
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    clinicName: '',
    phone: '',
  });

  const validateStep1 = () => {
    setError(null);
    if (!formData.name.trim()) {
      setError(t('register.validation.name_required'));
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError(t('register.validation.email_invalid'));
      return false;
    }
    if (formData.password.length < 6) {
      setError(t('register.validation.password_short'));
      return false;
    }
    return true;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    
    if (step === 1) {
      if (validateStep1()) {
        setStep(2);
      }
      return;
    }

    if (!formData.clinicName.trim() || !formData.phone.trim()) {
      setError(t('register.validation.clinic_required'));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Registro en Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            nombre_completo: formData.name,
          }
        }
      });

      if (authError) {
        console.error("Auth Error:", authError);
        throw new Error(t('register.validation.auth_error'));
      }
      
      if (!authData.user) throw new Error(t('register.error'));

      // 2. Obtener licencia básica por defecto
      const { data: licenseData } = await supabase
        .from('licencias')
        .select('id')
        .eq('nombre', 'Básica')
        .single();

      // 3. Crear la Clínica
      const { data: clinicData, error: clinicError } = await supabase
        .from('clinicas')
        .insert([{
          nombre_consultorio: formData.clinicName,
          telefono: formData.phone,
          licencia_id: licenseData?.id,
          activa: true,
          fecha_vencimiento: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
        }])
        .select()
        .single();

      if (clinicError) {
        console.error("Clinic Error:", clinicError);
        throw new Error(t('register.validation.db_error'));
      }

      // 4. Actualizar el perfil (creado por trigger o upsert)
      const { data: roleData } = await supabase
        .from('roles')
        .select('id')
        .eq('nombre', 'ADMIN_GLOBAL')
        .single();

      if (!roleData) throw new Error("Configuración de roles no encontrada.");

      const { error: profileError } = await supabase
        .from('perfiles')
        .upsert({
          id: authData.user.id,
          nombre_completo: formData.name,
          clinica_id: clinicData.id,
          rol_id: roleData.id,
          email: formData.email
        });

      if (profileError) {
        console.error("Profile Error:", profileError);
        // Intentamos un update si el upsert falla por RLS (aunque ya habilitamos UPDATE)
        const { error: updateError } = await supabase
          .from('perfiles')
          .update({
            nombre_completo: formData.name,
            clinica_id: clinicData.id,
            rol_id: roleData.id,
            email: formData.email
          })
          .eq('id', authData.user.id);
        
        if (updateError) throw new Error(t('register.validation.db_error'));
      }

      addToast(t('register.success'), 'success');
      navigate('/login');

    } catch (err) {
      setError(err.message || t('register.error'));
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-slate-50/50 font-body text-slate-900 min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 pt-24 selection:bg-primary/20 relative overflow-hidden"
    >
      <div className="absolute top-6 right-6 z-20">
        <LanguageToggle />
      </div>

      <div className="absolute top-6 left-6 z-20">
        <Link
          to="/login"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white shadow-sm border border-slate-100 hover:border-slate-200 text-slate-600 font-black text-[10px] uppercase tracking-widest transition-all hover:-translate-x-1"
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          {t('common.actions.back')}
        </Link>
      </div>

      <motion.main 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full max-w-xl relative z-10"
      >
        <div className="bg-white/80 backdrop-blur-2xl rounded-[3rem] p-8 sm:p-12 lg:p-16 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] border border-white/50 relative overflow-hidden">
          {/* Subtle decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16" />
          
          <div className="flex flex-col items-center gap-6 mb-12 relative">
            <motion.div 
              whileHover={{ rotate: 10, scale: 1.1 }}
              className="w-16 h-16 rounded-[1.5rem] bg-slate-900 flex items-center justify-center shadow-2xl"
            >
              <img src="/favicon.svg" alt="Molaris logo" className="w-10 h-10" />
            </motion.div>
            
            <div className="text-center space-y-2">
              <h3 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
                {t('register.title')}
              </h3>
              <p className="text-slate-500 text-sm font-medium">
                {t('register.subtitle')}
              </p>
            </div>
            
            <div className="flex items-center gap-3 mt-2">
              {[1, 2].map((s) => (
                <div key={s} className={`h-1.5 rounded-full transition-all duration-500 ${step === s ? 'w-12 bg-primary shadow-lg shadow-primary/30' : 'w-2 bg-slate-100'}`} />
              ))}
            </div>
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                initial={{ height: 0, opacity: 0, y: -10 }}
                animate={{ height: 'auto', opacity: 1, y: 0 }}
                exit={{ height: 0, opacity: 0, y: -10 }}
                className="mb-8 p-5 bg-red-50/50 backdrop-blur-sm border border-red-100 text-red-600 rounded-3xl text-[11px] font-black uppercase tracking-wider flex items-center gap-3 overflow-hidden shadow-sm"
              >
                <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[14px]">error</span>
                </div>
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <form className="space-y-8" onSubmit={handleRegister}>
            <AnimatePresence mode="wait">
              {step === 1 ? (
                <motion.div 
                  key="step1"
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -20, opacity: 0 }}
                  className="space-y-6"
                >
                  <div className="space-y-2.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">{t('register.name')}</label>
                    <div className="group relative">
                      <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                        <span className="material-symbols-outlined text-slate-400 group-focus-within:text-primary transition-colors text-xl">person</span>
                      </div>
                      <input 
                        className="block w-full pl-14 pr-6 py-5 bg-slate-100/50 border border-transparent rounded-[2rem] focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-all text-sm font-bold text-slate-900 placeholder:text-slate-300" 
                        placeholder={t('register.name_placeholder')} 
                        value={formData.name}
                        onChange={(e) => updateField('name', e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">{t('login.email')}</label>
                    <div className="group relative">
                      <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                        <span className="material-symbols-outlined text-slate-400 group-focus-within:text-primary transition-colors text-xl">alternate_email</span>
                      </div>
                      <input 
                        className="block w-full pl-14 pr-6 py-5 bg-slate-100/50 border border-transparent rounded-[2rem] focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-all text-sm font-bold text-slate-900 placeholder:text-slate-300" 
                        type="email"
                        placeholder={t('register.email_placeholder')} 
                        value={formData.email}
                        onChange={(e) => updateField('email', e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">{t('login.password')}</label>
                    <div className="group relative">
                      <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                        <span className="material-symbols-outlined text-slate-400 group-focus-within:text-primary transition-colors text-xl">lock</span>
                      </div>
                      <input 
                        className="block w-full pl-14 pr-14 py-5 bg-slate-100/50 border border-transparent rounded-[2rem] focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-all text-sm font-bold text-slate-900 placeholder:text-slate-300" 
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••" 
                        value={formData.password}
                        onChange={(e) => updateField('password', e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors focus:outline-none"
                      >
                        <span className="material-symbols-outlined text-xl">
                          {showPassword ? 'visibility_off' : 'visibility'}
                        </span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  key="step2"
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -20, opacity: 0 }}
                  className="space-y-6"
                >
                  <div className="space-y-2.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">{t('register.clinic_name')}</label>
                    <div className="group relative">
                      <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                        <span className="material-symbols-outlined text-slate-400 group-focus-within:text-primary transition-colors text-xl">domain</span>
                      </div>
                      <input 
                        className="block w-full pl-14 pr-6 py-5 bg-slate-100/50 border border-transparent rounded-[2rem] focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-all text-sm font-bold text-slate-900 placeholder:text-slate-300" 
                        placeholder={t('register.clinic_placeholder')} 
                        value={formData.clinicName}
                        onChange={(e) => updateField('clinicName', e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">{t('register.phone')}</label>
                    <div className="group relative">
                      <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                        <span className="material-symbols-outlined text-slate-400 group-focus-within:text-primary transition-colors text-xl">call</span>
                      </div>
                      <input 
                        className="block w-full pl-14 pr-6 py-5 bg-slate-100/50 border border-transparent rounded-[2rem] focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-all text-sm font-bold text-slate-900 placeholder:text-slate-300" 
                        placeholder={t('register.phone_placeholder')} 
                        value={formData.phone}
                        onChange={(e) => updateField('phone', e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <motion.div 
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="p-6 rounded-[2rem] bg-slate-900 text-white relative overflow-hidden group shadow-xl"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-2xl -mr-16 -mt-16 group-hover:bg-primary/30 transition-colors" />
                    <div className="flex items-start gap-4 relative z-10">
                      <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-primary">verified_user</span>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-1">{t('register.trial_title')}</p>
                        <p className="text-xs text-slate-300 leading-relaxed font-medium">{t('register.trial_desc')}</p>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex gap-4 pt-4">
              {step > 1 && (
                <button 
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="flex-1 py-5 rounded-[2rem] border border-slate-200 text-slate-500 font-black text-[10px] uppercase tracking-widest transition-all hover:bg-slate-50 hover:border-slate-300"
                >
                  {t('common.actions.back')}
                </button>
              )}
              <button 
                className="flex-[2] py-5 rounded-[2rem] bg-primary text-white font-black text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 active:scale-[0.96] transition-all flex items-center justify-center gap-3 group disabled:opacity-50 disabled:cursor-not-allowed" 
                type="submit"
                disabled={loading}
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>{step === 1 ? t('common.actions.next') : t('register.create_account')}</span>
                    <span className="material-symbols-outlined text-base group-hover:translate-x-1 transition-transform">arrow_forward</span>
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-12 pt-10 border-t border-slate-100 text-center">
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3">
              {t('register.already_have')} 
              <Link to="/login" className="text-primary hover:underline group flex items-center gap-1 transition-all">
                {t('register.login')}
                <span className="material-symbols-outlined text-xs group-hover:translate-x-0.5 transition-transform">east</span>
              </Link>
            </p>
          </div>
        </div>
      </motion.main>

      {/* Modern Background Accents */}
      <div className="fixed top-[-10%] right-[-5%] w-[45rem] h-[45rem] bg-primary/10 rounded-full blur-[140px] -z-10 animate-pulse-slow"></div>
      <div className="fixed bottom-[-10%] left-[-5%] w-[40rem] h-[40rem] bg-blue-500/5 rounded-full blur-[120px] -z-10"></div>
    </motion.div>
  );
};

export default Register;
