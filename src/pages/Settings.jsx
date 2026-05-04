import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';

const Settings = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('clinic');
  const [loading, setLoading] = useState(true);
  const [clinicData, setClinicData] = useState(null);
  const [team, setTeam] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Obtener sesión actual para clinica_id
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: profile } = await supabase
        .from('perfiles')
        .select('clinica_id')
        .eq('id', session.user.id)
        .single();

      if (profile?.clinica_id) {
        // Cargar datos de la clínica
        const { data: clinic } = await supabase
          .from('clinicas')
          .select('*')
          .eq('id', profile.clinica_id)
          .single();
        setClinicData(clinic);

        // Cargar equipo
        const { data: staff } = await supabase
          .from('perfiles')
          .select('id, nombre_completo, email, roles(nombre)')
          .eq('clinica_id', profile.clinica_id);
        setTeam(staff || []);
      }
    } catch (error) {
      console.error('Error fetching management data:', error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'clinic', label: t('settings.tabs.clinic'), icon: 'domain' },
    { id: 'team', label: t('settings.tabs.team'), icon: 'group' },
    { id: 'agenda', label: t('settings.tabs.agenda'), icon: 'calendar_month' },
    { id: 'whatsapp', label: t('settings.tabs.whatsapp'), icon: 'chat' },
  ];

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
            {activeTab === 'clinic' && <ClinicTab data={clinicData} t={t} />}
            {activeTab === 'team' && <TeamTab team={team} t={t} />}
            {activeTab === 'agenda' && <AgendaTab t={t} />}
            {activeTab === 'whatsapp' && <WhatsAppTab t={t} />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Sticky Action Bar */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-4xl px-4 z-50">
        <div className="bg-white/80 backdrop-blur-2xl rounded-2xl border border-slate-200 p-4 shadow-[0px_20px_50px_rgba(0,0,0,0.1)] flex items-center justify-between">
          <div className="flex items-center gap-3 ml-4">
             <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
             <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Cambios detectados</span>
          </div>
          <div className="flex gap-4">
            <button className="px-6 py-2.5 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-100 transition-colors cursor-pointer">
              {t('settings.actions.discard')}
            </button>
            <button className="bg-gradient-to-br from-primary to-blue-500 px-10 py-2.5 rounded-xl text-sm font-bold text-white shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all cursor-pointer">
              {t('settings.actions.save')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- SUB-COMPONENTS ---

const ClinicTab = ({ data, t }) => (
  <div className="grid grid-cols-12 gap-8">
    <div className="col-span-12 lg:col-span-7 space-y-8">
      <section className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 p-8 border border-slate-100">
        <div className="flex items-center gap-3 mb-8">
          <span className="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-lg">info</span>
          <h3 className="text-xl font-bold font-headline">{t('settings.sections.info')}</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField label={t('settings.fields.name')} value={data?.nombre_consultorio || 'MOLARIS OPS'} />
          <FormField label={t('settings.fields.id')} value="MO-2026-883" readOnly />
          <div className="md:col-span-2">
            <FormField label={t('settings.fields.email')} value="contacto@molarisops.clinic" type="email" />
          </div>
          <FormField label={t('settings.fields.phone')} value="+1 (555) 234-8899" />
          <FormField label={t('settings.fields.emergency')} value="+1 (555) 999-0011" />
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
             <p className="text-sm font-bold text-slate-700">Plan Profesional</p>
             <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Activo hasta Mayo 2027</p>
           </div>
           <span className="material-symbols-outlined text-green-500">verified</span>
        </div>
      </section>
    </div>
  </div>
);

const TeamTab = ({ team, t }) => (
  <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 overflow-hidden border border-slate-100">
    <div className="p-8 flex items-center justify-between border-b border-slate-50">
      <div className="flex items-center gap-3">
        <span className="material-symbols-outlined text-green-600 bg-green-50 p-2 rounded-lg">badge</span>
        <h3 className="text-xl font-bold font-headline">{t('settings.sections.team_list')}</h3>
      </div>
      <button className="bg-primary text-white px-6 py-2 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-primary/20 hover:scale-105 transition-transform cursor-pointer">
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
  </div>
);

const AgendaTab = ({ t }) => (
  <div className="grid grid-cols-12 gap-8">
    <div className="col-span-12 lg:col-span-6 space-y-8">
      <section className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 p-8 border border-slate-100">
        <div className="flex items-center gap-3 mb-8">
          <span className="material-symbols-outlined text-blue-500 bg-blue-50 p-2 rounded-lg">schedule</span>
          <h3 className="text-xl font-bold font-headline">Horarios de Atención</h3>
        </div>
        <div className="space-y-4">
          {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'].map(day => (
            <div key={day} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
              <span className="text-sm font-bold text-slate-700">{day}</span>
              <div className="flex items-center gap-2">
                <input type="text" defaultValue="09:00" className="w-16 text-center bg-white border-none rounded-lg p-1 text-xs font-bold" />
                <span className="text-slate-400">-</span>
                <input type="text" defaultValue="18:00" className="w-16 text-center bg-white border-none rounded-lg p-1 text-xs font-bold" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
    
    <div className="col-span-12 lg:col-span-6 space-y-8">
       <section className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 p-8 border border-slate-100">
        <div className="flex items-center gap-3 mb-8">
          <span className="material-symbols-outlined text-purple-500 bg-purple-50 p-2 rounded-lg">hourglass_empty</span>
          <h3 className="text-xl font-bold font-headline">Configuración de Turnos</h3>
        </div>
        <div className="space-y-6">
          <FormField label="Duración por defecto (minutos)" value="30" type="number" />
          <ToggleSwitch label="Permitir sobreturnos" desc="Permite agendar más de un paciente en el mismo horario" />
          <ToggleSwitch label="Intervalo de limpieza" desc="Añadir 10 min automáticos entre cada cita" />
        </div>
      </section>
    </div>
  </div>
);

const WhatsAppTab = ({ t }) => (
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
              defaultValue="Hola [PACIENTE], te recordamos tu cita en MOLARIS OPS el día [FECHA] a las [HORA]. ¡Te esperamos!"
            />
            <p className="text-[10px] text-slate-400 italic">Puedes usar etiquetas como [PACIENTE], [FECHA], [HORA], [DENTISTA].</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <ToggleSwitch label={t('settings.alerts.reminders')} desc={t('settings.alerts.reminders_desc')} checked />
             <div className="p-4 bg-slate-50 rounded-xl flex items-center justify-between">
                <span className="text-sm font-bold text-slate-700">Antelación</span>
                <select className="bg-white border-none rounded-lg p-1 text-xs font-bold outline-none">
                  <option>24 horas antes</option>
                  <option>2 horas antes</option>
                  <option>1 hora antes</option>
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

const FormField = ({ label, value, type = 'text', readOnly }) => (
  <div className="space-y-2">
    <label className="text-xs font-black font-label text-slate-400 uppercase tracking-widest">{label}</label>
    <input 
      className={`w-full border-none rounded-xl p-3.5 text-sm font-medium transition-all outline-none ${readOnly ? 'bg-slate-50 text-slate-400 cursor-not-allowed' : 'bg-slate-100 focus:bg-white focus:ring-2 focus:ring-primary/10'}`} 
      type={type} 
      defaultValue={value} 
      readOnly={readOnly}
    />
  </div>
);

const ToggleSwitch = ({ label, desc, checked }) => (
  <div className="flex items-center justify-between group">
    <div className="flex flex-col">
      <span className="text-sm font-bold text-slate-700">{label}</span>
      <span className="text-xs text-slate-500">{desc}</span>
    </div>
    <button className={`w-12 h-6 rounded-full relative flex items-center px-1 transition-colors cursor-pointer ${checked ? 'bg-green-500' : 'bg-slate-200'}`}>
      <div className={`w-4 h-4 bg-white rounded-full transition-transform ${checked ? 'translate-x-6' : ''}`}></div>
    </button>
  </div>
);

export default Settings;
