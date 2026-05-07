import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import PatientModal from '../components/PatientModal';
import ConfirmModal from '../components/ConfirmModal';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../components/ToastContext';

const Patients = () => {
  const { t } = useTranslation();
  const { addToast } = useToast();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientToDelete, setPatientToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showInactive, setShowInactive] = useState(false);
  const [userRole, setUserRole] = useState(null);

  const FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/manage-patients`;

  const fetchPatients = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Get user role
      const { data: profile } = await supabase
        .from('perfiles')
        .select('roles(nombre)')
        .eq('id', session.user.id)
        .single();
      
      setUserRole(profile?.roles?.nombre);

      const response = await fetch(`${FUNCTION_URL}?all=true`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch patients');
      }
      
      const data = await response.json();
      setPatients(data || []);
    } catch (error) {
      console.error("Error fetching patients:", error);
      addToast(error.message || t('patients.modal.error'), 'error');
    } finally {
      setLoading(false);
    }
  }, [FUNCTION_URL, t, addToast]);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  const filteredPatients = useMemo(() => {
    return patients.filter(p => {
      const nombre = (p.nombre || '').toLowerCase();
      const apellido = (p.apellido || '').toLowerCase();
      const documento = (p.documento_id || '').toLowerCase();
      const search = searchTerm.toLowerCase();
      
      const matchesSearch = nombre.includes(search) || apellido.includes(search) || documento.includes(search);
      
      // Lógica de inactivos refinada:
      // Si showInactive es true: mostramos solo los que están desactivados (activo es false, 0 o "false")
      // Si showInactive es false: mostramos los activos (activo es true, null o undefined)
      const isActuallyInactive = p.activo === false || p.activo === 0 || p.activo === 'false';
      const matchesStatus = showInactive ? isActuallyInactive : !isActuallyInactive;
      
      return matchesSearch && matchesStatus;
    });
  }, [patients, searchTerm, showInactive]);

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

      if (!response.ok) {
        const errorData = await response.json();
        // Si el error es por la columna faltante, el mensaje será claro
        throw new Error(errorData.error || 'Failed to save patient');
      }
      
      addToast(selectedPatient ? t('patients.modal.success_update') : t('patients.modal.success_create'), 'success');
      setIsModalOpen(false);
      await fetchPatients();
    } catch (error) {
      console.error("Error saving patient:", error);
      addToast(error.message, 'error');
      throw error;
    }
  };

  const confirmDelete = (patient) => {
    setPatientToDelete(patient);
    setIsConfirmOpen(true);
  };

  const handleDeletePatient = async () => {
    if (!patientToDelete) return;
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch(`${FUNCTION_URL}?id=${patientToDelete.id}`, {
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
    } finally {
      setPatientToDelete(null);
      setIsConfirmOpen(false);
    }
  };

  const handleReactivatePatient = async (patient) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch(`${FUNCTION_URL}?id=${patient.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({ activo: true })
      });

      if (!response.ok) throw new Error('Failed to reactivate patient');
      
      addToast(t('patients.modal.success_reactivate'), 'success');
      await fetchPatients();
    } catch (error) {
      console.error("Error reactivating patient:", error);
      addToast(t('patients.modal.error'), 'error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-0">
      <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="max-w-2xl text-left">
          <h2 className="text-3xl lg:text-4xl font-extrabold font-headline tracking-tight text-slate-900 mb-2">{t('patients.title')}</h2>
          <p className="text-slate-500 font-medium leading-relaxed">{t('patients.subtitle')}</p>
        </div>
        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
            <input 
              type="text" 
              placeholder={t('patients.search_placeholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-100 rounded-2xl text-sm focus:ring-4 focus:ring-primary/5 outline-none font-medium shadow-sm transition-all"
            />
          </div>
          {userRole !== 'ORTODONCISTA' && (
            <button 
              onClick={() => { setSelectedPatient(null); setIsModalOpen(true); }}
              className="bg-primary text-white px-6 py-3 rounded-2xl font-black text-sm shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-lg">add_circle</span>
              {t('patients.new_patient')}
            </button>
          )}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="col-span-1 lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between px-2 mb-2">
            <div className="flex items-center gap-4">
              <label className="relative inline-flex items-center cursor-pointer scale-90">
                <input type="checkbox" checked={showInactive} onChange={(e) => setShowInactive(e.target.checked)} className="sr-only peer" />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('patients.show_inactive')}</span>
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-300 text-right">
              {filteredPatients.length} {t('patients.title').toLowerCase()}
            </p>
          </div>

          <div className="hidden sm:grid grid-cols-12 px-6 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
            <div className="col-span-5 text-left">{t('patients.table.identity')}</div>
            <div className="col-span-3 text-left">{t('patients.table.phone')}</div>
            <div className="col-span-3 text-left">{t('patients.table.status')}</div>
            <div className="col-span-1 text-right">{t('patients.table.action')}</div>
          </div>

          <div className="flex flex-col gap-3 min-h-[400px]">
            {loading ? (
              <div className="flex-1 flex items-center justify-center">
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full" />
              </div>
            ) : filteredPatients.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-300 gap-4 py-20 bg-white rounded-[2rem] border border-dashed border-slate-100">
                <span className="material-symbols-outlined text-6xl opacity-20">person_search</span>
                <p className="font-bold italic text-slate-400 text-sm">
                  {showInactive ? "No hay pacientes inactivos en esta clínica." : "No se encontraron pacientes activos."}
                </p>
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                {filteredPatients.map((patient) => (
                  <PatientCard 
                    key={patient.id}
                    name={`${patient.nombre} ${patient.apellido}`} 
                    initials={`${(patient.nombre || ' ')[0]}${(patient.apellido || ' ')[0]}`}
                    phone={patient.telefono || '---'} 
                    lastVisit={patient.actualizado_en ? new Date(patient.actualizado_en).toLocaleDateString() : 'N/A'}
                    status={patient.activo !== false ? t('patients.status.new') : t('patients.status.inactive')} 
                    statusColor={patient.activo !== false ? "bg-blue-100 text-blue-700" : "bg-red-50 text-red-600"}
                    active={patient.activo !== false}
                    onEdit={() => { setSelectedPatient(patient); setIsModalOpen(true); }}
                    onDelete={() => confirmDelete(patient)}
                    onReactivate={() => handleReactivatePatient(patient)}
                  />
                ))}
              </AnimatePresence>
            )}
          </div>
        </div>

        <div className="col-span-1 lg:col-span-4 space-y-6">
          <div className="bg-gradient-to-br from-primary to-blue-500 p-8 rounded-[2.5rem] text-white shadow-xl shadow-primary/20 relative overflow-hidden border border-primary/5">
            <div className="relative z-10 text-left">
              <p className="text-[10px] uppercase tracking-[0.2em] font-black opacity-70 mb-2">{t('patients.pulse.title')}</p>
              <h3 className="text-3xl font-black mb-6 tracking-tight">{t('patients.pulse.flow')}</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-sm font-medium opacity-80">{t('patients.pulse.today')}</p>
                    <p className="text-3xl font-black">{patients.filter(p => p.activo !== false).length}</p>
                  </div>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 1 }} className="bg-white h-full rounded-full" />
                </div>
              </div>
            </div>
            <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-[140px] opacity-10">groups</span>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 text-left">
            <div className="flex items-center justify-between mb-8">
              <h4 className="font-bold text-slate-900 tracking-tight">{t('patients.activity')}</h4>
              <span className="material-symbols-outlined text-primary">history</span>
            </div>
            <ul className="space-y-6 text-sm">
              {patients.filter(p => p.actualizado_en).sort((a, b) => new Date(b.actualizado_en) - new Date(a.actualizado_en)).slice(0, 5).map(p => (
                <li key={p.id} className="flex items-center gap-4">
                  <div className={`w-2 h-2 rounded-full ${p.activo !== false ? 'bg-primary' : 'bg-red-400'}`} />
                  <div>
                    <p className={`font-bold text-xs ${p.activo !== false ? 'text-slate-700' : 'text-slate-400'}`}>{p.nombre} {p.apellido}</p>
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest text-left">
                      {new Date(p.actualizado_en).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} — {p.activo !== false ? 'Actualizado' : 'Eliminado'}
                    </p>
                  </div>
                </li>
              ))}
              {patients.length === 0 && <p className="text-slate-400 italic text-xs">No hay actividad reciente.</p>}
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

      <ConfirmModal 
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleDeletePatient}
        title={t('common.confirm_delete_title')}
        message={t('common.confirm_delete_message')}
      />
    </div>
  );
};

