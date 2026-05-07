import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import ConfirmModal from '../components/ConfirmModal';

const Settings = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [clinicData, setClinicData] = useState(null);
  const [originalClinicData, setOriginalClinicData] = useState(null);
  const [team, setTeam] = useState([]);
  const [isDirty, setIsDirty] = useState(false);
  const [roles, setRoles] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (clinicData && originalClinicData) {
      const dirty = JSON.stringify(clinicData) !== JSON.stringify(originalClinicData);
      setIsDirty(dirty);
    }
  }, [clinicData, originalClinicData]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: profile } = await supabase
        .from('perfiles')
        .select('clinica_id')
        .eq('id', session.user.id)
        .single();

      if (profile?.clinica_id) {
        const { data: clinic, error: clinicError } = await supabase
          .from('clinicas')
          .select('*, licencias(*)')
          .eq('id', profile.clinica_id)
          .single();

        if (clinicError) throw clinicError;

        setClinicData(clinic);
        setOriginalClinicData(clinic);

        const { data: staff } = await supabase
          .from('perfiles')
          .select('id, nombre_completo, email, rol_id, roles(nombre)')
          .eq('clinica_id', profile.clinica_id);
        setTeam(staff || []);

        const { data: rolesData } = await supabase.from('roles').select('*');
        setRoles(rolesData || []);
      }
    } catch (error) {
      console.error('Error fetching management data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (!clinicData || !clinicData.id) {
        throw new Error('No clinic selected');
      }

      const clinicFields = [
        'nombre_consultorio',
        'telefono',
        'telefono_emergencia',
        'horario_apertura',
        'horario_cierre',
        'duracion_turno',
        'tiempo_limpieza',
        'tiempo_sobreturnos',
        'tiempo_wsp',
        'wsp_template',
        'wsp_reminders_enabled',
        'wsp_lead_time',
        'plan_licencia',
        'licencia_id',
        'activa',
        'fecha_vencimiento'
      ];

      const payloadClinica = {};
      clinicFields.forEach((f) => {
        if (clinicData.hasOwnProperty(f)) payloadClinica[f] = clinicData[f];
      });

      const { error: clinicError } = await supabase
        .from('clinicas')
        .update(payloadClinica)
        .eq('id', clinicData.id);

      if (clinicError) throw clinicError;

      if (clinicData.email) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user?.id) {
          const { error: profileError } = await supabase
            .from('perfiles')
            .update({ email: clinicData.email })
            .eq('id', session.user.id);
          if (profileError) throw profileError;
        }
      }

      setOriginalClinicData(clinicData);
      setIsDirty(false);
      alert('Cambios guardados correctamente');
    } catch (error) {
      console.error('Error saving clinic data:', error);
      alert('Error al guardar: ' + (error?.message || error));
    } finally {
      setSaving(false);
    }
  };

  const handleDiscard = () => {
    setClinicData(originalClinicData);
    setIsDirty(false);
  };

  const updateClinicField = (field, value) => {
    setClinicData(prev => ({ ...prev, [field]: value }));
  };

  const tabs = [
    { id: 'clinic', label: t('settings.tabs.clinic'), icon: 'domain', desc: 'Información general de la clínica' },
    { id: 'team', label: t('settings.tabs.team'), icon: 'group', desc: 'Gestionar profesionales y personal' },
    { id: 'agenda', label: t('settings.tabs.agenda'), icon: 'calendar_month', desc: 'Horarios y configuración de turnos' },
    { id: 'whatsapp', label: t('settings.tabs.whatsapp'), icon: 'chat', desc: 'Recordatorios y plantillas' },
  ];

  if (loading) return <div className="p-20 text-center font-bold">Cargando configuración...</div>;

  return (
    <div className="max-w-6xl mx-auto pb-20 px-4">
      {/* Header Section */}
      <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl md:text-4xl font-extrabold font-headline tracking-tight text-on-surface mb-2">
            Gestión de Clínica
          </h2>
          <p className="text-slate-500 text-sm md:text-lg">Configura todos los aspectos de tu consultorio</p>
        </div>
        
        {activeTab !== 'dashboard' && (
          <button 
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-2 px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-sm font-bold transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">grid_view</span>
            Volver al Panel
          </button>
        )}
      </div>

      {/* Content Area */}
      <div className="min-h-[500px]">
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' ? (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6"
            >
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="group bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-primary/10 hover:border-primary/20 transition-all text-left flex flex-col gap-6 cursor-pointer"
                >
                  <div className="w-16 h-16 rounded-2xl bg-slate-50 group-hover:bg-primary/10 flex items-center justify-center transition-colors">
                    <span className="material-symbols-outlined text-3xl text-slate-400 group-hover:text-primary transition-colors">
                      {tab.icon}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900 mb-2 group-hover:text-primary transition-colors">
                      {tab.label}
                    </h3>
                    <p className="text-sm font-medium text-slate-500 leading-relaxed">
                      {tab.desc}
                    </p>
                  </div>
                  <div className="mt-auto pt-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary opacity-0 group-hover:opacity-100 transition-all transform translate-x-[-10px] group-hover:translate-x-0">
                    Configurar <span className="material-symbols-outlined text-sm">east</span>
                  </div>
                </button>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'clinic' && <ClinicTab data={clinicData} update={updateClinicField} t={t} />}
              {activeTab === 'team' && <TeamTab team={team} roles={roles} t={t} refresh={fetchData} license={clinicData?.licencias} clinicId={clinicData?.id} />}
              {activeTab === 'agenda' && <AgendaTab data={clinicData} update={updateClinicField} t={t} />}
              {activeTab === 'whatsapp' && <WhatsAppTab data={clinicData} update={updateClinicField} t={t} />}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Sticky Action Bar */}
      <AnimatePresence>
        {isDirty && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-4xl px-4 z-50"
          >
            <div className="bg-white/80 backdrop-blur-2xl rounded-2xl border border-slate-200 p-4 shadow-[0px_20px_50px_rgba(0,0,0,0.1)] flex items-center justify-between">
              <div className="flex items-center gap-3 ml-4">
                 <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                 <span className="text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-widest">Cambios detectados</span>
              </div>
              <div className="flex gap-2 md:gap-4">
                <button 
                  onClick={handleDiscard}
                  className="px-4 md:px-6 py-2.5 rounded-xl text-xs md:text-sm font-bold text-slate-500 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  {t('settings.actions.discard')}
                </button>
                <button 
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-gradient-to-br from-primary to-blue-500 px-6 md:px-10 py-2.5 rounded-xl text-xs md:text-sm font-bold text-white shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                >
                  {saving ? 'Guardando...' : t('settings.actions.save')}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- SUB-COMPONENTS ---

const FormField = ({ label, value, type = 'text', readOnly, onChange, required }) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black font-label text-slate-400 uppercase tracking-widest">{label}</label>
    <input 
      className={`w-full border-none rounded-xl p-3.5 text-sm font-medium transition-all outline-none ${readOnly ? 'bg-slate-50 text-slate-400 cursor-not-allowed' : 'bg-slate-100 focus:bg-white focus:ring-2 focus:ring-primary/10'}`} 
      type={type} 
      value={value} 
      readOnly={readOnly}
      onChange={(e) => onChange && onChange(e.target.value)}
      required={required}
    />
  </div>
);

