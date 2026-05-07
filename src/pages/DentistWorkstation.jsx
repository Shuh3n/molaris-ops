import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { useToast } from '../components/ToastContext';
import { 
  format, 
  isSameDay, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  addMonths, 
  subMonths,
  isToday,
  isSameMonth,
  addDays,
  subDays,
  parseISO,
  isSameWeek,
  addWeeks,
  subWeeks,
  startOfDay,
  endOfDay
} from 'date-fns';
import { TZDate } from '@date-fns/tz';
import { es, enUS } from 'date-fns/locale';

const BOGOTA_TZ = 'America/Bogota';

const DentistWorkstation = () => {
  const { t, i18n } = useTranslation();
  const { addToast } = useToast();
  const [viewMode, setViewMode] = useState('today'); // 'today', 'weekly', 'monthly'
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApt, setSelectedApt] = useState(null);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [currentDate, setCurrentDate] = useState(() => new TZDate(new Date(), BOGOTA_TZ));

  const locale = i18n.language === 'es' ? es : enUS;

  useEffect(() => {
    fetchAppointments();
  }, [currentDate, viewMode]);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      let start, end;
      if (viewMode === 'today') {
        start = startOfDay(currentDate);
        end = endOfDay(currentDate);
      } else if (viewMode === 'weekly') {
        start = startOfWeek(currentDate, { weekStartsOn: 1 });
        end = endOfWeek(currentDate, { weekStartsOn: 1 });
      } else {
        start = startOfMonth(currentDate);
        end = endOfMonth(currentDate);
      }

      const { data, error } = await supabase
        .from('citas')
        .select(`
          *,
          pacientes (*),
          estados_cita!inner (nombre)
        `)
        .eq('dentista_id', session.user.id)
        .gte('fecha_hora', start.toISOString())
        .lte('fecha_hora', end.toISOString())
        .order('fecha_hora', { ascending: true });

      if (error) throw error;
      setAppointments(data || []);
    } catch (error) {
      console.error("Error fetching dentist appointments:", error);
      addToast(t('dentist.error_loading'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const todayAppointments = useMemo(() => {
    return appointments.filter(a => isSameDay(new TZDate(parseISO(a.fecha_hora), BOGOTA_TZ), currentDate));
  }, [appointments, currentDate]);

  const stats = useMemo(() => {
    const nowBogota = new TZDate(new Date(), BOGOTA_TZ);
    const today = appointments.filter(a => isSameDay(new TZDate(parseISO(a.fecha_hora), BOGOTA_TZ), nowBogota));
    return {
      total: today.length,
      pending: today.filter(a => a.estados_cita.nombre === 'programada' || a.estados_cita.nombre === 'confirmada').length,
      completed: today.filter(a => a.estados_cita.nombre === 'completada').length
    };
  }, [appointments]);

  const nextPatient = useMemo(() => {
    const nowBogota = new TZDate(new Date(), BOGOTA_TZ);
    return todayAppointments
      .filter(a => new TZDate(parseISO(a.fecha_hora), BOGOTA_TZ) > nowBogota && (a.estados_cita.nombre === 'programada' || a.estados_cita.nombre === 'confirmada'))
      .sort((a, b) => parseISO(a.fecha_hora).getTime() - parseISO(b.fecha_hora).getTime())[0];
  }, [todayAppointments]);

  const handleOpenNotes = (apt) => {
    setSelectedApt(apt);
    setNotes(apt.notas_medicas || '');
  };

  const handleSaveNotes = async () => {
    setSaving(true);
    try {
      const { data: estadoData } = await supabase.from('estados_cita').select('id').eq('nombre', 'completada').single();
      
      const { error } = await supabase
        .from('citas')
        .update({ notas_medicas: notes, estado_id: estadoData.id })
        .eq('id', selectedApt.id);

      if (error) throw error;
      
      addToast(t('dentist.notes_saved'), 'success');
      setAppointments(prev => prev.map(a => a.id === selectedApt.id ? { ...a, notas_medicas: notes, estados_cita: { nombre: 'completada' } } : a));
      setSelectedApt(null);
    } catch (error) {
      console.error("Error saving notes:", error);
      addToast(t('dentist.error_saving'), 'error');
    } finally {
      setSaving(false);
    }
  };

  const navigateDate = (direction) => {
    if (viewMode === 'today') {
      setCurrentDate(prev => direction === 'next' ? addDays(prev, 1) : subDays(prev, 1));
    } else if (viewMode === 'weekly') {
      setCurrentDate(prev => direction === 'next' ? addWeeks(prev, 1) : subWeeks(prev, 1));
    } else {
      setCurrentDate(prev => direction === 'next' ? addMonths(prev, 1) : subMonths(prev, 1));
    }
  };

  const handleGoToToday = () => {
    setCurrentDate(toZonedTime(new Date(), BOGOTA_TZ));
  };

  return (
    <div className="max-w-7xl mx-auto text-left pb-20 overflow-hidden">
      <LayoutGroup>
        {/* Navigation & View Switcher */}
        <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-12">
          <div className="flex items-center gap-6">
            <h2 className="text-4xl font-black tracking-tight text-slate-900 min-w-[240px]">
              {viewMode === 'today' ? (isToday(currentDate) ? t('dentist.tabs.today') : format(currentDate, 'd MMMM', { locale })) : 
               viewMode === 'weekly' ? `${t('dentist.tabs.week')} ${format(startOfWeek(currentDate, { weekStartsOn: 1 }), 'd')} - ${format(endOfWeek(currentDate, { weekStartsOn: 1 }), 'd MMMM', { locale })}` :
               format(currentDate, 'MMMM yyyy', { locale })}
            </h2>
            <div className="flex items-center bg-white border border-slate-100 rounded-2xl p-1 shadow-sm">
               <button onClick={() => navigateDate('prev')} className="p-3 hover:bg-slate-50 rounded-xl text-slate-400 hover:text-primary transition-all">
                  <span className="material-symbols-outlined text-xl">chevron_left</span>
               </button>
               <button onClick={() => setCurrentDate(new Date())} className="px-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-primary transition-all">
                 {t('dentist.today_btn')}
               </button>
               <button onClick={() => navigateDate('next')} className="p-3 hover:bg-slate-50 rounded-xl text-slate-400 hover:text-primary transition-all">
                  <span className="material-symbols-outlined text-xl">chevron_right</span>
               </button>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-100/50 p-1.5 rounded-[1.5rem] self-start lg:self-center">
            {['today', 'weekly', 'monthly'].map(mode => (
              <button 
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`relative px-8 py-3 rounded-[1rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all z-10 ${viewMode === mode ? 'text-white' : 'text-slate-400 hover:text-slate-600'}`}
              >
                {t(`dentist.tabs.${mode}`)}
                {viewMode === mode && (
                  <motion.div 
                    layoutId="activeTab"
                    className="absolute inset-0 bg-primary rounded-[1rem] shadow-xl shadow-primary/30 -z-10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </button>
            ))}
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Main View Area */}
          <div className="lg:col-span-8 space-y-10 order-2 lg:order-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={viewMode + currentDate.toISOString()}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4, ease: "circOut" }}
              >
                {viewMode === 'today' && (
                  <div className="space-y-10">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                      <StatCard label={t('dentist.stats.total_today')} value={stats.total} icon="event_note" color="blue" />
                      <StatCard label={t('dentist.stats.pending')} value={stats.pending} icon="pending_actions" color="orange" />
                      <StatCard label={t('dentist.stats.completed')} value={stats.completed} icon="task_alt" color="green" />
                    </div>

                    {nextPatient && isToday(currentDate) && (
                      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-slate-900 rounded-[2rem] sm:rounded-[3rem] p-6 sm:p-10 text-white relative overflow-hidden group shadow-2xl shadow-slate-900/30">
                        <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:scale-125 transition-transform duration-1000 hidden sm:block">
                          <span className="material-symbols-outlined text-[10rem]">medical_information</span>
                        </div>
                        <div className="relative z-10 space-y-6 sm:space-y-8">
                          <div className="flex items-center gap-4">
                            <span className="px-5 py-2 bg-primary/20 text-primary border border-primary/30 rounded-full text-[10px] font-black uppercase tracking-widest">{t('dentist.next_patient')}</span>
                            <div className="h-1.5 w-1.5 rounded-full bg-primary animate-ping" />
                            <span className="text-slate-400 text-sm font-bold tracking-tight">{format(parseISO(nextPatient.fecha_hora), 'HH:mm')}</span>
                          </div>
                          <h3 className="text-3xl sm:text-5xl font-black tracking-tight leading-none">{nextPatient.pacientes?.nombre} {nextPatient.pacientes?.apellido}</h3>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-6 sm:gap-10 pt-6 sm:pt-8 border-t border-white/10">
                            <div>
                              <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1">{t('dentist.reason')}</p>
                              <p className="text-lg font-bold text-white uppercase italic tracking-tight">{nextPatient.motivo_nombre || 'Consulta General'}</p>
                            </div>
                            <button 
                              onClick={() => handleOpenNotes(nextPatient)}
                              className="w-full sm:w-auto sm:ml-auto bg-primary text-white px-10 py-5 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] hover:bg-white hover:text-slate-900 transition-all shadow-2xl shadow-primary/20 active:scale-95"
                            >
                              {t('dentist.treat_now')}
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    <div className="space-y-4">
                      <h3 className="text-2xl font-black text-slate-900 tracking-tight ml-2">
                        {isToday(currentDate) ? t('dentist.remaining_agenda') : t('dentist.agenda_list')}
                      </h3>
                      {loading ? (
                        <div className="py-20 flex justify-center">
                           <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full" />
                        </div>
                      ) : todayAppointments.length === 0 ? (
                        <div className="p-24 bg-white rounded-[3.5rem] border border-dashed border-slate-100 text-center shadow-sm">
                          <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                            <span className="material-symbols-outlined text-4xl text-slate-200">event_available</span>
                          </div>
                          <p className="text-slate-400 font-bold text-sm italic">{t('dentist.no_appointments')}</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {todayAppointments.map(apt => (
                            <AppointmentCard 
                              key={apt.id} 
                              apt={apt} 
                              isActive={selectedApt?.id === apt.id}
                              onAction={() => handleOpenNotes(apt)}
                              t={t}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {viewMode === 'weekly' && (
                  <div className="space-y-8">
                    {loading ? (
                       <div className="py-40 flex justify-center"><motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full" /></div>
                    ) : (
                      <div className="grid grid-cols-1 gap-4">
                        {eachDayOfInterval({
                          start: startOfWeek(currentDate, { weekStartsOn: 1 }),
                          end: endOfWeek(currentDate, { weekStartsOn: 1 })
                        }).map(day => {
                          const dayApts = appointments.filter(a => isSameDay(parseISO(a.fecha_hora), day));
                          return (
                            <div key={day.toString()} className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm hover:shadow-md transition-all group">
                               <div className="flex items-center justify-between mb-6">
                                  <div className="flex items-center gap-4">
                                     <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm shadow-sm transition-all ${isToday(day) ? 'bg-primary text-white shadow-primary/20 scale-110' : 'bg-slate-50 text-slate-400 group-hover:bg-slate-100'}`}>
                                        {format(day, 'd')}
                                     </div>
                                     <h4 className={`text-xl font-black uppercase tracking-tight ${isToday(day) ? 'text-primary' : 'text-slate-900'}`}>{format(day, 'EEEE', { locale })}</h4>
                                  </div>
                                  <span className="text-[10px] font-black uppercase text-slate-300 tracking-[0.2em]">{dayApts.length} {t('dentist.stats.total_today').toLowerCase()}</span>
                               </div>
                               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {dayApts.length === 0 ? (
                                    <p className="text-xs font-bold text-slate-300 italic py-2 ml-4">Sin actividades.</p>
                                  ) : dayApts.map(a => (
                                    <div key={a.id} className="flex items-center gap-4 p-4 bg-slate-50/50 rounded-2xl border border-transparent hover:border-slate-100 hover:bg-white transition-all cursor-pointer" onClick={() => handleOpenNotes(a)}>
                                       <span className="text-xs font-black text-primary min-w-[40px]">{format(parseISO(a.fecha_hora), 'HH:mm')}</span>
                                       <span className="text-sm font-bold text-slate-900 truncate">{a.pacientes?.nombre}</span>
                                       <span className={`ml-auto w-2 h-2 rounded-full ${a.estados_cita.nombre === 'completada' ? 'bg-green-500' : 'bg-primary/30'}`} />
                                    </div>
                                  ))}
                               </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {viewMode === 'monthly' && (
                  <CalendarGrid 
                    currentMonth={currentDate} 
                    appointments={appointments} 
                    selectedDate={currentDate}
                    onSelectDate={setCurrentDate}
                    locale={locale}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Clinical Editor Sidebar */}
          <div className="lg:col-span-4 sticky top-12">
            <ClinicalEditor 
              selectedApt={selectedApt} 
              notes={notes} 
              setNotes={setNotes} 
              onCancel={() => setSelectedApt(null)} 
              onSave={handleSaveNotes}
              saving={saving}
              t={t}
            />
          </div>
        </div>
      </LayoutGroup>
    </div>
  );
};

/* --- Sub-Components --- */

const StatCard = ({ label, value, icon, color }) => {
  const colors = {
    blue: "text-blue-600 bg-blue-50/50",
    orange: "text-orange-600 bg-orange-50/50",
    green: "text-green-600 bg-green-50/50"
  };
  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-6 group hover:shadow-xl hover:border-primary/10 transition-all duration-500">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 ${colors[color]}`}>
        <span className="material-symbols-outlined text-3xl">{icon}</span>
      </div>
      <div className="text-left">
        <p className="text-3xl font-black text-slate-900 tracking-tighter leading-none mb-1">{value}</p>
        <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">{label}</p>
      </div>
    </div>
  );
};

const AppointmentCard = ({ apt, isActive, onAction, t }) => (
  <motion.div 
    layout
    className={`p-6 sm:p-8 rounded-[2.5rem] border transition-all duration-700 flex flex-col sm:flex-row sm:items-center justify-between gap-6 group ${isActive ? 'bg-primary/5 border-primary/30 shadow-2xl' : 'bg-white border-slate-100 hover:border-primary/20 shadow-sm hover:shadow-xl'}`}
  >
    <div className="flex items-center gap-8">
      <div className="text-center min-w-[70px]">
        <p className="text-2xl font-black text-slate-900 tracking-tighter">{format(parseISO(apt.fecha_hora), 'HH:mm')}</p>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('dentist.time')}</p>
      </div>
      <div className="h-12 w-[1px] bg-slate-100" />
      <div className="text-left">
        <h4 className="text-xl font-black text-slate-900 tracking-tight leading-tight group-hover:text-primary transition-colors">{apt.pacientes?.nombre} {apt.pacientes?.apellido}</h4>
        <div className="flex items-center gap-3 mt-2">
          <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm ${apt.estados_cita.nombre === 'completada' ? 'bg-green-100 text-green-600' : 'bg-primary/10 text-primary'}`}>
            {t(`appointments.status.${apt.estados_cita.nombre}`)}
          </span>
          <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">ID: {apt.pacientes?.documento_id}</p>
        </div>
      </div>
    </div>
    <button 
      onClick={onAction}
      className={`px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 active:scale-95 ${apt.estados_cita.nombre === 'completada' ? 'bg-slate-100 text-slate-400' : 'bg-slate-900 text-white hover:bg-primary shadow-xl shadow-slate-900/10'}`}
    >
      <span className="material-symbols-outlined text-xl">{apt.estados_cita.nombre === 'completada' ? 'history_edu' : 'edit_square'}</span>
      {apt.estados_cita.nombre === 'completada' ? t('dentist.view_notes') : t('dentist.treat')}
    </button>
  </motion.div>
);

const ClinicalEditor = ({ selectedApt, notes, setNotes, onCancel, onSave, saving, t }) => (
  <AnimatePresence mode="wait">
    {selectedApt ? (
      <motion.div 
        key="editor"
        initial={{ opacity: 0, y: 20, scale: 0.95 }} 
        animate={{ opacity: 1, y: 0, scale: 1 }} 
        exit={{ opacity: 0, y: 20, scale: 0.95 }} 
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="bg-white rounded-[2rem] sm:rounded-[3rem] shadow-[0_32px_80px_rgba(0,0,0,0.1)] border border-slate-100 p-6 sm:p-10 relative overflow-hidden group"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-[5rem] -z-10 group-hover:scale-110 transition-transform duration-700" />
        
        <div className="flex items-center gap-4 sm:gap-6 mb-8 sm:mb-10">
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-[1.2rem] sm:rounded-[1.8rem] bg-primary text-white flex items-center justify-center font-black text-lg sm:text-xl shadow-xl shadow-primary/30 shrink-0">
            {selectedApt.pacientes?.nombre[0]}{selectedApt.pacientes?.apellido[0]}
          </div>
          <div className="text-left min-w-0">
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-none mb-2 truncate">
              {selectedApt.pacientes?.nombre} {selectedApt.pacientes?.apellido}
            </h3>
            <p className="text-[9px] sm:text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">
              {selectedApt.estados_cita.nombre === 'completada' ? t('dentist.visit_finished') : t('dentist.in_progress')}
            </p>
          </div>
        </div>

        <div className="space-y-6 sm:space-y-8 mb-8 sm:mb-10 text-left">
          <div className="bg-red-50 p-4 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] border border-red-100/50 shadow-sm relative overflow-hidden group/alert">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover/alert:scale-125 transition-all hidden sm:block">
              <span className="material-symbols-outlined text-4xl text-red-400">medical_services</span>
            </div>
            <p className="text-[9px] sm:text-[10px] font-black uppercase text-red-400 tracking-[0.2em] mb-2 sm:mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">error_outline</span> {t('patients.modal.allergies')}
            </p>
            <p className="text-xs sm:text-sm font-bold text-red-600 leading-relaxed">
              {selectedApt.pacientes?.alergias || t('dentist.no_records')}
            </p>
          </div>
          
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between px-2">
              <label className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">{t('dentist.clinical_notes')}</label>
              <span className="text-[9px] sm:text-[10px] font-black text-primary/40 uppercase">{notes.length} {t('dentist.chars')}</span>
            </div>
            <textarea 
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows="8" 
              readOnly={selectedApt.estados_cita.nombre === 'completada'}
              placeholder={t('dentist.describe_procedure')}
              className="w-full px-6 sm:px-8 py-4 sm:py-6 bg-slate-50 border border-slate-100 rounded-[1.5rem] sm:rounded-[2.5rem] text-sm font-medium outline-none focus:ring-8 focus:ring-primary/5 focus:bg-white focus:border-primary/20 transition-all resize-none no-scrollbar shadow-inner"
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <button 
            onClick={onCancel} 
            className="order-2 sm:order-1 flex-1 px-8 py-4 sm:py-5 rounded-xl sm:rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] text-slate-400 hover:bg-slate-100 transition-all"
          >
            {t('common.actions.cancel')}
          </button>
          {selectedApt.estados_cita.nombre !== 'completada' && (
            <button 
              onClick={onSave}
              disabled={saving}
              className="order-1 sm:order-2 flex-[2] bg-primary text-white px-8 py-4 sm:py-5 rounded-xl sm:rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 group/btn disabled:opacity-50"
            >
              {saving ? (
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
              ) : (
                <span className="material-symbols-outlined text-xl group-hover/btn:translate-x-1 transition-transform">send</span>
              )}
              {t('dentist.finish_notes')}
            </button>
          )}
        </div>
      </motion.div>
    ) : (
      <div className="bg-slate-50 rounded-[2.5rem] sm:rounded-[3.5rem] border-2 border-dashed border-slate-200 p-10 sm:p-16 text-center flex flex-col items-center justify-center min-h-[400px] sm:min-h-[600px] group">
        <div className="w-20 h-20 sm:w-32 sm:h-32 bg-white rounded-[1.5rem] sm:rounded-[2.5rem] flex items-center justify-center shadow-sm mb-6 sm:mb-10 group-hover:scale-110 transition-transform duration-700">
          <span className="material-symbols-outlined text-4xl sm:text-6xl text-slate-100">clinical_notes</span>
        </div>
        <h4 className="text-slate-900 font-black text-xl sm:text-2xl mb-3 sm:mb-4 tracking-tight uppercase">{t('dentist.edit_clinico')}</h4>
        <p className="text-slate-400 text-xs sm:text-sm font-bold leading-relaxed max-w-[240px] sm:max-w-[280px] italic opacity-60">{t('dentist.select_patient')}</p>
      </div>
    )}
  </AnimatePresence>
);

const CalendarGrid = ({ currentMonth, appointments, selectedDate, onSelectDate, locale }) => {
  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const weekdays = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

  return (
    <div className="bg-white rounded-[3.5rem] shadow-2xl border border-slate-100 overflow-hidden text-left group">
      <div className="grid grid-cols-7 border-b border-slate-50 bg-slate-50/30">
        {weekdays.map(d => (
          <div key={d} className="py-8 text-center text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {days.map((day, idx) => {
          const dayApts = appointments.filter(a => isSameDay(parseISO(a.fecha_hora), day));
          const isSelected = isSameDay(day, selectedDate);
          const isCurrentMonth = isSameMonth(day, currentMonth);

          return (
            <button 
              key={day.toString()}
              onClick={() => onSelectDate(day)}
              className={`min-h-[160px] p-6 border-r border-b border-slate-50 flex flex-col items-end gap-3 transition-all hover:bg-slate-50/50 group/day relative ${!isCurrentMonth ? 'opacity-10 pointer-events-none' : ''} ${isSelected ? 'bg-primary/5' : ''}`}
            >
              <span className={`text-base font-black tracking-tight transition-all duration-500 ${isToday(day) ? 'w-10 h-10 rounded-[1.2rem] bg-primary text-white flex items-center justify-center shadow-xl shadow-primary/20 scale-110' : isSelected ? 'text-primary scale-110' : 'text-slate-300 group-hover/day:text-slate-900'}`}>
                {format(day, 'd')}
              </span>
              
              <div className="mt-auto w-full space-y-1.5">
                {dayApts.slice(0, 3).map(a => (
                  <div key={a.id} className="bg-slate-100/50 rounded-xl px-3 py-1.5 flex items-center gap-2 overflow-hidden border border-transparent hover:border-primary/20 transition-all">
                    <div className={`w-1.5 h-1.5 rounded-full shrink-0 shadow-sm ${a.estados_cita.nombre === 'completada' ? 'bg-green-500' : 'bg-primary'}`} />
                    <span className="text-[10px] font-black text-slate-500 truncate uppercase tracking-tighter">{a.pacientes?.nombre}</span>
                  </div>
                ))}
                {dayApts.length > 3 && (
                  <p className="text-[10px] font-black text-slate-300 text-center uppercase tracking-widest mt-2">+{dayApts.length - 3} más</p>
                )}
              </div>
              
              {isSelected && <motion.div layoutId="dayOutline" className="absolute inset-0 border-2 border-primary/20 rounded-none z-10 pointer-events-none" />}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default DentistWorkstation;
