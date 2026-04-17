import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import AppointmentModal from '../components/AppointmentModal';
import { motion, AnimatePresence } from 'framer-motion';

const Appointments = () => {
  const { t } = useTranslation();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'calendar'
  const [currentDate, setCurrentDate] = useState(new Date());

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
      if (!response.ok) throw new Error('Failed to fetch appointments');
      const data = await response.json();
      setAppointments(data);
    } catch (error) {
      console.error("Error fetching appointments:", error);
    } finally {
      setLoading(false);
    }
  }, [FUNCTION_URL]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

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
      
      await fetchAppointments();
    } catch (error) {
      console.error("Error saving appointment:", error);
      throw error;
    }
  };

  const handleDeleteAppointment = async (id) => {
    if (!window.confirm(t('common.actions.delete') + '?')) return;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      await fetch(`${FUNCTION_URL}?id=${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
        }
      });
      await fetchAppointments();
    } catch (error) {
      console.error("Error deleting appointment:", error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'programada': return 'bg-blue-100 text-blue-700';
      case 'completada': return 'bg-green-100 text-green-700';
      case 'cancelada': return 'bg-red-100 text-red-700';
      case 'noshow': return 'bg-amber-100 text-amber-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-0">
      <header className="mb-10 flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div className="max-w-2xl">
          <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900 mb-2">{t('appointments.title')}</h2>
          <p className="text-slate-500 font-medium leading-relaxed">{t('appointments.subtitle')}</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          {/* View Toggle */}
          <div className="bg-slate-100 p-1.5 rounded-2xl flex items-center gap-1 shrink-0">
            <button 
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${viewMode === 'list' ? 'bg-white text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <span className="material-symbols-outlined text-lg">list</span> Lista
            </button>
            <button 
              onClick={() => setViewMode('calendar')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${viewMode === 'calendar' ? 'bg-white text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <span className="material-symbols-outlined text-lg">calendar_view_month</span> Calendario
            </button>
          </div>

          <button 
            onClick={() => { setSelectedAppointment(null); setIsModalOpen(true); }}
            className="bg-primary text-white px-6 py-3 rounded-2xl font-black text-sm shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2 cursor-pointer ml-auto"
          >
            <span className="material-symbols-outlined text-lg">add_circle</span>
            {t('appointments.new_appointment')}
          </button>
        </div>
      </header>

      <div className="min-h-[600px] relative">
        <AnimatePresence mode="wait">
          {viewMode === 'list' ? (
            <motion.div 
              key="list-view"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-4"
            >
              <div className="hidden sm:grid grid-cols-12 px-6 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                <div className="col-span-4">Paciente</div>
                <div className="col-span-3">Fecha y Hora</div>
                <div className="col-span-2">Dentista</div>
                <div className="col-span-2">Estado</div>
                <div className="col-span-1 text-right">Acciones</div>
              </div>

              {loading ? (
                <div className="flex-1 flex items-center justify-center py-20">
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full" />
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {appointments.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-300 gap-4 py-20">
                      <span className="material-symbols-outlined text-6xl">calendar_month</span>
                      <p className="font-medium italic text-slate-400">No hay citas programadas.</p>
                    </div>
                  ) : (
                    appointments.map((apt) => (
                      <AppointmentCard 
                        key={apt.id}
                        appointment={apt}
                        statusColor={getStatusColor(apt.estado)}
                        onEdit={() => { setSelectedAppointment(apt); setIsModalOpen(true); }}
                        onDelete={() => handleDeleteAppointment(apt.id)}
                      />
                    ))
                  )}
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div 
              key="calendar-view"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <CalendarView 
                appointments={appointments} 
                currentDate={currentDate} 
                setCurrentDate={setCurrentDate}
                onAppointmentClick={(apt) => { setSelectedAppointment(apt); setIsModalOpen(true); }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AppointmentModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleSaveAppointment}
        appointment={selectedAppointment}
      />
    </div>
  );
};

const CalendarView = ({ appointments, currentDate, setCurrentDate, onAppointmentClick }) => {
  const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
  const days = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

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

  const getAppointmentsForDay = (day) => {
    if (!day) return [];
    return appointments.filter(apt => {
      const aptDate = new Date(apt.fecha_hora);
      return aptDate.getDate() === day && aptDate.getMonth() === month && aptDate.getFullYear() === year;
    });
  };

  return (
    <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden flex flex-col h-[700px]">
      <div className="px-10 py-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
        <div>
          <h3 className="text-2xl font-black text-slate-900 tracking-tight">{monthNames[month]} {year}</h3>
          <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-1">Navegación Mensual</p>
        </div>
        <div className="flex gap-2">
          <button onClick={prevMonth} className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-primary hover:bg-white rounded-xl transition-all shadow-sm border border-slate-100">
            <span className="material-symbols-outlined">chevron_left</span>
          </button>
          <button onClick={() => setCurrentDate(new Date())} className="px-4 py-2 bg-white text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-slate-100 shadow-sm hover:bg-slate-50 transition-all">Hoy</button>
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

      <div className="flex-1 grid grid-cols-7 grid-rows-6 overflow-hidden">
        {calendarDays.map((day, idx) => {
          const dayAppointments = getAppointmentsForDay(day);
          const isToday = day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear();
          
          return (
            <div key={idx} className={`p-2 border-r border-b border-slate-50 min-h-0 flex flex-col gap-1 hover:bg-slate-50/50 transition-all ${idx % 7 === 6 ? 'border-r-0' : ''}`}>
              {day && (
                <>
                  <div className="flex justify-between items-center px-2 py-1 mb-1">
                    <span className={`text-xs font-black ${isToday ? 'bg-primary text-white w-6 h-6 rounded-full flex items-center justify-center shadow-lg shadow-primary/20' : 'text-slate-400'}`}>
                      {day}
                    </span>
                    {dayAppointments.length > 0 && <span className="w-1.5 h-1.5 bg-primary rounded-full" />}
                  </div>
                  <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col gap-1">
                    {dayAppointments.slice(0, 3).map(apt => (
                      <button 
                        key={apt.id} 
                        onClick={() => onAppointmentClick(apt)}
                        className="text-[9px] font-bold p-1.5 bg-primary/5 text-primary rounded-lg text-left truncate hover:bg-primary hover:text-white transition-all border border-primary/5"
                      >
                        {new Date(apt.fecha_hora).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} {apt.pacientes?.nombre}
                      </button>
                    ))}
                    {dayAppointments.length > 3 && (
                      <p className="text-[8px] font-black text-slate-300 text-center uppercase tracking-widest mt-1">+{dayAppointments.length - 3} más</p>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const AppointmentCard = ({ appointment, statusColor, onEdit, onDelete }) => {
  const { t } = useTranslation();
  const date = new Date(appointment.fecha_hora);
  return (
    <motion.div layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
      className="grid grid-cols-1 sm:grid-cols-12 items-center bg-white p-4 sm:p-6 rounded-2xl hover:shadow-[0px_20px_40px_rgba(0,97,164,0.06)] transition-all duration-300 border border-slate-50 group">
      <div className="col-span-1 sm:col-span-4 flex items-center gap-4 mb-3 sm:mb-0">
        <div className="w-10 h-10 rounded-xl bg-slate-50 text-primary flex items-center justify-center font-black text-xs ring-1 ring-slate-100 group-hover:ring-primary/20 transition-all">
          {appointment.pacientes?.nombre[0]}{appointment.pacientes?.apellido[0]}
        </div>
        <div>
          <h4 className="font-bold text-slate-900 tracking-tight text-sm sm:text-base">{appointment.pacientes?.nombre} {appointment.pacientes?.apellido}</h4>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-0.5">{appointment.motivos_consulta?.nombre || 'Consulta'}</p>
        </div>
      </div>
      <div className="col-span-1 sm:col-span-3 mb-2 sm:mb-0 flex flex-col">
        <span className="text-sm font-bold text-slate-700">{date.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}</span>
        <span className="text-xs font-medium text-slate-400">{date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</span>
      </div>
      <div className="col-span-1 sm:col-span-2 mb-2 sm:mb-0 text-sm font-medium text-slate-600">{appointment.perfiles?.nombre_completo || 'Cualquier Dentista'}</div>
      <div className="col-span-1 sm:col-span-2 mb-3 sm:mb-0">
        <span className={`px-3 py-1 text-[10px] font-black rounded-full uppercase tracking-widest ${statusColor}`}>{t(`appointments.status.${appointment.estado}`)}</span>
      </div>
      <div className="col-span-1 flex justify-end gap-2 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
        <button onClick={onEdit} className="w-10 h-10 sm:w-8 sm:h-8 flex items-center justify-center text-slate-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all cursor-pointer bg-slate-50 sm:bg-transparent"><span className="material-symbols-outlined text-lg">edit</span></button>
        <button onClick={onDelete} className="w-10 h-10 sm:w-8 sm:h-8 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all cursor-pointer bg-slate-50 sm:bg-transparent"><span className="material-symbols-outlined text-lg">delete</span></button>
      </div>
    </motion.div>
  );
};

export default Appointments;