const ToggleSwitch = ({ label, desc, checked, onChange }) => (
  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
    <div>
      <div className="text-sm font-bold text-slate-700">{label}</div>
      <div className="text-[10px] text-slate-400">{desc}</div>
    </div>
    <div 
      onClick={() => onChange(!checked)}
      className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${checked ? 'bg-primary' : 'bg-slate-200'}`}
    >
      <div className={`w-4 h-4 bg-white rounded-full transition-transform ${checked ? 'translate-x-6' : ''}`}></div>
    </div>
  </div>
);

const ClinicTab = ({ data, update, t }) => {
  const now = new Date();
  let expirationDate = null;
  
  if (data?.fecha_vencimiento) {
    expirationDate = new Date(data.fecha_vencimiento);
  }
  
  const diffMs = expirationDate ? expirationDate.getTime() - now.getTime() : null;
  const daysRemaining = diffMs != null ? Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24))) : null;
  const isExpired = diffMs != null ? diffMs < 0 : false;

  const formatRemainingHuman = (days) => {
    if (days == null) return '';
    if (days < 14) return t('landing.licenses.remaining_days', { count: days });
    if (days < 60) {
      const weeks = Math.ceil(days / 7);
      return t('landing.licenses.remaining_weeks', { count: weeks });
    }
    const months = Math.ceil(days / 30);
    return t('landing.licenses.remaining_months', { count: months });
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Fila 1: Estado de la Licencia (Ocupa las 2 columnas en ancho total) */}
      <section className="bg-primary/5 rounded-[2.5rem] p-6 md:p-8 border border-primary/10 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
          <span className="material-symbols-outlined text-8xl text-primary">verified_user</span>
        </div>
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
           <div className="flex items-center gap-4 text-left w-full md:w-auto">
              <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-primary">security</span>
              </div>
              <div>
                <h4 className="font-headline font-black text-lg text-primary tracking-tight">Estado de la Licencia</h4>
                <p className="text-2xl font-black text-slate-900 mt-1">
                  {data?.licencias?.nombre ? t(`landing.licenses.plans.${data.licencias.nombre}.name`, { defaultValue: data.licencias.nombre }) : t('settings.license.no_plan')}
                </p>
              </div>
           </div>

           <div className="flex-1 max-w-md w-full">
             <div className="bg-white/60 backdrop-blur-md p-5 rounded-[1.8rem] border border-primary/10 shadow-sm">
                {expirationDate ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                      <span className="text-slate-400">{t('landing.licenses.active_until')}</span>
                      <span className="text-slate-900">{expirationDate.toLocaleDateString()}</span>
                    </div>
                    
                    {!isExpired ? (
                      <div className="space-y-2">
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(100, (daysRemaining / (data?.licencias?.default_period_days || 30)) * 100)}%` }}
                            className={`h-full transition-all duration-1000 ${daysRemaining < 7 ? 'bg-red-500' : 'bg-primary'}`}
                          />
                        </div>
                        <div className="flex justify-between text-[9px] font-black uppercase tracking-tight">
                          <span className={daysRemaining < 7 ? 'text-red-500' : 'text-primary'}>
                            {formatRemainingHuman(daysRemaining)}
                          </span>
                          <span className="text-slate-400 flex items-center gap-1">
                            <span className="material-symbols-outlined text-[12px]">autorenew</span> Renovación activa
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="p-2 bg-red-50 rounded-xl border border-red-100 flex items-center justify-center gap-2">
                        <span className="material-symbols-outlined text-red-500 text-sm">warning</span>
                        <span className="text-red-600 font-black text-[9px] uppercase tracking-widest">{t('settings.license.expired')}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 font-medium italic">{t('settings.license.no_date')}</p>
                )}
             </div>
           </div>

           <div className="shrink-0 w-full md:w-auto">
             <button className="w-full px-8 py-3.5 bg-white hover:bg-slate-50 text-primary border border-primary/20 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm hover:shadow-md active:scale-[0.98]">
                Gestionar Suscripción
             </button>
           </div>
        </div>
      </section>

      {/* Fila 2: Info General (Ocupa las 2 columnas) */}
      <section className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 p-6 md:p-10 border border-slate-100">
        <div className="flex items-center gap-3 mb-8">
          <span className="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-xl">info</span>
          <h3 className="text-xl md:text-2xl font-black font-headline text-slate-900">{t('settings.sections.info')}</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 text-left">
          <FormField 
            label={t('settings.fields.name')} 
            value={data?.nombre_consultorio || ''} 
            onChange={(val) => update('nombre_consultorio', val)}
          />
          <FormField label={t('settings.fields.id')} value={data?.id?.substring(0, 8) || ''} readOnly />
          <div className="md:col-span-2">
            <FormField 
              label={t('settings.fields.email')} 
              value={data?.email || ''} 
              type="email" 
              onChange={(val) => update('email', val)}
            />
          </div>
          <FormField 
            label={t('settings.fields.phone')} 
            value={data?.telefono || ''} 
            onChange={(val) => update('telefono', val)}
          />
          <FormField 
            label={t('settings.fields.emergency')} 
            value={data?.telefono_emergencia || ''} 
            onChange={(val) => update('telefono_emergencia', val)}
          />
        </div>
      </section>
    </div>
  );
};

