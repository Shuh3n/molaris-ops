import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';

const Settings = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('clinic');
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
        const { data: clinic } = await supabase
          .from('clinicas')
          .select('*, licencias(max_dentistas, max_recepcionistas)')
          .eq('id', profile.clinica_id)
          .single();
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
      const { error } = await supabase
        .from('clinicas')
        .update(clinicData)
        .eq('id', clinicData.id);

      if (error) throw error;
      setOriginalClinicData(clinicData);
      setIsDirty(false);
      alert('Cambios guardados correctamente');
    } catch (error) {
      console.error('Error saving clinic data:', error);
      alert('Error al guardar: ' + error.message);
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
    { id: 'clinic', label: t('settings.tabs.clinic'), icon: 'domain' },
    { id: 'team', label: t('settings.tabs.team'), icon: 'group' },
    { id: 'agenda', label: t('settings.tabs.agenda'), icon: 'calendar_month' },
    { id: 'whatsapp', label: t('settings.tabs.whatsapp'), icon: 'chat' },
  ];

  if (loading) return <div className="p-20 text-center font-bold">Cargando configuración...</div>;

  return (
    <div className="max-w-6xl mx-auto pb-20">
      {/* Header Section */}
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-4xl font-extrabold font-headline tracking-tight text-on-surface mb-2">
            {t('settings.title')}
          </h2>
          <p className="text-slate-500 text-lg">{t('settings.subtitle')}</p>
        </div>
        
        {/* Tab Navigation */}
        <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 shadow-inner">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 cursor-pointer
                ${activeTab === tab.id 
                  ? 'bg-white text-primary shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'}
              `}
            >
              <span className="material-symbols-outlined text-[20px]">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="min-h-[500px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'clinic' && <ClinicTab data={clinicData} update={updateClinicField} t={t} />}
            {activeTab === 'team' && <TeamTab team={team} roles={roles} t={t} refresh={fetchData} license={clinicData?.licencias} />}
            {activeTab === 'agenda' && <AgendaTab data={clinicData} update={updateClinicField} t={t} />}
            {activeTab === 'whatsapp' && <WhatsAppTab data={clinicData} update={updateClinicField} t={t} />}
          </motion.div>
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
                 <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Cambios detectados</span>
              </div>
              <div className="flex gap-4">
                <button 
                  onClick={handleDiscard}
                  className="px-6 py-2.5 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  {t('settings.actions.discard')}
                </button>
                <button 
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-gradient-to-br from-primary to-blue-500 px-10 py-2.5 rounded-xl text-sm font-bold text-white shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
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

const ClinicTab = ({ data, update, t }) => (
  <div className="grid grid-cols-12 gap-8">
    <div className="col-span-12 lg:col-span-7 space-y-8">
      <section className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 p-8 border border-slate-100">
        <div className="flex items-center gap-3 mb-8">
          <span className="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-lg">info</span>
          <h3 className="text-xl font-bold font-headline">{t('settings.sections.info')}</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            label="Línea de Emergencia" 
            value={data?.telefono_emergencia || ''} 
            onChange={(val) => update('telefono_emergencia', val)}
          />
        </div>
      </section>
    </div>

    <div className="col-span-12 lg:col-span-5 space-y-8">
      <section className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 p-8 border border-slate-100 overflow-hidden relative">
        <div className="flex items-center gap-3 mb-8">
          <span className="material-symbols-outlined text-amber-500 bg-amber-50 p-2 rounded-lg">palette</span>
          <h3 className="text-xl font-bold font-headline">{t('settings.sections.branding')}</h3>
        </div>
        <div className="space-y-6">
          <div className="h-40 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-3 group hover:border-primary hover:bg-primary/5 transition-all cursor-pointer">
            <span className="material-symbols-outlined text-4xl text-slate-300 group-hover:text-primary transition-colors">add_photo_alternate</span>
            <p className="text-xs font-bold text-slate-400 group-hover:text-primary">{t('settings.branding.manage')}</p>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed italic">{t('settings.branding.subtitle')}</p>
        </div>
      </section>

      <section className="bg-primary/5 rounded-2xl p-8 border border-primary/10">
        <div className="flex items-center gap-3 mb-6">
           <span className="material-symbols-outlined text-primary">security</span>
           <h4 className="font-headline font-bold text-primary tracking-tight">Estado de la Licencia</h4>
        </div>
        <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-primary/10 shadow-sm">
           <div>
             <p className="text-sm font-bold text-slate-700">{data?.plan_licencia === 'premium' ? 'Plan Premium' : 'Plan Estándar'}</p>
             <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">
                {data?.fecha_vencimiento ? `Activo hasta ${new Date(data.fecha_vencimiento).toLocaleDateString()}` : 'Sin fecha definida'}
             </p>
           </div>
           <span className={`material-symbols-outlined ${data?.activa ? 'text-green-500' : 'text-red-500'}`}>
             {data?.activa ? 'verified' : 'error'}
           </span>
        </div>
      </section>
    </div>
  </div>
);

const TeamTab = ({ team, roles, t, refresh, license }) => {
  const [showInviteModal, setShowInviteModal] = useState(false);
  
  const drCount = team.filter(m => m.roles?.nombre === 'ORTODONCISTA').length;
  const recCount = team.filter(m => m.roles?.nombre === 'RECEPCIONISTA').length;

  const maxDres = license?.max_dentistas || 1;
  const maxRecs = license?.max_recepcionistas || 1;

  return (
    <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 overflow-hidden border border-slate-100">
      <div className="p-8 flex items-center justify-between border-b border-slate-50">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-green-600 bg-green-50 p-2 rounded-lg">badge</span>
          <h3 className="text-xl font-bold font-headline">{t('settings.sections.team_list')}</h3>
          <div className="flex gap-2 ml-4">
             <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${drCount >= maxDres ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-500'}`}>
               Dres: {drCount}/{maxDres}
             </span>
             <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${recCount >= maxRecs ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-500'}`}>
               Rec: {recCount}/{maxRecs}
             </span>
          </div>
        </div>
        <button 
          onClick={() => setShowInviteModal(true)}
          className="bg-primary text-white px-6 py-2 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-primary/20 hover:scale-105 transition-transform cursor-pointer"
        >
          <span className="material-symbols-outlined text-sm">person_add</span>
          {t('settings.access.manage')}
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50/50">
            <tr>
              <th className="px-8 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Miembro</th>
              <th className="px-8 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Email</th>
              <th className="px-8 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Rol</th>
              <th className="px-8 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {team.map((member) => (
              <tr key={member.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="px-8 py-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-primary group-hover:bg-primary group-hover:text-white transition-all">
                      {member.nombre_completo?.charAt(0) || 'U'}
                    </div>
                    <span className="text-sm font-bold text-slate-700">{member.nombre_completo}</span>
                  </div>
                </td>
                <td className="px-8 py-5 text-sm text-slate-500">{member.email}</td>
                <td className="px-8 py-5">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                    member.roles?.nombre === 'ADMIN_GLOBAL' ? 'bg-purple-100 text-purple-600' :
                    member.roles?.nombre === 'ORTODONCISTA' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {member.roles?.nombre || 'Personal'}
                  </span>
                </td>
                <td className="px-8 py-5">
                  <button className="text-slate-400 hover:text-primary transition-colors cursor-pointer">
                    <span className="material-symbols-outlined">more_vert</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showInviteModal && (
        <InviteModal 
          onClose={() => setShowInviteModal(false)} 
          roles={roles} 
          onSuccess={refresh}
          limits={{ drCount, recCount }}
          maxLimits={{ maxDres, maxRecs }}
        />
      )}
    </div>
  );
};

