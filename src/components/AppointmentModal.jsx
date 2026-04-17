import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import PatientSearch from './PatientSearch';
import CustomSelect from './CustomSelect';

const AppointmentModal = ({ isOpen, onClose, onSave, appointment }) => {
  const { t } = useTranslation();
  const [step, setStep] = useState(1);
  const [dentists, setDentists] = useState([]);
  const [motivos, setMotivos] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [direction, setDirection] = useState(1);

  const [formData, setFormData] = useState({
    paciente_id: '',
    dentista_id: '',
    motivo_id: '',
    fecha: '',
    hora: '',
    duracion_minutos: 30,
    estado: 'programada',
    notas_medicas: '',
  });

  const [selectedPatient, setSelectedPatient] = useState(null);

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        // 1. Obtenemos mi propia clinica_id para filtrar
        const { data: myProfile } = await supabase
          .from('perfiles')
          .select('clinica_id')
          .eq('id', session.user.id)
          .single();

        if (myProfile?.clinica_id) {
          // 2. Buscamos el ID del rol ORTODONCISTA
          const { data: roleData } = await supabase
            .from('roles')
            .select('id')
            .eq('nombre', 'ORTODONCISTA')
            .single();

          if (roleData) {
            // 3. Buscamos dentistas de MI clínica
            const { data: profileData } = await supabase
              .from('perfiles')
              .select('id, nombre:nombre_completo') // Renombramos para el CustomSelect
              .eq('rol_id', roleData.id)
              .eq('clinica_id', myProfile.clinica_id);
            
            setDentists(profileData || []);
          }
        }

        // 4. Traer motivos
        const { data: motifsData } = await supabase
          .from('motivos_consulta')
          .select('id, nombre')
          .eq('status', 'activo')
          .order('nombre', { ascending: true });

        if (motifsData) setMotivos(motifsData);
      } catch (error) {
        console.error("Error fetching metadata:", error);
      }
    };

    if (isOpen) fetchMetadata();
  }, [isOpen]);

  useEffect(() => {
    if (appointment) {
      const dt = new Date(appointment.fecha_hora);
      setFormData({
        paciente_id: appointment.paciente_id,
        dentista_id: appointment.dentista_id || '',
        motivo_id: appointment.motivo_id || '',
        fecha: dt.toISOString().split('T')[0],
        hora: dt.toTimeString().slice(0, 5),
        duracion_minutos: appointment.duracion_minutos || 30,
        estado: appointment.estado || 'programada',
        notas_medicas: appointment.notas_medicas || '',
      });
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
      });
      setSelectedPatient(null);
    }
    setStep(1);
  }, [appointment, isOpen]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const fechaHora = new Date(`${formData.fecha}T${formData.hora}`).toISOString();
      const { fecha, hora, ...rest } = formData;
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl relative overflow-hidden flex flex-col min-h-[550px]">
            
            {/* Stepper Header */}
            <div className="px-10 pt-10 pb-6 shrink-0">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">{appointment ? 'Editar Cita' : 'Nueva Cita'}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    {[1, 2, 3].map((s) => (
                      <div key={s} className={`h-1 rounded-full transition-all duration-500 ${step === s ? 'w-8 bg-primary' : 'w-2 bg-slate-100'}`} />
                    ))}
                    <span className="text-slate-400 font-bold text-[10px] uppercase tracking-widest ml-2">Paso {step} de 3</span>
                  </div>
                </div>
                <button onClick={onClose} className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 px-10 py-4 relative overflow-hidden">
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div key={step} custom={direction} variants={stepVariants} initial="enter" animate="center" exit="exit" transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="w-full h-full">
                  {step === 1 && (
                    <div className="space-y-8">
                      <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Seleccionar Paciente</label>
                        <PatientSearch selectedPatient={selectedPatient} onSelect={(p) => { setSelectedPatient(p); setFormData({...formData, paciente_id: p.id}); }} />
                      </div>
                      <div className="p-8 rounded-[2rem] bg-slate-50 border border-slate-100 flex flex-col items-center text-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center">
                          <span className="material-symbols-outlined text-primary text-3xl">person_search</span>
                        </div>
                        <p className="text-slate-500 font-medium text-sm leading-relaxed">
                          Buscá al paciente por su nombre para vincularlo a la nueva cita. Si es nuevo, recordá registrarlo primero en la sección de pacientes.
                        </p>
                      </div>
                    </div>
                  )}

                  {step === 2 && (
                    <div className="space-y-8">
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Fecha de la Cita</label>
                          <div className="relative">
                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg">calendar_today</span>
                            <input type="date" value={formData.fecha} onChange={(e) => setFormData({...formData, fecha: e.target.value})} className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium outline-none focus:ring-4 focus:ring-primary/10 transition-all" />
                          </div>
                        </div>
                        <div className="space-y-3">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Horario</label>
                          <div className="relative">
                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg">schedule</span>
                            <input type="time" value={formData.hora} onChange={(e) => setFormData({...formData, hora: e.target.value})} className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium outline-none focus:ring-4 focus:ring-primary/10 transition-all" />
                          </div>
                        </div>
                      </div>
                      
                      <CustomSelect 
                        label="Dentista Responsable"
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
                    <div className="space-y-8">
                      <CustomSelect 
                        label="Motivo de la Consulta"
                        options={motivos}
                        value={formData.motivo_id}
                        onChange={(val) => setFormData({...formData, motivo_id: val})}
                        placeholder="Elegir Motivo..."
                        icon="info"
                        searchPlaceholder="Filtrar motivos..."
                      />

                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Observaciones / Notas Medicas</label>
                        <textarea value={formData.notas_medicas} onChange={(e) => setFormData({...formData, notas_medicas: e.target.value})} rows="4" placeholder="Algún detalle relevante para el doctor..."
                          className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium outline-none focus:ring-4 focus:ring-primary/10 transition-all resize-none" />
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Navigation Footer */}
            <div className="px-10 py-8 shrink-0 flex justify-between gap-4 border-t border-slate-50">
              {step > 1 ? (
                <button onClick={() => {setDirection(-1); setStep(s => s-1);}} className="px-8 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-[0.15em] text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg">west</span> Anterior
                </button>
              ) : <div />}
              
              {step < 3 ? (
                <button onClick={() => {setDirection(1); setStep(s => s+1);}} disabled={step === 1 && !formData.paciente_id} 
                  className="bg-primary text-white px-10 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-[0.15em] shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2">
                  Siguiente <span className="material-symbols-outlined text-lg">east</span>
                </button>
              ) : (
                <button onClick={handleSubmit} disabled={isSubmitting || !formData.motivo_id} 
                  className="bg-[#10B981] text-white px-12 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-[0.15em] shadow-xl shadow-[#10B981]/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2">
                  {isSubmitting && <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-4 h-4 border-2 border-white border-t-transparent rounded-full" />}
                  Confirmar Cita <span className="material-symbols-outlined text-lg">task_alt</span>
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
