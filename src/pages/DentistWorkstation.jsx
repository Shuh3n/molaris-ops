import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../components/ToastContext';
import { format, isSameDay } from 'date-fns';
import { es, enUS } from 'date-fns/locale';

const DentistWorkstation = () => {
  const { t, i18n } = useTranslation();
  const { addToast } = useToast();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApt, setSelectedApt] = useState(null);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const locale = i18n.language === 'es' ? es : enUS;

  useEffect(() => {
    const fetchMyAppointments = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        // Traer citas de HOY para este dentista
        const { data, error } = await supabase
          .from('citas')
          .select(`
            *,
            pacientes (*),
            estados_cita!inner (nombre)
          `)
          .eq('dentista_id', session.user.id)
          .eq('estados_cita.nombre', 'programada')
          .order('fecha_hora', { ascending: true });

        if (error) throw error;

        // Filtrar solo las de hoy en el cliente por precisión horaria
        const todayApts = (data || []).filter(a => isSameDay(new Date(a.fecha_hora), new Date()));
        setAppointments(todayApts);

      } catch (error) {
        console.error("Error fetching dentist appointments:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMyAppointments();
  }, []);

  const handleOpenNotes = (apt) => {
    setSelectedApt(apt);
    setNotes(apt.notas_medicas || '');
  };

  const handleSaveNotes = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('citas')
        .update({ notas_medicas: notes })
        .eq('id', selectedApt.id);

      if (error) throw error;
      
      addToast('Notas médicas guardadas', 'success');
      setAppointments(prev => prev.map(a => a.id === selectedApt.id ? { ...a, notas_medicas: notes } : a));
      setSelectedApt(null);
    } catch (error) {
      console.error("Error saving notes:", error);
      addToast('Error al guardar notas', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto text-left">
      <header className="mb-10">
        <p className="text-primary font-black tracking-[0.2em] text-[10px] uppercase mb-2 ml-1">Estación de Trabajo</p>
        <h2 className="text-3xl lg:text-4xl font-black tracking-tight text-slate-900">Agenda de Hoy</h2>
        <p className="text-slate-500 font-medium italic opacity-70">
          {format(new Date(), 'PPPP', { locale })}
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Appointments List */}
        <div className="lg:col-span-7 space-y-4">
          {loading ? (
             <div className="py-20 flex justify-center">
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full" />
             </div>
          ) : appointments.length === 0 ? (
            <div className="p-20 bg-white rounded-[2.5rem] border border-dashed border-slate-200 text-center">
              <span className="material-symbols-outlined text-4xl text-slate-200 mb-4">event_available</span>
              <p className="text-slate-400 font-bold text-sm italic">No tienes pacientes programados para hoy.</p>
            </div>
          ) : (
            appointments.map(apt => (
              <div key={apt.id} className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex items-center justify-between group hover:shadow-md transition-all">
                <div className="flex items-center gap-6">
                  <div className="text-center min-w-[60px]">
                    <p className="text-lg font-black text-slate-900">{format(new Date(apt.fecha_hora), 'HH:mm')}</p>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Hora</p>
                  </div>
                  <div className="h-10 w-[1px] bg-slate-100" />
                  <div>
                    <h4 className="font-black text-slate-900 tracking-tight">{apt.pacientes?.nombre} {apt.pacientes?.apellido}</h4>
                    <p className="text-xs text-slate-500 font-medium">{apt.pacientes?.email || 'Sin correo'}</p>
                  </div>
                </div>
                <button 
                  onClick={() => handleOpenNotes(apt)}
                  className="px-6 py-3 bg-slate-50 text-slate-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-primary hover:text-white transition-all flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-lg">edit_note</span>
                  Atender
                </button>
              </div>
            ))
          )}
        </div>

        {/* Selected Patient Quick Info Sidebar */}
        <div className="lg:col-span-5 space-y-6">
           <AnimatePresence mode="wait">
             {selectedApt ? (
               <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 p-8 sticky top-6">
                 <div className="flex items-center gap-4 mb-8">
                    <div className="w-14 h-14 rounded-2xl bg-blue-50 text-primary flex items-center justify-center font-black text-lg">
                      {selectedApt.pacientes?.nombre[0]}{selectedApt.pacientes?.apellido[0]}
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-slate-900">{selectedApt.pacientes?.nombre} {selectedApt.pacientes?.apellido}</h3>
                      <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Paciente en consulta</p>
                    </div>
                 </div>

                 <div className="space-y-6 mb-8">
                    <div className="bg-red-50 p-4 rounded-2xl border border-red-100">
                      <p className="text-[9px] font-black uppercase text-red-400 tracking-widest mb-1">Alergias / Antecedentes</p>
                      <p className="text-xs font-bold text-red-600 leading-relaxed">
                        {selectedApt.pacientes?.alergias || 'Ninguna registrada.'}
                      </p>
                    </div>
                    
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Notas Clínicas del Tratamiento</label>
                      <textarea 
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows="8" 
                        placeholder="Describe el procedimiento realizado hoy..."
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium outline-none focus:ring-4 focus:ring-primary/10 transition-all resize-none"
                      />
                    </div>
                 </div>

                 <div className="flex gap-3">
                   <button onClick={() => setSelectedApt(null)} className="flex-1 px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-all">Cancelar</button>
                   <button 
                    onClick={handleSaveNotes}
                    disabled={saving}
                    className="flex-[2] bg-primary text-white px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                   >
                     {saving && <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-4 h-4 border-2 border-white border-t-transparent rounded-full" />}
                     Finalizar Notas
                   </button>
                 </div>
               </motion.div>
             ) : (
               <div className="bg-slate-50 rounded-[2.5rem] border border-dashed border-slate-200 p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
                  <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-sm mb-6">
                    <span className="material-symbols-outlined text-4xl text-slate-200">clinical_notes</span>
                  </div>
                  <h4 className="text-slate-900 font-black text-lg mb-2">Editor Clínico</h4>
                  <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-[200px]">Selecciona un paciente de la lista para comenzar la atención y registrar notas.</p>
               </div>
             )}
           </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default DentistWorkstation;
