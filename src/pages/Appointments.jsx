import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import AppointmentModal from '../components/AppointmentModal';
import AppointmentDetailModal from '../components/AppointmentDetailModal';
import ConfirmModal from '../components/ConfirmModal';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../components/ToastContext';
import { isSameDay, isWithinInterval, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';

const Appointments = () => {
  const { t, i18n } = useTranslation();
  const { addToast } = useToast();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [viewMode, setViewMode] = useState('list');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [filterType, setFilterType] = useState('all');

  const [confirmConfig, setConfirmConfig] = useState({ isOpen: false, id: null, status: null, type: 'info' });

  const FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/manage-appointments`;

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch(FUNCTION_URL, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
        }
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to fetch appointments');
      }
      const data = await response.json();
      setAppointments(data);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      addToast(t('appointments.modal.error'), 'error');
    } finally {
      setLoading(false);
    }
  }, [FUNCTION_URL, t, addToast]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const filteredAppointments = useMemo(() => {
    const today = new Date();
    return appointments.filter(apt => {
      const aptDate = new Date(apt.fecha_hora);
      if (filterType === 'today') return isSameDay(aptDate, today);
      if (filterType === 'week') return isWithinInterval(aptDate, { start: startOfWeek(today), end: endOfWeek(today) });
      if (filterType === 'month') return isWithinInterval(aptDate, { start: startOfMonth(today), end: endOfMonth(today) });
      return true;
    });
  }, [appointments, filterType]);

  const triggerStatusChange = (id, newStatus) => {
    const type = newStatus === 'completada' ? 'info' : 'danger';
    setConfirmConfig({ isOpen: true, id, status: newStatus, type });
  };

  const handleUpdateStatus = async () => {
    const { id, status } = confirmConfig;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch(`${FUNCTION_URL}?id=${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({ estado: status })
      });
      if (!response.ok) throw new Error('Failed to update status');
      addToast(t('patients.modal.success_update'), 'success');
      await fetchAppointments();
    } catch (error) {
      console.error("Error updating status:", error);
      addToast(t('patients.modal.error'), 'error');
    } finally {
      setConfirmConfig({ isOpen: false, id: null, status: null, type: 'info' });
    }
  };

  const handleSaveAppointment = async (formData) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const method = selectedAppointment ? 'PUT' : 'POST';
      const url = selectedAppointment ? `${FUNCTION_URL}?id=${selectedAppointment.id}` : FUNCTION_URL;

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Failed to save appointment');
      addToast(t('patients.modal.success_update'), 'success');
      await fetchAppointments();
    } catch (error) {
      console.error("Error saving appointment:", error);
      addToast(t('patients.modal.error'), 'error');
      throw error;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'programada':  return { bg: 'bg-blue-50 text-blue-700 border border-blue-100',   icon: 'calendar_clock' };
      case 'confirmada':  return { bg: 'bg-emerald-50 text-emerald-700 border border-emerald-100', icon: 'check_circle' };
      case 'completada':  return { bg: 'bg-green-50 text-green-700 border border-green-100',   icon: 'task_alt' };
      case 'cancelada':   return { bg: 'bg-red-50 text-red-600 border border-red-100',         icon: 'cancel' };
      case 'noshow':      return { bg: 'bg-amber-50 text-amber-700 border border-amber-100',   icon: 'event_busy' };
      default:            return { bg: 'bg-slate-100 text-slate-600 border border-slate-200',  icon: 'help' };
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-0">
      <header className="mb-10 flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div className="max-w-2xl text-left">
          <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900 mb-2">{t('appointments.title')}</h2>
          <p className="text-slate-500 font-medium leading-relaxed">{t('appointments.subtitle')}</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <div className="bg-slate-100 p-1.5 rounded-2xl flex items-center gap-1 shrink-0">
            <button onClick={() => setViewMode('list')} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'list' ? 'bg-white text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
              <span className="material-symbols-outlined text-lg">list</span> {i18n.language === 'es' ? 'Lista' : 'List'}
            </button>
            <button onClick={() => setViewMode('calendar')} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'calendar' ? 'bg-white text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
              <span className="material-symbols-outlined text-lg">calendar_view_month</span> {i18n.language === 'es' ? 'Calendario' : 'Calendar'}
            </button>
          </div>

          <button onClick={() => { setSelectedAppointment(null); setIsModalOpen(true); }}
            className="bg-primary text-white px-6 py-3 rounded-2xl font-black text-sm shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2 cursor-pointer ml-auto">
            <span className="material-symbols-outlined text-lg">add_circle</span>
            {t('appointments.new_appointment')}
          </button>
        </div>
      </header>

      <div className="min-h-[600px] relative">
        {viewMode === 'list' && (
          <div className="flex flex-wrap gap-2 mb-6">
            {['all', 'today', 'week', 'month'].map((type) => (
              <button key={type} onClick={() => setFilterType(type)}
                className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${filterType === type ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' : 'bg-white text-slate-400 border-slate-100 hover:border-primary/30 hover:text-primary'}`}>
                {t(`appointments.filters.${type}`)}
              </button>
            ))}
          </div>
        )}

        <AnimatePresence mode="wait">
          {viewMode === 'list' ? (
            <motion.div key="list-view" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-4">
              <div className="hidden sm:grid grid-cols-12 px-6 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                <div className="col-span-4 text-left">{t('appointments.table.patient')}</div>
                <div className="col-span-3 text-left">{t('appointments.table.date')}</div>
                <div className="col-span-2 text-left">{t('appointments.table.dentist')}</div>
                <div className="col-span-2 text-left">{t('appointments.table.status')}</div>
                <div className="col-span-1 text-right">{t('appointments.table.actions')}</div>
              </div>

              {loading ? (
                <div className="flex-1 flex items-center justify-center py-20">
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full" />
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {filteredAppointments.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-300 gap-4 py-20 bg-white rounded-[2rem] border border-dashed border-slate-100">
                      <span className="material-symbols-outlined text-6xl opacity-20">calendar_month</span>
                      <p className="font-bold italic text-slate-400 text-sm">No hay citas para este periodo.</p>
                    </div>
                  ) : (
                    filteredAppointments.map((apt) => (
                      <AppointmentCard 
                        key={apt.id}
                        appointment={apt}
                        statusInfo={getStatusColor(apt.estado)}
                        onView={() => { setSelectedAppointment(apt); setIsDetailOpen(true); }}
                        onEdit={() => { setSelectedAppointment(apt); setIsModalOpen(true); }}
                        onStatusChange={(status) => triggerStatusChange(apt.id, status)}
                      />
                    ))
                  )}
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div key="calendar-view" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <CalendarView appointments={appointments} currentDate={currentDate} setCurrentDate={setCurrentDate} onAppointmentClick={(apt) => { setSelectedAppointment(apt); setIsDetailOpen(true); }} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AppointmentModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveAppointment} appointment={selectedAppointment} />
      
      <AppointmentDetailModal 
        isOpen={isDetailOpen} 
        onClose={() => setIsDetailOpen(false)} 
        appointment={selectedAppointment} 
        onEdit={() => setIsModalOpen(true)}
        onStatusChange={(status) => triggerStatusChange(selectedAppointment.id, status)}
      />

      <ConfirmModal 
        isOpen={confirmConfig.isOpen}
        onClose={() => setConfirmConfig({ ...confirmConfig, isOpen: false })}
        onConfirm={handleUpdateStatus}
        type={confirmConfig.type}
        title={confirmConfig.status === 'completada' ? '¿Completar Cita?' : '¿Cancelar Cita?'}
        message={confirmConfig.status === 'completada' 
          ? '¿Estás seguro de que deseas marcar esta cita como completada?' 
          : '¿Estás seguro de que deseas cancelar esta cita? Esta acción no se puede deshacer.'}
        confirmText={confirmConfig.status === 'completada' ? 'Sí, completar' : 'Sí, cancelar'}
      />
    </div>
  );
};

const AppointmentCard = ({ appointment, statusInfo, onView, onEdit, onStatusChange }) => {
  const { t } = useTranslation();
  const date = new Date(appointment.fecha_hora);
  const estado = appointment.estado || 'programada';
  const { bg, icon } = statusInfo || { bg: 'bg-slate-100 text-slate-600 border border-slate-200', icon: 'help' };
  return (
    <motion.div layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
      className="grid grid-cols-1 sm:grid-cols-12 items-center bg-white p-4 sm:p-6 rounded-2xl hover:shadow-[0px_20px_40px_rgba(0,97,164,0.06)] transition-all duration-300 border border-slate-50 group">
      <div className="col-span-1 sm:col-span-4 flex items-center gap-4 mb-3 sm:mb-0">
        <div className={`w-12 h-12 rounded-2xl bg-slate-50 text-primary flex items-center justify-center font-black text-sm ring-1 ring-slate-100 group-hover:ring-primary/20 transition-all`}>
          {appointment.pacientes?.nombre[0]}{appointment.pacientes?.apellido[0]}
        </div>
        <div className="text-left">
          <h4 className="font-bold text-slate-900 tracking-tight text-sm sm:text-base">{appointment.pacientes?.nombre} {appointment.pacientes?.apellido}</h4>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-0.5">{appointment.motivos_consulta?.nombre || 'Consulta'}</p>
        </div>
      </div>
      <div className="col-span-1 sm:col-span-3 mb-2 sm:mb-0 flex flex-col text-left">
        <span className="text-sm font-bold text-slate-700">{date.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}</span>
        <span className="text-xs font-medium text-slate-400">{date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</span>
      </div>
      <div className="col-span-1 sm:col-span-2 mb-2 sm:mb-0 text-sm font-medium text-slate-600 text-left">{appointment.perfiles?.nombre_completo || 'Cualquier Dentista'}</div>
      <div className="col-span-1 sm:col-span-2 mb-3 sm:mb-0 text-left">
        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${bg}`}>
          <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>{icon}</span>
          {t(`appointments.status.${estado}`, { defaultValue: estado })}
        </span>
      </div>
      <div className="col-span-1 flex justify-end gap-2 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
        <button onClick={onView} className="w-10 h-10 sm:w-8 sm:h-8 flex items-center justify-center text-slate-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all cursor-pointer bg-slate-50 sm:bg-transparent shadow-sm border border-slate-50" title="Ver Detalles"><span className="material-symbols-outlined text-lg">visibility</span></button>
        {appointment.estado === 'programada' && (
          <>
            <button onClick={() => onStatusChange('completada')} className="w-8 h-8 flex items-center justify-center text-green-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all cursor-pointer shadow-sm border border-slate-50" title="Completar"><span className="material-symbols-outlined text-lg">check_circle</span></button>
            <button onClick={() => onStatusChange('cancelada')} className="w-8 h-8 flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all cursor-pointer shadow-sm border border-slate-50" title="Cancelar"><span className="material-symbols-outlined text-lg">cancel</span></button>
          </>
        )}
        <button onClick={onEdit} className="w-10 h-10 sm:w-8 sm:h-8 flex items-center justify-center text-slate-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all cursor-pointer bg-slate-50 sm:bg-transparent shadow-sm border border-slate-50" title="Editar"><span className="material-symbols-outlined text-lg">edit</span></button>
      </div>
    </motion.div>
  );
};

const CalendarView = ({ appointments, currentDate, setCurrentDate, onAppointmentClick }) => {
  const { i18n, t } = useTranslation();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const monthNames = i18n.language === 'es' ? 
    ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"] :
    ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const days = i18n.language === 'es' ? ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"] : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const calendarDays = [];
  for (let i = 0; i < firstDay; i++) calendarDays.push(null);
  for (let i = 1; i <= daysInMonth; i++) calendarDays.push(i);
  // Pad to 42 to keep the grid stable
  while (calendarDays.length < 42) calendarDays.push(null);

  const getAppointmentsForDay = (day) => {
    if (!day) return [];
    return appointments.filter(apt => {
      const aptDate = new Date(apt.fecha_hora);
      return aptDate.getDate() === day && aptDate.getMonth() === month && aptDate.getFullYear() === year;
    }).sort((a, b) => new Date(a.fecha_hora) - new Date(b.fecha_hora));
  };

  if (isMobile) {
    return (
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden flex flex-col">
        <div className="px-6 py-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
          <div className="text-left">
            <h3 className="text-xl font-black text-slate-900 tracking-tight">{monthNames[month]} {year}</h3>
          </div>
          <div className="flex gap-1">
            <button onClick={prevMonth} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-primary bg-white rounded-lg shadow-sm border border-slate-100">
              <span className="material-symbols-outlined text-sm">chevron_left</span>
            </button>
            <button onClick={nextMonth} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-primary bg-white rounded-lg shadow-sm border border-slate-100">
              <span className="material-symbols-outlined text-sm">chevron_right</span>
            </button>
          </div>
        </div>
        <div className="p-4 space-y-4">
          {calendarDays.filter(d => d !== null).map(day => {
            const dayApts = getAppointmentsForDay(day);
            if (dayApts.length === 0) return null;
            return (
              <div key={day} className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/5 px-2 py-1 rounded-lg">
                    {day} {monthNames[month].slice(0, 3)}
                  </span>
                  <div className="h-px bg-slate-100 flex-1"></div>
                </div>
                <div className="space-y-1">
                  {dayApts.map(apt => (
                    <button key={apt.id} onClick={() => onAppointmentClick(apt)}
                      className="w-full flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 text-left active:scale-[0.98] transition-all">
                      <div>
                        <p className="text-xs font-bold text-slate-900">{apt.pacientes?.nombre} {apt.pacientes?.apellido}</p>
                        <p className="text-[10px] text-slate-400 font-medium">{apt.motivos_consulta?.nombre || 'Consulta'}</p>
                      </div>
                      <span className="text-[10px] font-black text-primary">
                        {new Date(apt.fecha_hora).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
          {calendarDays.filter(d => d !== null && getAppointmentsForDay(d).length > 0).length === 0 && (
            <div className="py-10 text-center text-slate-300">
              <span className="material-symbols-outlined text-4xl mb-2 opacity-20">event_busy</span>
              <p className="text-sm italic font-medium">No hay citas en este mes</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden flex flex-col min-h-[850px]">
      <div className="px-10 py-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
        <div className="text-left">
          <h3 className="text-2xl font-black text-slate-900 tracking-tight">{monthNames[month]} {year}</h3>
          <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-1">
            {i18n.language === 'es' ? 'Navegación Mensual' : 'Monthly Navigation'}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={prevMonth} className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-primary hover:bg-white rounded-xl transition-all shadow-sm border border-slate-100">
            <span className="material-symbols-outlined">chevron_left</span>
          </button>
          <button onClick={() => setCurrentDate(new Date())} className="px-4 py-2 bg-white text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-slate-100 shadow-sm hover:bg-slate-50 transition-all">
            {i18n.language === 'es' ? 'Hoy' : 'Today'}
          </button>
          <button onClick={nextMonth} className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-primary hover:bg-white rounded-xl transition-all shadow-sm border border-slate-100">
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 border-b border-slate-50">
        {days.map(d => (
          <div key={d} className="p-4 text-[10px] font-black text-slate-400 uppercase text-center border-r border-slate-100 last:border-r-0">{d}</div>
        ))}
      </div>

      <div className="flex-1 grid grid-cols-7 auto-rows-min overflow-hidden">
        {calendarDays.map((day, idx) => {
          const dayAppointments = getAppointmentsForDay(day);
          const hasPending = dayAppointments.some(apt => apt.estado === 'programada');
          const isToday = day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear();
          
          return (
            <div key={idx} className={`p-1 sm:p-2 border-r border-b border-slate-50 flex flex-col gap-1 hover:bg-slate-50/30 transition-all ${idx % 7 === 6 ? 'border-r-0' : ''} ${hasPending ? 'min-h-[120px] sm:min-h-[160px]' : 'min-h-[40px] sm:min-h-[60px]'}`}>
              {day && (
                <>
                  <div className="flex justify-between items-center px-2 py-0.5 mb-0.5">
                    <span className={`text-[10px] sm:text-xs font-black ${isToday ? 'bg-primary text-white w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center shadow-lg shadow-primary/20' : 'text-slate-400'}`}>
                      {day}
                    </span>
                    {dayAppointments.length > 0 && <span className="text-[9px] font-black text-slate-300 bg-slate-100 px-1.5 rounded-md">{dayAppointments.length}</span>}
                  </div>
                  {hasPending && (
                    <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col gap-1.5 pb-2">
                      {dayAppointments.map(apt => (
                        <button key={apt.id} onClick={() => onAppointmentClick(apt)}
                          className={`text-[10px] font-bold p-2 rounded-xl text-left truncate transition-all border shadow-sm ${
                            apt.estado === 'completada' ? 'bg-green-50 text-green-700 border-green-100 opacity-60' :
                            apt.estado === 'cancelada' ? 'bg-red-50 text-red-700 border-red-100 opacity-60' :
                            'bg-white text-slate-700 border-slate-100 hover:border-primary hover:text-primary'
                          }`}>
                          <div className="flex items-center justify-between mb-0.5">
                            <span className="opacity-60 text-[9px]">{new Date(apt.fecha_hora).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            <span className="material-symbols-outlined text-[10px]">visibility</span>
                          </div>
                          <div className="truncate">{apt.pacientes?.nombre} {apt.pacientes?.apellido}</div>
                        </button>
                      ))}
                    </div>
                  )}
                  {!hasPending && dayAppointments.length > 0 && (
                    <div className="flex flex-wrap gap-0.5 px-1 pb-1">
                      {dayAppointments.map(apt => (
                        <div key={apt.id} className={`w-1.5 h-1.5 rounded-full ${
                          apt.estado === 'completada' ? 'bg-green-400' :
                          apt.estado === 'cancelada' ? 'bg-red-400' :
                          'bg-primary'
                        }`} title={apt.pacientes?.nombre} />
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Appointments;
