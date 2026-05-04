import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';

const AppointmentDetailModal = ({ isOpen, onClose, appointment, onEdit, onStatusChange }) => {
  const { t } = useTranslation();

  if (!appointment) return null;

  const date = new Date(appointment.fecha_hora);
  const statusColors = {
    programada: 'bg-blue-100 text-blue-700 border-blue-200',
    completada: 'bg-green-100 text-green-700 border-green-200',
    cancelada: 'bg-red-100 text-red-700 border-red-200',
    noshow: 'bg-amber-100 text-amber-700 border-amber-200',
  };

  const statusColor = statusColors[appointment.estado] || 'bg-slate-100 text-slate-700 border-slate-200';

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl relative overflow-hidden flex flex-col">
            
            {/* Header */}
            <div className="px-8 pt-8 pb-6 border-b border-slate-50">
              <div className="flex justify-between items-start">
                <div className="text-left">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${statusColor} mb-3 inline-block`}>
                    {t(`appointments.status.${appointment.estado}`)}
                  </span>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                    {appointment.pacientes?.nombre} {appointment.pacientes?.apellido}
                  </h3>
                  <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">
                    {appointment.motivos_consulta?.nombre || 'Consulta General'}
                  </p>
                </div>
                <button onClick={onClose} className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-8 space-y-8 overflow-y-auto max-h-[60vh] custom-scrollbar">
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-1 text-left">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block ml-1">{t('appointments.modal.date')}</label>
                  <div className="flex items-center gap-2 text-slate-700 font-bold">
                    <span className="material-symbols-outlined text-primary">calendar_today</span>
                    {date.toLocaleDateString(undefined, { day: '2-digit', month: 'long', year: 'numeric' })}
                  </div>
                </div>
                <div className="space-y-1 text-left">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block ml-1">{t('appointments.modal.time')}</label>
                  <div className="flex items-center gap-2 text-slate-700 font-bold">
                    <span className="material-symbols-outlined text-primary">schedule</span>
                    {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-1 text-left">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block ml-1">{t('appointments.modal.dentist')}</label>
                  <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined">medical_services</span>
                    </div>
                    <span className="font-bold text-slate-700">{appointment.perfiles?.nombre_completo || 'No asignado'}</span>
                  </div>
                </div>

                <div className="space-y-1 text-left">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block ml-1">Costo de la Cita</label>
                  <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-green-500">
                      <span className="material-symbols-outlined">payments</span>
                    </div>
                    <span className="font-black text-slate-900 text-lg">${new Intl.NumberFormat('es-AR').format(appointment.costo || 0)}</span>
                  </div>
                </div>

                {appointment.notas_medicas && (
                  <div className="space-y-1 text-left">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block ml-1">{t('appointments.modal.notes')}</label>
                    <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 text-sm text-slate-600 font-medium leading-relaxed italic">
                      "{appointment.notas_medicas}"
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-8 border-t border-slate-50 bg-slate-50/50 flex justify-between gap-4">
              <div className="flex gap-2">
                {appointment.estado === 'programada' && (
                  <>
                    <button onClick={() => { onStatusChange('completada'); onClose(); }}
                      className="w-12 h-12 flex items-center justify-center bg-white text-green-500 hover:text-green-600 rounded-2xl shadow-sm border border-slate-100 hover:scale-105 active:scale-95 transition-all">
                      <span className="material-symbols-outlined">check_circle</span>
                    </button>
                    <button onClick={() => { onStatusChange('cancelada'); onClose(); }}
                      className="w-12 h-12 flex items-center justify-center bg-white text-red-500 hover:text-red-600 rounded-2xl shadow-sm border border-slate-100 hover:scale-105 active:scale-95 transition-all">
                      <span className="material-symbols-outlined">cancel</span>
                    </button>
                  </>
                )}
              </div>
              
              <button onClick={() => { onEdit(); onClose(); }}
                className="flex-1 bg-primary text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-lg">edit</span>
                {t('common.actions.edit')}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AppointmentDetailModal;
