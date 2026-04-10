import React from 'react';
import { useTranslation } from 'react-i18next';

const Settings = () => {
  const { t } = useTranslation();

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header Section */}
      <div className="mb-12">
        <h2 className="text-4xl font-extrabold font-headline tracking-tight text-on-surface mb-2">{t('settings.title')}</h2>
        <p className="text-slate-500 text-lg">{t('settings.subtitle')}</p>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-12 gap-8">
        {/* Left Column: Clinic Information Form */}
        <div className="col-span-12 lg:col-span-8 space-y-8">
          <section className="bg-white rounded-xl shadow-[0px_20px_40px_rgba(0,97,164,0.06)] p-8 border border-slate-50">
            <div className="flex items-center gap-3 mb-8">
              <span className="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-lg">domain</span>
              <h3 className="text-xl font-bold font-headline">{t('settings.sections.info')}</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField label={t('settings.fields.name')} value="MOLARIS OPS" />
              <FormField label={t('settings.fields.id')} value="MO-2026-883" readOnly />
              <div className="md:col-span-2">
                <FormField label={t('settings.fields.email')} value="admin@molarisops.clinic" type="email" />
              </div>
              <FormField label={t('settings.fields.phone')} value="+1 (555) 234-8899" />
              <FormField label={t('settings.fields.emergency')} value="+1 (555) 999-0011" />
            </div>
          </section>

          {/* Professional Branding Card */}
          <section className="bg-white rounded-xl shadow-[0px_20px_40px_rgba(0,97,164,0.06)] overflow-hidden group border border-slate-50">
            <div className="relative h-48 w-full overflow-hidden">
              <img 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCsfu8PnJ89hBPRXu7bU2ilHSbS-_mEHarhTZzk0oLilRl5iQZ0wGIvSMyCO8ntND1KXdxfH_UkWCO_ru6iEcE2w0KSu1f3EQg_1meF-tqvLqpqaZWylmPZlFNcx7OEHMHNnle-AS7xj2OPUllVvd8LjL0PR9M-lvX8SAzjzrtROC4ydO6VtwBKSvHGzxbxqd35CKlIae_SN7ziIfTdGfCNzP5RyUxdVuOVpP25yEYDjKx8u4O0HCt7wSbu31IQFI_xQFLfsfj3" 
                alt="Clinic" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <div className="absolute bottom-6 left-8 text-white">
                <h3 className="font-headline text-xl font-bold">{t('settings.sections.branding')}</h3>
                <p className="text-white/80 text-sm">{t('settings.branding.subtitle')}</p>
              </div>
            </div>
            <div className="p-8 flex justify-between items-center">
              <div className="flex -space-x-3">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center ring-4 ring-white">
                  <span className="material-symbols-outlined text-primary">add_a_photo</span>
                </div>
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center ring-4 ring-white">
                  <span className="material-symbols-outlined text-green-600">palette</span>
                </div>
              </div>
              <button className="text-primary font-bold text-sm hover:underline cursor-pointer">{t('settings.branding.manage')}</button>
            </div>
          </section>
        </div>

        {/* Right Column: Preferences & Toggles */}
        <div className="col-span-12 lg:col-span-4 space-y-8">
          {/* Notifications Section */}
          <section className="bg-white rounded-xl shadow-[0px_20px_40px_rgba(0,97,164,0.06)] p-8 border border-slate-50">
            <div className="flex items-center gap-3 mb-8">
              <span className="material-symbols-outlined text-green-600 bg-green-50 p-2 rounded-lg">notifications_active</span>
              <h3 className="text-xl font-bold font-headline">{t('settings.sections.alerts')}</h3>
            </div>
            <div className="space-y-6">
              <ToggleSwitch label={t('settings.alerts.reminders')} desc={t('settings.alerts.reminders_desc')} checked />
              <ToggleSwitch label={t('settings.alerts.checkins')} desc={t('settings.alerts.checkins_desc')} checked />
              <ToggleSwitch label={t('settings.alerts.reports')} desc={t('settings.alerts.reports_desc')} />
            </div>
          </section>

          {/* Staff Access Summary */}
          <section className="bg-primary/5 rounded-xl p-8 border border-primary/10">
            <h4 className="font-headline font-bold text-primary mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined">admin_panel_settings</span>
              {t('settings.sections.access')}
            </h4>
            <div className="space-y-4">
              <AccessLevel label={t('settings.access.admins')} count="3" color="bg-primary" bgColor="bg-primary/10" textColor="text-primary" />
              <AccessLevel label={t('settings.access.medical')} count="12" color="bg-green-500" bgColor="bg-green-50" textColor="text-green-600" />
              <AccessLevel label={t('settings.access.front')} count="5" color="bg-amber-500" bgColor="bg-amber-50" textColor="text-amber-600" />
            </div>
            <button className="w-full mt-6 py-2 rounded-full border border-primary/20 text-primary font-bold text-xs hover:bg-primary/5 transition-colors cursor-pointer">
              {t('settings.access.manage')}
            </button>
          </section>
        </div>
      </div>

      {/* Sticky Footer Action */}
      <div className="mt-12 pt-8 flex items-center justify-end gap-4 border-t border-slate-200">
        <button className="px-8 py-3 rounded-full text-sm font-bold text-slate-500 hover:bg-slate-50 transition-colors cursor-pointer">
          {t('settings.actions.discard')}
        </button>
        <button className="bg-gradient-to-br from-primary to-blue-500 px-10 py-3 rounded-full text-sm font-bold text-white shadow-xl shadow-primary/20 active:scale-95 transition-transform cursor-pointer">
          {t('settings.actions.save')}
        </button>
      </div>
    </div>
  );
};

const FormField = ({ label, value, type = 'text', readOnly }) => (
  <div className="space-y-2">
    <label className="text-xs font-bold font-label text-slate-500 uppercase tracking-wider">{label}</label>
    <input 
      className={`w-full border-none rounded-lg p-3 text-sm transition-all outline-none ${readOnly ? 'bg-slate-50 text-slate-400 cursor-not-allowed' : 'bg-slate-100 focus:bg-white focus:ring-2 focus:ring-primary/20'}`} 
      type={type} 
      defaultValue={value} 
      readOnly={readOnly}
    />
  </div>
);

const ToggleSwitch = ({ label, desc, checked }) => (
  <div className="flex items-center justify-between group">
    <div className="flex flex-col">
      <span className="text-sm font-semibold text-slate-900">{label}</span>
      <span className="text-xs text-slate-500">{desc}</span>
    </div>
    <button className={`w-12 h-6 rounded-full relative flex items-center px-1 transition-colors cursor-pointer ${checked ? 'bg-green-500' : 'bg-slate-200'}`}>
      <div className={`w-4 h-4 bg-white rounded-full transition-transform ${checked ? 'translate-x-6' : ''}`}></div>
    </button>
  </div>
);

const AccessLevel = ({ label, count, color, bgColor, textColor }) => (
  <div className="flex items-center gap-4">
    <div className={`w-2 h-2 rounded-full ${color}`}></div>
    <span className="text-sm text-slate-600 flex-1">{label}</span>
    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${bgColor} ${textColor}`}>{count}</span>
  </div>
);

export default Settings;
