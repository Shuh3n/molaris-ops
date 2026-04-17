import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import PatientModal from '../components/PatientModal';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../components/ToastContext';

const Patients = () => {
  const { t } = useTranslation();
  const { addToast } = useToast();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);

  const FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/manage-patients`;

  const fetchPatients = useCallback(async () => {
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
      if (!response.ok) throw new Error('Failed to fetch patients');
      const data = await response.json();
      setPatients(data);
    } catch (error) {
      console.error("Error fetching patients:", error);
    } finally {
      setLoading(false);
    }
  }, [FUNCTION_URL]);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  const handleSavePatient = async (formData) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const method = selectedPatient ? 'PUT' : 'POST';
      const url = selectedPatient ? `${FUNCTION_URL}?id=${selectedPatient.id}` : FUNCTION_URL;

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Failed to save patient');
      
      addToast(selectedPatient ? t('patients.modal.success_update') : t('patients.modal.success_create'), 'success');
      await fetchPatients();
    } catch (error) {
      console.error("Error saving patient:", error);
      addToast(t('patients.modal.error'), 'error');
      throw error;
    }
  };

  const handleDeletePatient = async (id) => {
    if (!window.confirm(t('common.actions.delete') + '?')) return;
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch(`${FUNCTION_URL}?id=${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
        }
      });

      if (!response.ok) throw new Error('Failed to delete patient');
      
      addToast(t('patients.modal.success_delete'), 'success');
      await fetchPatients();
    } catch (error) {
      console.error("Error deleting patient:", error);
      addToast(t('patients.modal.error'), 'error');
    }
  };

  const openCreateModal = () => {
    setSelectedPatient(null);
    setIsModalOpen(true);
  };

  const openEditModal = (patient) => {
    setSelectedPatient(patient);
    setIsModalOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-0">
      <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="max-w-2xl">
          <h2 className="text-3xl lg:text-4xl font-extrabold font-headline tracking-tight text-slate-900 mb-2">{t('patients.title')}</h2>
          <p className="text-slate-500 font-medium leading-relaxed">{t('patients.subtitle')}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={openCreateModal}
            className="bg-primary text-white px-6 py-3 rounded-2xl font-black text-sm shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
          >
            <span className="material-symbols-outlined text-lg">add_circle</span>
            {t('patients.new_patient')}
          </button>
          <button className="bg-white text-slate-600 px-5 py-2.5 rounded-xl font-bold text-sm shadow-sm hover:bg-slate-50 transition-colors flex items-center gap-2 border border-slate-100 cursor-pointer">
            <span className="material-symbols-outlined text-lg">filter_list</span> {t('patients.filter')}
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="col-span-1 lg:col-span-8 space-y-4">
          <div className="hidden sm:grid grid-cols-12 px-6 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
            <div className="col-span-5">{t('patients.table.identity')}</div>
            <div className="col-span-3">{t('patients.table.phone')}</div>
            <div className="col-span-3">{t('patients.table.status')}</div>
            <div className="col-span-1 text-right">{t('patients.table.action')}</div>
          </div>

          <div className="flex flex-col gap-3 min-h-[200px] lg:min-h-[400px]">
            {loading ? (
              <div className="flex-1 flex items-center justify-center">
                <motion.div 
                  animate={{ rotate: 360 }} 
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                  className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full"
                />
              </div>
            ) : patients.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-300 gap-4 py-20">
                <span className="material-symbols-outlined text-6xl">person_search</span>
                <p className="font-medium italic text-slate-400">No se encontraron pacientes activos.</p>
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                {patients.map((patient) => (
                  <PatientCard 
                    key={patient.id}
                    name={`${patient.nombre} ${patient.apellido}`} 
                    initials={`${patient.nombre[0]}${patient.apellido[0]}`}
                    phone={patient.telefono || '---'} 
                    lastVisit={patient.creado_en ? new Date(patient.creado_en).toLocaleDateString() : 'N/A'}
                    status={t('patients.status.new')} 
                    statusColor="bg-blue-100 text-blue-700"
                    onEdit={() => openEditModal(patient)}
                    onDelete={() => handleDeletePatient(patient.id)}
                  />
                ))}
              </AnimatePresence>
            )}
          </div>

          <div className="flex justify-between items-center pt-6 px-2">
            <p className="text-xs text-slate-500">Mostrando {patients.length} pacientes activos</p>
          </div>
        </div>

        <div className="col-span-1 lg:col-span-4 space-y-6">
          <div className="bg-gradient-to-br from-primary to-blue-500 p-6 lg:p-8 rounded-[2rem] text-white shadow-xl shadow-primary/20 relative overflow-hidden border border-primary/5">
            <div className="relative z-10">
              <p className="text-[10px] uppercase tracking-[0.2em] font-black opacity-70 mb-2">{t('patients.pulse.title')}</p>
              <h3 className="text-2xl lg:text-3xl font-black mb-6 tracking-tight">{t('patients.pulse.flow')}</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-sm font-medium opacity-80">{t('patients.pulse.today')}</p>
                    <p className="text-2xl font-black">{patients.length} Pacientes</p>
                  </div>
                </div>
                <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 1 }}
                    className="bg-white h-full rounded-full"
                  />
                </div>
              </div>
            </div>
            <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-[120px] opacity-10">groups</span>
          </div>

          <div className="bg-white p-6 lg:p-8 rounded-[2rem] shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-8">
              <h4 className="font-bold text-slate-900 tracking-tight">{t('patients.activity')}</h4>
              <span className="material-symbols-outlined text-primary">history</span>
            </div>
            <ul className="space-y-6 text-sm">
              <p className="text-slate-400 italic text-xs">Próximamente: Historial de actividad en tiempo real.</p>
            </ul>
          </div>
        </div>
      </div>

      <PatientModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleSavePatient}
        patient={selectedPatient}
      />
    </div>
  );
};