const TeamTab = ({ team, roles, t, refresh, license, clinicId }) => {
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const drCount = team.filter(m => m.roles?.nombre === 'ORTODONCISTA').length;
  const recCount = team.filter(m => m.roles?.nombre === 'RECEPCIONISTA').length;

  const maxDres = license?.max_dentistas || 1;
  const maxRecs = license?.max_recepcionistas || 1;

  const canInviteDr = drCount < maxDres;
  const canInviteRec = recCount < maxRecs;
  const canInviteAny = canInviteDr || canInviteRec;

  const handleDelete = async () => {
    if (!selectedMember) return;
    setIsDeleting(true);
    try {
      // Borramos de perfiles. Nota: El usuario de Auth sigue existiendo 
      // pero sin perfil no puede entrar a la clínica.
      const { error } = await supabase
        .from('perfiles')
        .delete()
        .eq('id', selectedMember.id)
        .eq('clinica_id', clinicId);

      if (error) throw error;
      refresh && refresh();
    } catch (error) {
      alert('Error al eliminar miembro: ' + (error.message || error));
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
      setSelectedMember(null);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 overflow-hidden border border-slate-100">
      <div className="p-6 md:p-8 flex items-center justify-between border-b border-slate-50 gap-4">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-green-600 bg-green-50 p-2 rounded-lg">badge</span>
          <h3 className="text-lg md:text-xl font-bold font-headline">{t('settings.sections.team_list')}</h3>
          <div className="hidden sm:flex gap-2 ml-4">
             <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${drCount >= maxDres ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-500'}`}>
               Dres: {drCount}/{maxDres}
             </span>
             <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${recCount >= maxRecs ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-500'}`}>
               Rec: {recCount}/{maxRecs}
             </span>
          </div>
        </div>
        <button 
          onClick={() => {
            if (!canInviteAny) {
              setShowLimitModal(true);
            } else {
              setShowInviteModal(true);
            }
          }}
          className="bg-primary text-white px-4 md:px-6 py-2 rounded-xl text-xs md:text-sm font-bold flex items-center gap-2 shadow-lg shadow-primary/20 hover:scale-105 transition-transform cursor-pointer whitespace-nowrap"
        >
          <span className="material-symbols-outlined text-sm">person_add</span>
          {t('settings.access.manage')}
        </button>
      </div>

      <div className="">
        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50">
              <tr>
                <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Miembro</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Email</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Rol</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {team.map((member) => (
                <tr key={member.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-primary group-hover:bg-primary group-hover:text-white transition-all">
                        {member.nombre_completo?.charAt(0) || 'U'}
                      </div>
                      <span className="text-sm font-bold text-slate-700">{member.nombre_completo}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-sm text-slate-500">{member.email}</td>
                  <td className="px-6 py-5">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                      member.roles?.nombre === 'ADMIN_GLOBAL' ? 'bg-purple-100 text-purple-600' :
                      member.roles?.nombre === 'ORTODONCISTA' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {member.roles?.nombre || 'Personal'}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => { setSelectedMember(member); setShowMemberModal(true); }}
                        className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-all cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-lg">edit</span>
                      </button>
                      <button 
                        onClick={() => { setSelectedMember(member); setShowDeleteConfirm(true); }}
                        className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-lg">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden space-y-3 p-4">
          {team.map(member => (
            <div key={member.id} className="bg-white border rounded-xl p-4 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-primary">
                    {member.nombre_completo?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-700">{member.nombre_completo}</div>
                    <div className="text-xs text-slate-500">{member.email}</div>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                  member.roles?.nombre === 'ADMIN_GLOBAL' ? 'bg-purple-100 text-purple-600' :
                  member.roles?.nombre === 'ORTODONCISTA' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500'
                }`}>
                  {member.roles?.nombre || 'Personal'}
                </span>
              </div>
              <div className="flex gap-2 pt-2 border-t border-slate-50">
                <button 
                  onClick={() => { setSelectedMember(member); setShowMemberModal(true); }}
                  className="flex-1 py-2 bg-slate-50 text-slate-600 text-[10px] font-black uppercase tracking-widest rounded-lg"
                >
                  Editar
                </button>
                <button 
                  onClick={() => { setSelectedMember(member); setShowDeleteConfirm(true); }}
                  className="flex-1 py-2 bg-red-50 text-red-500 text-[10px] font-black uppercase tracking-widest rounded-lg"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showInviteModal && (
        <InviteModal 
          onClose={() => setShowInviteModal(false)} 
          roles={roles} 
          onSuccess={refresh}
          limits={{ drCount, recCount }}
          maxLimits={{ maxDres, maxRecs }}
          clinicId={clinicId}
        />
      )}

      {showMemberModal && (
        <MemberModal 
          onClose={() => { setShowMemberModal(false); setSelectedMember(null); }}
          member={selectedMember}
          roles={roles}
          onSuccess={refresh}
          clinicId={clinicId}
        />
      )}

      <ConfirmModal 
        isOpen={showLimitModal}
        onClose={() => setShowLimitModal(false)}
        onConfirm={() => setShowLimitModal(false)}
        title="Límite alcanzado"
        message="Has alcanzado el límite de miembros permitido por tu licencia actual. Por favor, mejora tu plan para añadir más miembros."
        confirmText="Entendido"
        type="warning"
      />

      <ConfirmModal 
        isOpen={showDeleteConfirm}
        onClose={() => { setShowDeleteConfirm(false); setSelectedMember(null); }}
        onConfirm={handleDelete}
        title="¿Eliminar miembro?"
        message={`¿Estás seguro que deseas eliminar a ${selectedMember?.nombre_completo}? Esta acción no se puede deshacer.`}
        confirmText={isDeleting ? "Eliminando..." : "Sí, eliminar"}
        type="danger"
      />
    </div>
  );
};

const AgendaTab = ({ data, update, t }) => (
  <section className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 p-6 md:p-8 border border-slate-100">
    <div className="flex items-center gap-3 mb-8">
      <span className="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-lg">calendar_month</span>
      <h3 className="text-xl font-bold font-headline">Configuración de Agenda</h3>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
      <FormField label="Apertura" type="time" value={data?.horario_apertura || '08:00'} onChange={(val) => update('horario_apertura', val)} />
      <FormField label="Cierre" type="time" value={data?.horario_cierre || '18:00'} onChange={(val) => update('horario_cierre', val)} />
      <FormField label="Duración Turno (min)" type="number" value={data?.duracion_turno || 30} onChange={(val) => update('duracion_turno', parseInt(val))} />
      <FormField label="Tiempo Limpieza (min)" type="number" value={data?.tiempo_limpieza || 10} onChange={(val) => update('tiempo_limpieza', parseInt(val))} />
      <FormField label="Tiempo Sobreturnos (min)" type="number" value={data?.tiempo_sobreturnos || 15} onChange={(val) => update('tiempo_sobreturnos', parseInt(val))} />
      <FormField label="Margen WhatsApp (min)" type="number" value={data?.tiempo_wsp || 5} onChange={(val) => update('tiempo_wsp', parseInt(val))} />
    </div>
  </section>
);

const WhatsAppTab = ({ data, update, t }) => (
  <div className="grid grid-cols-12 gap-8">
    <div className="col-span-12 lg:col-span-8 space-y-8">
      <section className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 p-6 md:p-8 border border-slate-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-green-500 bg-green-50 p-2 rounded-lg">chat</span>
            <h3 className="text-xl font-bold font-headline">{t('settings.sections.wsp_config')}</h3>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 bg-green-50 text-green-600 rounded-full self-start">
             <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
             <span className="text-[10px] font-black uppercase tracking-widest">Conectado</span>
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              {t('settings.fields.wsp_template')}
            </label>
            <textarea 
              className="w-full h-32 bg-slate-50 border-none rounded-xl p-4 text-sm font-medium focus:ring-2 focus:ring-primary/10 outline-none transition-all"
              value={data?.wsp_template || ""}
              onChange={(e) => update('wsp_template', e.target.value)}
            />
            <p className="text-[10px] text-slate-400 italic">Etiquetas: [PACIENTE], [FECHA], [HORA], [DENTISTA].</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <ToggleSwitch 
                label={t('settings.alerts.reminders')} 
                desc={t('settings.alerts.reminders_desc')} 
                checked={data?.wsp_reminders_enabled} 
                onChange={(val) => update('wsp_reminders_enabled', val)}
             />
             <div className="p-4 bg-slate-50 rounded-xl flex items-center justify-between">
                <span className="text-sm font-bold text-slate-700">Antelación</span>
                <select 
                  className="bg-white border-none rounded-lg p-1 text-xs font-bold outline-none"
                  value={data?.wsp_lead_time || '24h'}
                  onChange={(e) => update('wsp_lead_time', e.target.value)}
                >
                  <option value="24h">24 horas antes</option>
                  <option value="2h">2 horas antes</option>
                  <option value="1h">1 hora antes</option>
                </select>
             </div>
          </div>
        </div>
      </section>
    </div>

    <div className="col-span-12 lg:col-span-4 space-y-8">
       <section className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-8 text-white shadow-xl shadow-green-500/20">
          <h4 className="font-headline font-bold text-xl mb-4">WSP Bot Pro</h4>
          <p className="text-sm text-white/80 mb-6 leading-relaxed">
            Tu asistente automático está enviando recordatorios en tiempo real.
          </p>
          <div className="space-y-3">
             <div className="flex justify-between text-xs font-bold border-b border-white/20 pb-2">
                <span>Mensajes hoy</span>
                <span>24</span>
             </div>
             <div className="flex justify-between text-xs font-bold border-b border-white/20 pb-2">
                <span>Confirmaciones</span>
                <span>18</span>
             </div>
          </div>
          <button className="w-full mt-6 py-3 bg-white text-green-600 rounded-xl text-sm font-bold shadow-lg hover:bg-green-50 transition-colors cursor-pointer">
            Probar Mensaje
          </button>
       </section>
    </div>
  </div>
);

const MemberModal = ({ onClose, member, roles, onSuccess, clinicId }) => {
  const [name, setName] = useState(member?.nombre_completo || '');
  const [roleId, setRoleId] = useState(member?.rol_id || '');
  const [loading, setLoading] = useState(false);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase
        .from('perfiles')
        .update({
          nombre_completo: name,
          rol_id: roleId
        })
        .eq('id', member.id)
        .eq('clinica_id', clinicId);

      if (error) throw error;

      onClose();
      onSuccess && onSuccess();
    } catch (error) {
      alert(error.message || error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-[2rem] w-full max-w-md p-8 shadow-2xl"
      >
        <h3 className="text-2xl font-bold font-headline mb-2">Editar Miembro</h3>
        <p className="text-slate-500 text-sm mb-6">{member?.email}</p>
        <form onSubmit={handleUpdate} className="space-y-4">
          <FormField label="Nombre Completo" value={name} onChange={setName} required />
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Rol</label>
            <select 
              className="w-full bg-slate-100 rounded-xl p-3.5 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/10"
              value={roleId}
              onChange={(e) => setRoleId(e.target.value)}
              required
            >
              <option value="">Seleccionar rol...</option>
              {roles.filter(r => r.nombre !== 'ADMIN_GLOBAL').map(role => (
                <option key={role.id} value={role.id}>{role.nombre}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-4 mt-8">
            <button type="button" onClick={onClose} className="flex-1 py-3 font-bold text-slate-500 hover:bg-slate-50 rounded-xl transition-colors">Cancelar</button>
            <button type="submit" disabled={loading} className="flex-1 py-3 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20">
              {loading ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

const InviteModal = ({ onClose, roles, onSuccess, limits, maxLimits, clinicId }) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [roleId, setRoleId] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInvite = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const roleName = roles.find(r => r.id === roleId)?.nombre;
      if (roleName === 'ORTODONCISTA' && limits.drCount >= maxLimits.maxDres) {
        throw new Error(`Límite de Odontólogos alcanzado (${maxLimits.maxDres}) para tu licencia.`);
      }
      if (roleName === 'RECEPCIONISTA' && limits.recCount >= maxLimits.maxRecs) {
        throw new Error(`Límite de Recepcionistas alcanzado (${maxLimits.maxRecs}) para tu licencia.`);
      }

      const { data: { session } } = await supabase.auth.getSession();
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/manage-clinic`;
      const resp = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
          Authorization: session ? `Bearer ${session.access_token}` : ''
        },
        body: JSON.stringify({
          action: 'invite_member',
          payload: {
            email,
            nombre_completo: name,
            rol_id: roleId,
            clinica_id: clinicId
          }
        })
      });

      const json = await resp.json();
      if (!resp.ok) throw new Error(json?.error || json?.message || 'Error en invitación');

      alert('Invitación enviada');
      onClose();
      onSuccess && onSuccess();
    } catch (error) {
      alert(error.message || error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-[2rem] w-full max-w-md p-8 shadow-2xl"
      >
        <h3 className="text-2xl font-bold font-headline mb-6">Invitar Miembro</h3>
        <form onSubmit={handleInvite} className="space-y-4">
          <FormField label="Nombre Completo" value={name} onChange={setName} required />
          <FormField label="Email" type="email" value={email} onChange={setEmail} required />
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Rol</label>
            <select 
              className="w-full bg-slate-100 rounded-xl p-3.5 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/10"
              value={roleId}
              onChange={(e) => setRoleId(e.target.value)}
              required
            >
              <option value="">Seleccionar rol...</option>
              {roles.filter(r => r.nombre !== 'ADMIN_GLOBAL').map(role => {
                const isFull = (role.nombre === 'ORTODONCISTA' && limits.drCount >= maxLimits.maxDres) || 
                             (role.nombre === 'RECEPCIONISTA' && limits.recCount >= maxLimits.maxRecs);
                return (
                  <option key={role.id} value={role.id} disabled={isFull}>
                    {role.nombre} {isFull ? '(Límite alcanzado)' : ''}
                  </option>
                );
              })}
            </select>
          </div>
          <div className="flex gap-4 mt-8">
            <button type="button" onClick={onClose} className="flex-1 py-3 font-bold text-slate-500 hover:bg-slate-50 rounded-xl transition-colors">Cancelar</button>
            <button type="submit" disabled={loading} className="flex-1 py-3 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20">
              {loading ? 'Invitando...' : 'Enviar Invitación'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default Settings;
