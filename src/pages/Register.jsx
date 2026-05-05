import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';

import LanguageToggle from '../components/LanguageToggle';

const Register = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
      setError("Por favor, ingresa tu nombre completo.");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("El formato del correo electrónico no es válido.");
      return false;
    }
    if (formData.password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
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
      setError("Por favor, completa los datos de la clínica.");
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
        // Captura de errores específicos de Supabase Auth
        if (authError.status === 429) {
          throw new Error("Demasiados intentos. Por favor, espera unos minutos antes de intentar de nuevo.");
        }
        if (authError.message.includes('User already registered')) {
          throw new Error("Este correo electrónico ya está registrado. Intenta iniciar sesión.");
        }
        if (authError.message.includes('Database error saving new user')) {
          throw new Error("Error interno al crear el perfil. Por favor, contacta a soporte.");
        }
        throw authError;
      }
      
      if (!authData.user) throw new Error("No se pudo completar el registro. Verifica tu conexión.");

      // 2. Crear la Clínica
      const { data: clinicData, error: clinicError } = await supabase
        .from('clinicas')
        .insert([{
          nombre_consultorio: formData.clinicName,
          telefono: formData.phone,
          activa: true,
          fecha_vencimiento: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
        }])
        .select()
        .single();

      if (clinicError) {
        console.error("Clinic Error:", clinicError);
        if (clinicError.code === '42P18') { // Columna no encontrada o tipo de dato incorrecto
           throw new Error("Error de configuración en la base de datos (Columna faltante). Contacta a soporte.");
        }
        throw new Error("Usuario creado, pero hubo un error al registrar la clínica: " + clinicError.message);
      }

      // 3. Actualizar el perfil (creado por trigger)
      const { data: roleData } = await supabase
        .from('roles')
        .select('id')
        .eq('nombre', 'ADMIN_GLOBAL')
        .single();

      if (!roleData) throw new Error("Configuración de roles no encontrada.");

      const { error: profileError } = await supabase
        .from('perfiles')
        .update({
          nombre_completo: formData.name,
          clinica_id: clinicData.id,
          rol_id: roleData.id,
          email: formData.email
        })
        .eq('id', authData.user.id);

      if (profileError) {
        console.error("Profile Update Error:", profileError);
        // No bloqueamos aquí porque el usuario y la clínica ya existen
      }

      alert("¡Registro exitoso! Ya puedes iniciar sesión con tu nueva clínica.");
      navigate('/login');

    } catch (err) {
      setError(err.message || "Ocurrió un error inesperado durante el registro.");
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
      className="bg-background font-body text-on-surface min-h-screen flex flex-col items-center justify-center p-6 pt-24 selection:bg-primary-fixed selection:text-on-primary-fixed relative overflow-hidden"
    >
      <div className="absolute top-6 right-6 z-20">
        <LanguageToggle />
      </div>

      <div className="absolute top-6 left-6 z-20">
        <Link
          to="/login"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 hover:bg-white text-slate-700 font-bold text-sm shadow-md transition-all"
        >
          <span className="material-symbols-outlined text-base">arrow_back</span>
          {t('common.actions.back')}
        </Link>
      </div>

      <motion.main 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full max-w-xl"
      >
        <div className="glass-panel rounded-[2.5rem] p-10 lg:p-14 ambient-shadow border border-white/20">
          <div className="flex flex-col items-center gap-2 mb-10">
            <div className="w-16 h-16 rounded-2xl editorial-gradient flex items-center justify-center mb-4 shadow-lg">
              <img src="/favicon.svg" alt="Molaris logo" className="w-10 h-10" />
            </div>
            <h3 className="font-headline text-3xl font-bold tracking-tight text-on-surface text-center">
              {t('register.title')}
            </h3>
            <p className="text-on-surface-variant text-sm font-medium text-center">
              {t('register.subtitle')}
            </p>
            
            <div className="flex items-center gap-2 mt-4">
              {[1, 2].map((s) => (
                <div key={s} className={`h-1.5 rounded-full transition-all duration-500 ${step === s ? 'w-12 bg-primary' : 'w-3 bg-slate-100'}`} />
              ))}
            </div>
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

          <form className="space-y-6" onSubmit={handleRegister}>
            <AnimatePresence mode="wait">
              {step === 1 ? (
                <motion.div 
                  key="step1"
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -20, opacity: 0 }}
                  className="space-y-6"
                >
                  <div className="space-y-2">
                    <label className="font-headline font-semibold text-sm text-on-surface ml-1">{t('register.name')}</label>
                    <div className="bg-slate-100/50 rounded-2xl flex items-center px-4 py-1 border border-transparent focus-within:bg-white focus-within:border-primary/20 focus-within:ring-4 focus-within:ring-primary/5 transition-all">
                      <span className="material-symbols-outlined text-slate-400 mr-3">person</span>
                      <input 
                        className="bg-transparent border-0 focus:ring-0 w-full py-4 text-on-surface font-medium" 
                        placeholder="Dr. Smith" 
                        value={formData.name}
                        onChange={(e) => updateField('name', e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="font-headline font-semibold text-sm text-on-surface ml-1">{t('login.email')}</label>
                    <div className="bg-slate-100/50 rounded-2xl flex items-center px-4 py-1 border border-transparent focus-within:bg-white focus-within:border-primary/20 focus-within:ring-4 focus-within:ring-primary/5 transition-all">
                      <span className="material-symbols-outlined text-slate-400 mr-3">alternate_email</span>
                      <input 
                        className="bg-transparent border-0 focus:ring-0 w-full py-4 text-on-surface font-medium" 
                        type="email"
                        placeholder="dr.smith@molaris.com" 
                        value={formData.email}
                        onChange={(e) => updateField('email', e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="font-headline font-semibold text-sm text-on-surface ml-1">{t('login.password')}</label>
                    <div className="bg-slate-100/50 rounded-2xl flex items-center px-4 py-1 border border-transparent focus-within:bg-white focus-within:border-primary/20 focus-within:ring-4 focus-within:ring-primary/5 transition-all">
                      <span className="material-symbols-outlined text-slate-400 mr-3">lock</span>
                      <input 
                        className="bg-transparent border-0 focus:ring-0 w-full py-4 text-on-surface font-medium" 
                        type="password"
                        placeholder="••••••••" 
                        value={formData.password}
                        onChange={(e) => updateField('password', e.target.value)}
                        required
                      />
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
                  <div className="space-y-2">
                    <label className="font-headline font-semibold text-sm text-on-surface ml-1">{t('register.clinic_name')}</label>
                    <div className="bg-slate-100/50 rounded-2xl flex items-center px-4 py-1 border border-transparent focus-within:bg-white focus-within:border-primary/20 focus-within:ring-4 focus-within:ring-primary/5 transition-all">
                      <span className="material-symbols-outlined text-slate-400 mr-3">domain</span>
                      <input 
                        className="bg-transparent border-0 focus:ring-0 w-full py-4 text-on-surface font-medium" 
                        placeholder="Molaris Clinic Center" 
                        value={formData.clinicName}
                        onChange={(e) => updateField('clinicName', e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="font-headline font-semibold text-sm text-on-surface ml-1">{t('register.phone')}</label>
                    <div className="bg-slate-100/50 rounded-2xl flex items-center px-4 py-1 border border-transparent focus-within:bg-white focus-within:border-primary/20 focus-within:ring-4 focus-within:ring-primary/5 transition-all">
                      <span className="material-symbols-outlined text-slate-400 mr-3">call</span>
                      <input 
                        className="bg-transparent border-0 focus:ring-0 w-full py-4 text-on-surface font-medium" 
                        placeholder="+1 234 567 890" 
                        value={formData.phone}
                        onChange={(e) => updateField('phone', e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10">
                    <div className="flex items-start gap-4">
                      <span className="material-symbols-outlined text-primary">verified_user</span>
                      <div>
                        <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1">Prueba Gratuita</p>
                        <p className="text-xs text-on-surface-variant font-medium">Al registrarte, obtendrás 15 días de acceso total para que pruebes MOLARIS OPS con tu equipo.</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex gap-4">
              {step > 1 && (
                <button 
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="flex-1 py-5 rounded-full border-2 border-slate-100 text-slate-500 font-headline font-bold transition-all hover:bg-slate-50"
                >
                  {t('common.actions.back')}
                </button>
              )}
              <button 
                className="flex-[2] py-5 rounded-full editorial-gradient text-white font-headline font-bold text-lg shadow-xl hover:shadow-primary/20 hover:scale-[1.02] active:scale-[0.96] transition-all flex items-center justify-center gap-2 group disabled:opacity-70" 
                type="submit"
                disabled={loading}
              >
                {loading ? (
                  <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    {step === 1 ? t('common.actions.next') : t('register.create_account')}
                    <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-12 pt-8 border-t border-slate-100 text-center text-slate-400 text-xs font-medium">
            {t('register.already_have')} <Link to="/login" className="text-primary font-bold hover:underline">{t('register.login')}</Link>
          </div>
        </div>
      </motion.main>

      <div className="fixed top-[-10%] right-[-5%] w-[40rem] h-[40rem] bg-primary/5 rounded-full blur-[120px] -z-10"></div>
      <div className="fixed bottom-[-10%] left-[-5%] w-[35rem] h-[35rem] bg-secondary/5 rounded-full blur-[100px] -z-10"></div>
    </motion.div>
  );
};

export default Register;