const PatientCard = ({ initials, img, name, lastVisit, phone, status, statusColor, active, borderClass, onEdit, onDelete }) => (
  <motion.div 
    layout
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, scale: 0.95 }}
    className={`grid grid-cols-1 sm:grid-cols-12 items-center bg-white p-4 sm:p-6 rounded-2xl hover:shadow-[0px_20px_40px_rgba(0,97,164,0.06)] transition-all duration-300 border border-slate-50 group ${active ? 'border-l-4 border-l-primary' : borderClass || ''}`}
  >
    <div className="col-span-1 sm:col-span-5 flex items-center gap-4 mb-3 sm:mb-0">
      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl overflow-hidden flex items-center justify-center bg-slate-50 text-primary font-black text-sm ring-1 ring-slate-100 group-hover:ring-primary/20 transition-all">
        {img ? <img src={img} alt={name} className="w-full h-full object-cover" /> : initials}
      </div>
      <div>
        <h4 className="font-bold text-slate-900 tracking-tight text-sm sm:text-base">{name}</h4>
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-0.5">Visita: {lastVisit}</p>
      </div>
    </div>
    <div className="col-span-1 sm:col-span-3 font-medium text-sm text-slate-500 mb-2 sm:mb-0">
      <span className="sm:hidden font-black text-[10px] uppercase tracking-widest mr-2 text-slate-400">Tel:</span>
      {phone}
    </div>
    <div className="col-span-1 sm:col-span-3 mb-3 sm:mb-0">
      <span className={`px-3 py-1 text-[10px] font-black rounded-full uppercase tracking-widest ${statusColor}`}>{status}</span>
    </div>
    <div className="col-span-1 flex justify-end gap-2 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
      <button 
        onClick={onEdit}
        className="w-10 h-10 sm:w-8 sm:h-8 flex items-center justify-center text-slate-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all cursor-pointer bg-slate-50 sm:bg-transparent"
      >
        <span className="material-symbols-outlined text-lg">edit</span>
      </button>
      <button 
        onClick={onDelete}
        className="w-10 h-10 sm:w-8 sm:h-8 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all cursor-pointer bg-slate-50 sm:bg-transparent"
      >
        <span className="material-symbols-outlined text-lg">delete</span>
      </button>
    </div>
  </motion.div>
);

export default Patients;
