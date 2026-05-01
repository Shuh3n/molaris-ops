import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import PatientSearch from './PatientSearch';
import CustomSelect from './CustomSelect';
import CustomDatePicker from './CustomDatePicker';
import CustomTimePicker from './CustomTimePicker';

const AppointmentModal = ({ isOpen, onClose, onSave, appointment }) => {
  const { t } = useTranslation();
  const [step, setStep] = useState(1);
  const [dentists, setDentists] = useState([]);
  const [motivos, setMotivos] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [availabilityError, setAvailabilityError] = useState('');
  const [direction, setDirection] = useState(1);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    paciente_id: '',
    dentista_id: '',
    motivo_id: '',
    fecha: '',
    hora: '',
    duracion_minutos: 30,
    estado: 'programada',
    notas_medicas: '',
    costo: 0,
  });

  const [displayCosto, setDisplayCosto] = useState('0');

  const formatMoney = (value) => {
    if (value === undefined || value === null || value === '') return '';
    return new Intl.NumberFormat('es-AR').format(value);
  };

  const parseMoney = (value) => {
    return parseFloat(String(value).replace(/\./g, '').replace(/,/g, '.')) || 0;
  };

  const [selectedPatient, setSelectedPatient] = useState(null);

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        // 1. Cargamos motivos primero
        const { data: motifsData, error: mError } = await supabase
          .from('motivos_consulta')
          .select('id, nombre, costo_base')
          .eq('status', 'activo')
          .order('nombre', { ascending: true });

        if (mError) console.error("Error fetching motifs:", mError);
        if (motifsData) setMotivos(motifsData);

        // 2. Cargamos el perfil para saber la clínica
        const { data: myProfile, error: pError } = await supabase
          .from('perfiles')
          .select('clinica_id')
          .eq('id', session.user.id)
          .single();

        if (pError) console.error("Error fetching profile:", pError);

        if (myProfile?.clinica_id) {
          const { data: roleData } = await supabase
            .from('roles')
            .select('id')
            .eq('nombre', 'ORTODONCISTA')
            .single();

          if (roleData) {
            const { data: profileData } = await supabase
              .from('perfiles')
              .select('id, nombre:nombre_completo')
              .eq('rol_id', roleData.id)
              .eq('clinica_id', myProfile.clinica_id);
            
            setDentists(profileData || []);
          }
        }
      } catch (err) {
        console.error("Error fetching metadata:", err);
      }
    };

    if (isOpen) fetchMetadata();
  }, [isOpen]);

  useEffect(() => {
    if (appointment) {
      const dt = new Date(appointment.fecha_hora);
      const costoCita = appointment.costo || 0;
      setFormData({
        paciente_id: appointment.paciente_id,
        dentista_id: appointment.dentista_id || '',
        motivo_id: appointment.motivo_id || '',
        fecha: dt.toISOString().split('T')[0],
        hora: dt.toTimeString().slice(0, 5),
        duracion_minutos: appointment.duracion_minutos || 30,
        estado: appointment.estado || 'programada',
        notas_medicas: appointment.notas_medicas || '',
        costo: costoCita,
      });
      setDisplayCosto(formatMoney(costoCita));
      setSelectedPatient(appointment.pacientes);
    } else {
      setFormData({
        paciente_id: '',
        dentista_id: '',
        motivo_id: '',
        fecha: new Date().toISOString().split('T')[0],
        hora: '09:00',
        duracion_minutos: 30,
        estado: 'programada',
        notas_medicas: '',
        costo: 0,
      });
      setDisplayCosto('0');
      setSelectedPatient(null);
    }
    setStep(1);
    setError('');
    setAvailabilityError('');
  }, [appointment, isOpen]);

  useEffect(() => {
    const checkAvailability = async () => {
      if (!formData.fecha || !formData.hora || !formData.dentista_id || step !== 2) {
        setAvailabilityError('');
        return;
      }

      setIsChecking(true);
      setAvailabilityError('');
      
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const fechaHora = new Date(`${formData.fecha}T${formData.hora}`).toISOString();
        const queryParams = new URLSearchParams({
          check: 'true',
          dentista_id: formData.dentista_id,
          fecha_hora: fechaHora,
          duracion_minutos: formData.duracion_minutos.toString()
        });

        if (appointment) {
          queryParams.append('exclude_id', appointment.id);
        }

        const FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/manage-appointments`;
        const response = await fetch(`${FUNCTION_URL}?${queryParams.toString()}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${session?.access_token}`,
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          }
        });

        const result = await response.json();
        if (!result.disponible) {
          setAvailabilityError(t('appointments.modal.overlap_error') || 'El dentista ya tiene una cita en este horario');
        }
      } catch (err) {
        console.error("Error checking availability:", err);
      } finally {
        setIsChecking(false);
      }
    };

    checkAvailability();
  }, [formData.fecha, formData.hora, formData.dentista_id, step, t, appointment, formData.duracion_minutos]);

  const validateStep = (s) => {
    if (s === 2) {
      const selectedDate = new Date(formData.fecha + 'T00:00:00');
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        setError(t('appointments.modal.past_date_error'));
        return false;
      }

      if (availabilityError) {
        setError(availabilityError);
        return false;
      }
    }
    setError('');
    return true;
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) return;
    setIsSubmitting(true);
    try {
      const fechaHora = new Date(`${formData.fecha}T${formData.hora}`).toISOString();
      const { fecha, hora, costo, ...rest } = formData;
      await onSave({ ...rest, fecha_hora: fechaHora });
      onClose();
    } catch (error) {
      console.error("Error saving appointment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const stepVariants = {
    enter: (direction) => ({ x: direction > 0 ? 50 : -50, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (direction) => ({ x: direction < 0 ? 50 : -50, opacity: 0 })
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white w-full max-w-2xl rounded-[2rem] md:rounded-[2.5rem] shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh] md:min-h-[600px]">
            
            <div className="px-6 md:px-10 pt-8 md:pt-10 pb-4 md:pb-6 shrink-0">
              <div className="flex justify-between items-center mb-4 md:mb-6">
                <div className="text-left">
                  <h3 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
                    {appointment ? t('appointments.modal.title_edit') : t('appointments.modal.title_create')}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    {[1, 2, 3].map((s) => (
                      <div key={s} className={`h-1 rounded-full transition-all duration-500 ${step === s ? 'w-8 bg-primary' : 'w-2 bg-slate-100'}`} />
                    ))}
                    <span className="text-slate-400 font-bold text-[10px] uppercase tracking-widest ml-2">
                      {t('common.actions.next')} {step} {t('common.actions.back').toLowerCase()} 3
                    </span>
                  </div>
                </div>
                <button onClick={onClose} className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            </div>

            <div className="flex-1 px-6 md:px-10 py-2 md:py-4 relative overflow-y-auto overflow-x-hidden custom-scrollbar">
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div key={step} custom={direction} variants={stepVariants} initial="enter" animate="center" exit="exit" transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="w-full">
                  {step === 1 && (
                    <div className="space-y-6 md:space-y-8 text-left pb-4">
                      <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{t('appointments.modal.patient_search')}</label>
                        <PatientSearch selectedPatient={selectedPatient} onSelect={(p) => { setSelectedPatient(p); setFormData({...formData, paciente_id: p.id}); }} />
                      </div>
                      <div className="p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] bg-slate-50 border border-slate-100 flex flex-col items-center text-center gap-4">
                        <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center">
                          <span className="material-symbols-outlined text-primary text-2xl md:text-3xl">person_search</span>
                        </div>
                        <p className="text-slate-500 font-medium text-sm leading-relaxed max-w-[280px]">
                          {t('billing.modal.search_placeholder')}
                        </p>
                      </div>
                    </div>
                  )}

                  {step === 2 && (
                    <div className="space-y-6 md:space-y-8 text-left pb-4">
                      {(error || availabilityError) && (
                        <p className="p-3 bg-red-50 text-red-500 text-[10px] font-black rounded-xl text-center uppercase tracking-widest border border-red-100">
                          {error || availabilityError}
                        </p>
                      )}
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                        <CustomDatePicker 
                          label={t('appointments.modal.date')}
                          value={formData.fecha}
                          onChange={(val) => {
                            const isSat = new Date(val + 'T00:00:00').getDay() === 6;
                            const [h] = (formData.hora || '09:00').split(':').map(Number);
                            const newHora = (isSat && h > 16) ? '09:00' : formData.hora;
                            setFormData({ ...formData, fecha: val, hora: newHora });
                            setError('');
                          }}
                          minDate={new Date()}
                        />
                        <div className="relative">
                          <CustomTimePicker 
                            label={t('appointments.modal.time')}
                            value={formData.hora}
                            onChange={(val) => setFormData({...formData, hora: val})}
                            selectedDate={formData.fecha}
                          />
                          {isChecking && (
                            <div className="absolute right-4 bottom-4">
                              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full" />
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <CustomSelect 
                        label={t('appointments.modal.dentist')}
                        options={dentists}
                        value={formData.dentista_id}
                        onChange={(val) => setFormData({...formData, dentista_id: val})}
                        placeholder="Seleccionar Profesional..."
                        icon="medical_services"
                        searchPlaceholder="Buscar dentista..."
                      />
                    </div>
                  )}

                  {step === 3 && (
                    <div className="space-y-6 text-left pb-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                        <CustomSelect 
                          label={t('appointments.modal.reason')}
                          options={motivos}
                          value={formData.motivo_id}
                          onChange={(val) => {
                            const motivoSeleccionado = motivos.find(m => m.id === val);
                            const nuevoCosto = motivoSeleccionado ? motivoSeleccionado.costo_base : formData.costo;
                            setFormData({
                              ...formData, 
                              motivo_id: val,
                              costo: nuevoCosto
                            });
                            setDisplayCosto(formatMoney(nuevoCosto));
                          }}
                          placeholder="Elegir Motivo..."
                          icon="info"
                          searchPlaceholder="Filtrar motivos..."
                        />

                        <div className="space-y-3">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Costo de la Cita ($)</label>
                          <div className="relative">
                            <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                            <input 
                              type="text" 
                              value={displayCosto} 
                              onFocus={(e) => {
                                if (parseMoney(e.target.value) === 0) setDisplayCosto('');
                              }}
                              onBlur={(e) => {
                                const val = parseMoney(e.target.value);
                                setFormData({ ...formData, costo: val });
                                setDisplayCosto(formatMoney(val));
                              }}
                              onChange={(e) => {
                                const rawValue = e.target.value.replace(/[^\d]/g, '');
                                const numericValue = parseInt(rawValue) || 0;
                                setDisplayCosto(formatMoney(numericValue));
                              }}
                              placeholder="0"
                              className="w-full pl-10 pr-6 py-3.5 md:py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-primary/10 transition-all"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{t('appointments.modal.notes')}</label>
                        <textarea value={formData.notas_medicas} onChange={(e) => setFormData({...formData, notas_medicas: e.target.value})} rows="3" placeholder="Algún detalle relevante..."
                          className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium outline-none focus:ring-4 focus:ring-primary/10 transition-all resize-none" />
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="px-6 md:px-10 py-6 md:py-8 shrink-0 flex justify-between gap-4 border-t border-slate-50 bg-white">
              {step > 1 ? (
                <button onClick={() => {setDirection(-1); setStep(s => s-1);}} className="px-4 md:px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-[0.15em] text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg">west</span> <span className="hidden sm:inline">{t('common.actions.back')}</span>
                </button>
              ) : <div />}
              
              {step < 3 ? (
                <button onClick={() => { if(validateStep(step)) { setDirection(1); setStep(s => s+1); } }} disabled={(step === 1 && !formData.paciente_id) || isChecking || !!availabilityError} 
                  className="bg-primary text-white px-8 md:px-10 py-3 rounded-2xl font-black text-[10px] uppercase tracking-[0.15em] shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2">
                  {t('common.actions.next')} <span className="material-symbols-outlined text-lg">east</span>
                </button>
              ) : (
                <button onClick={handleSubmit} disabled={isSubmitting || !formData.motivo_id || isChecking || !!availabilityError} 
                  className="bg-[#10B981] text-white px-10 md:px-12 py-3 rounded-2xl font-black text-[10px] uppercase tracking-[0.15em] shadow-xl shadow-[#10B981]/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2">
                  {isSubmitting && <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-4 h-4 border-2 border-white border-t-transparent rounded-full" />}
                  {t('appointments.modal.save')} <span className="material-symbols-outlined text-lg">task_alt</span>
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AppointmentModal;