const PatientCard = ({ initials, name, lastVisit, phone, status, statusColor, active, onEdit, onDelete, onReactivate }) => {
  const { t } = useTranslation();
  return (
    <motion.div layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
      className={`grid grid-cols-1 sm:grid-cols-12 items-center bg-white p-4 sm:p-6 rounded-2xl hover:shadow-[0px_20px_40px_rgba(0,97,164,0.06)] transition-all duration-300 border border-slate-50 group ${!active ? 'opacity-75 bg-red-50/20' : ''}`}>
      <div className="col-span-1 sm:col-span-5 flex items-center gap-4 mb-3 sm:mb-0">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm ring-1 ring-slate-100 group-hover:ring-primary/20 transition-all ${active ? 'bg-slate-50 text-primary' : 'bg-red-50 text-red-400'}`}>
          {initials}
        </div>
        <div className="text-left">
          <h4 className={`font-bold tracking-tight text-sm sm:text-base ${active ? 'text-slate-900' : 'text-slate-500 italic'}`}>{name}</h4>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-0.5 text-left">Act: {lastVisit}</p>
        </div>
      </div>
      <div className="col-span-1 sm:col-span-3 font-medium text-sm text-slate-500 mb-2 sm:mb-0 text-left">
        <span className="sm:hidden font-black text-[10px] uppercase tracking-widest mr-2 text-slate-400">Tel:</span>
        {phone}
      </div>
      <div className="col-span-1 sm:col-span-3 mb-3 sm:mb-0 text-left">
        <span className={`px-3 py-1 text-[10px] font-black rounded-full uppercase tracking-widest ${statusColor}`}>{status}</span>
      </div>
      <div className="col-span-1 flex justify-end gap-2 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
        {active ? (
          <>
            <button onClick={onEdit} className="w-10 h-10 sm:w-8 sm:h-8 flex items-center justify-center text-slate-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all cursor-pointer bg-slate-50 sm:bg-transparent"><span className="material-symbols-outlined text-lg">edit</span></button>
            <button onClick={onDelete} className="w-10 h-10 sm:w-8 sm:h-8 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all cursor-pointer bg-slate-50 sm:bg-transparent"><span className="material-symbols-outlined text-lg">delete</span></button>
          </>
        ) : (
          <button onClick={onReactivate} className="px-4 py-2 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2 shadow-lg shadow-primary/20 cursor-pointer">
            <span className="material-symbols-outlined text-sm">restart_alt</span> {t('common.reactivate')}
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default Patients;
