import React from 'react';
import { useTranslation } from 'react-i18next';

const Patients = () => {
  const { t } = useTranslation();

  return (
    <div className="max-w-7xl mx-auto">
      {/* Page Header */}
      <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div className="max-w-2xl">
          <h2 className="text-4xl font-extrabold font-headline tracking-tight text-on-surface mb-2">{t('patients.title')}</h2>
          <p className="text-slate-500 font-body leading-relaxed">{t('patients.subtitle')}</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-white text-slate-600 px-5 py-2.5 rounded-xl font-label text-sm font-semibold shadow-sm hover:bg-slate-50 transition-colors flex items-center gap-2 border border-slate-100 cursor-pointer">
            <span className="material-symbols-outlined text-lg">filter_list</span> {t('patients.filter')}
          </button>
          <button className="bg-white text-slate-600 px-5 py-2.5 rounded-xl font-label text-sm font-semibold shadow-sm hover:bg-slate-50 transition-colors flex items-center gap-2 border border-slate-100 cursor-pointer">
            <span className="material-symbols-outlined text-lg">file_download</span> {t('patients.export_list')}
          </button>
        </div>
      </header>

      {/* Asymmetric Content Grid */}
      <div className="grid grid-cols-12 gap-8">
        {/* Patient List Column */}
        <div className="col-span-12 lg:col-span-8 space-y-4">
          {/* List Header */}
          <div className="grid grid-cols-12 px-6 py-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
            <div className="col-span-5">{t('patients.table.identity')}</div>
            <div className="col-span-3">{t('patients.table.phone')}</div>
            <div className="col-span-3">{t('patients.table.status')}</div>
            <div className="col-span-1 text-right">{t('patients.table.action')}</div>
          </div>

          {/* Patient Cards */}
          <div className="flex flex-col gap-3">
            <PatientCard 
                initials="EH" 
                name="Eleanor Henderson" 
                lastVisit="12 Oct 2026" 
                phone="+1 (555) 012-4493" 
                status={t('patients.status.checked_in')} 
                statusColor="bg-green-100 text-green-700" 
                active 
            />
            <PatientCard 
                img="https://lh3.googleusercontent.com/aida-public/AB6AXuAGnGzDkJFJZlRpeVadGsVAQYSqrVFywtel93M3w6M80spFtdgEuWyPTFsDBDnmx4Ftsa3HrJ5G6t5QMinqIZgA0lLUNTrkHuFbcNCKlBWeGRzvoDONxlM5w_x4X45oviN-CLjtNJDKq1GayenwtBl0H8pDykpD1npMUFqTyipRv1Wu0Ybd2ZIOX580mTLc5JBPLDNLXnOL5Qdc1Ly2iyAMhfRsyO7KruI25xuQ7HGXRIG3zmjEkA_KsyyJaCqJ_TlVPvtX7FNs"
                name="Arthur McKinney" 
                lastVisit="05 Nov 2026" 
                phone="+1 (555) 902-1132" 
                status={t('patients.status.completed')} 
                statusColor="bg-slate-100 text-slate-500" 
            />
            <PatientCard 
                initials="JW" 
                name="Julianne Waters" 
                lastVisit="28 Oct 2026" 
                phone="+1 (555) 231-9900" 
                status={t('patients.status.follow_up')} 
                statusColor="bg-amber-100 text-amber-700" 
                borderClass="border-l-4 border-amber-500"
            />
            <PatientCard 
                img="https://lh3.googleusercontent.com/aida-public/AB6AXuDWRUthoYYToVZq1PCERRp4YF_VXXSWvELtRWgGQlSAjlzU9DRiQnngqv90e3s0cg5oiFsZqIyYFIdR5a8xMgcjPcPxn-jRh54TbdYOFs2iSQLHtU9yD1nLcK63LMgPAsVWyaQQHjH7Gdwkyj99wvL3Nig4OrHoLaWUSCOGJz4viTvvPo82U73lS-BV3BguBZyIIfrV4Tk_O4GBh14MBqmkshu7zWN8r-RQ-IrgSEa2JCcJ00mPUZ2PP0GE--T-Tp9Z6ehJ11wM"
                name="Sarah Mitchell" 
                lastVisit="15 Nov 2026" 
                phone="+1 (555) 781-2245" 
                status={t('patients.status.new')} 
                statusColor="bg-blue-100 text-blue-700" 
            />
          </div>

          {/* Pagination */}
          <div className="flex justify-between items-center pt-6 px-2">
            <p className="text-xs text-slate-500">Mostrando 1 a 4 de 128 pacientes</p>
            <div className="flex gap-2">
              <PaginationButton icon="chevron_left" />
              <PaginationButton label="1" active />
              <PaginationButton label="2" />
              <PaginationButton label="3" />
              <PaginationButton icon="chevron_right" />
            </div>
          </div>
        </div>

        {/* Sidebar Panel */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          <div className="bg-gradient-to-br from-primary to-blue-500 p-8 rounded-2xl text-white shadow-xl shadow-primary/10 relative overflow-hidden border border-primary/5">
            <div className="relative z-10">
              <p className="text-[10px] uppercase tracking-[0.2em] font-bold opacity-70 mb-2">{t('patients.pulse.title')}</p>
              <h3 className="text-3xl font-headline font-extrabold mb-6">{t('patients.pulse.flow')}</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-sm opacity-80">{t('patients.pulse.today')}</p>
                    <p className="text-xl font-bold">24 Pacientes</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold py-1 px-2 bg-white/20 rounded-lg">+12%</span>
                  </div>
                </div>
                <div className="w-full bg-white/10 rounded-full h-1">
                  <div className="bg-white w-3/4 h-1 rounded-full"></div>
                </div>
              </div>
            </div>
            <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-[120px] opacity-10">groups</span>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-50">
            <div className="flex items-center justify-between mb-6">
              <h4 className="font-headline font-bold text-slate-900">{t('patients.activity')}</h4>
              <span className="material-symbols-outlined text-primary">history</span>
            </div>
            <ul className="space-y-6">
              <ActivityItem title="Check-in" person="Eleanor Henderson" time="10:30 AM • Consultorio 2" color="bg-primary" />
              <ActivityItem title="Pago Recibido" person="Arthur McKinney" time="09:15 AM • Recepción" color="bg-slate-200" />
              <ActivityItem title="Reprogramado" person="Julianne Waters" time="08:45 AM • Vía Portal" color="bg-amber-500" />
            </ul>
          </div>

          <div className="bg-green-50 p-6 rounded-2xl border border-green-100">
            <div className="flex items-start gap-4">
              <div className="bg-green-100 p-3 rounded-xl text-green-700">
                <span className="material-symbols-outlined">lightbulb</span>
              </div>
              <div>
                <h5 className="text-sm font-bold text-green-800">{t('patients.tip.title')}</h5>
                <p className="text-xs text-green-700/80 mt-1 leading-relaxed">{t('patients.tip.desc')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const PatientCard = ({ initials, img, name, lastVisit, phone, status, statusColor, active, borderClass }) => (
  <div className={`grid grid-cols-12 items-center bg-white p-6 rounded-xl hover:shadow-[0px_20px_40px_rgba(0,97,164,0.06)] transition-all duration-300 border border-slate-50 ${active ? 'border-l-4 border-l-primary' : borderClass || ''}`}>
    <div className="col-span-5 flex items-center gap-4">
      <div className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center bg-slate-100 text-primary font-bold text-lg">
        {img ? <img src={img} alt={name} className="w-full h-full object-cover" /> : initials}
      </div>
      <div>
        <h4 className="font-headline font-bold text-slate-900">{name}</h4>
        <p className="text-xs text-slate-500">Última visita: {lastVisit}</p>
      </div>
    </div>
    <div className="col-span-3 font-body text-sm text-slate-500">
      {phone}
    </div>
    <div className="col-span-3">
      <span className={`px-3 py-1 text-[11px] font-bold rounded-full uppercase tracking-tighter ${statusColor}`}>{status}</span>
    </div>
    <div className="col-span-1 text-right">
      <button className="material-symbols-outlined text-slate-300 hover:text-primary transition-colors cursor-pointer">more_vert</button>
    </div>
  </div>
);

const PaginationButton = ({ label, icon, active }) => (
  <button className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer shadow-sm ${active ? 'bg-primary text-white font-bold shadow-md shadow-primary/20' : 'bg-white text-slate-400 hover:text-primary border border-slate-50'}`}>
    {icon ? <span className="material-symbols-outlined text-sm">{icon}</span> : <span className="text-xs font-bold">{label}</span>}
  </button>
);

const ActivityItem = ({ title, person, time, color }) => (
  <li className="flex gap-4 relative">
    <div className="before:content-[''] before:absolute before:left-[7px] before:top-6 before:bottom-[-24px] before:w-[2px] before:bg-slate-100 last:before:hidden">
      <div className={`w-4 h-4 rounded-full ring-4 ring-white shadow-sm ${color}`}></div>
    </div>
    <div>
      <p className="text-xs font-bold text-slate-900">{title}</p>
      <p className="text-sm text-slate-600 font-medium">{person}</p>
      <p className="text-[10px] text-slate-400 mt-1">{time}</p>
    </div>
  </li>
);

export default Patients;