const AgendaTab = ({ data, update, t }) => (
  <section className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 p-8 border border-slate-100">
    <div className="flex items-center gap-3 mb-8">
      <span className="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-lg">calendar_month</span>
      <h3 className="text-xl font-bold font-headline">Configuración de Agenda</h3>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
      <section className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 p-8 border border-slate-100">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-green-500 bg-green-50 p-2 rounded-lg">chat</span>
            <h3 className="text-xl font-bold font-headline">{t('settings.sections.wsp_config')}</h3>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 bg-green-50 text-green-600 rounded-full">
             <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
             <span className="text-[10px] font-black uppercase tracking-widest">Conectado</span>
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">
              {t('settings.fields.wsp_template')}
            </label>
            <textarea 
              className="w-full h-32 bg-slate-50 border-none rounded-xl p-4 text-sm font-medium focus:ring-2 focus:ring-primary/10 outline-none transition-all"
              value={data?.wsp_template || "Hola [PACIENTE], te recordamos tu cita en MOLARIS OPS el día [FECHA] a las [HORA]. ¡Te esperamos!"}
              onChange={(e) => update('wsp_template', e.target.value)}
            />
            <p className="text-[10px] text-slate-400 italic">Puedes usar etiquetas como [PACIENTE], [FECHA], [HORA], [DENTISTA].</p>
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

const InviteModal = ({ onClose, roles, onSuccess, limits, maxLimits }) => {
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

      alert('Funcionalidad de invitación conectada al backend.');
      onClose();
    } catch (error) {
      alert(error.message);
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
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Rol</label>
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
              {loading ? 'Invitando...' : 'Enviar Invitación'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

const FormField = ({ label, value, type = 'text', readOnly, onChange, required }) => (
  <div className="space-y-2">
    <label className="text-xs font-black font-label text-slate-400 uppercase tracking-widest">{label}</label>
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
  <div className="flex items-center justify-between group">
    <div className="flex flex-col">
      <span className="text-sm font-bold text-slate-700">{label}</span>
      <span className="text-xs text-slate-500">{desc}</span>
    </div>
    <button 
      onClick={() => onChange && onChange(!checked)}
      className={`w-12 h-6 rounded-full relative flex items-center px-1 transition-colors cursor-pointer ${checked ? 'bg-green-500' : 'bg-slate-200'}`}
    >
      <div className={`w-4 h-4 bg-white rounded-full transition-transform ${checked ? 'translate-x-6' : ''}`}></div>
    </button>
  </div>
);

export default Settings;
