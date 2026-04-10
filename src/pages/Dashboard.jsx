import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

const Dashboard = () => {
  const { t } = useTranslation();

  return (
    <div className="max-w-7xl mx-auto">
      {/* Editorial Welcome */}
      <div className="mb-10">
        <p className="text-primary font-bold tracking-widest text-xs uppercase mb-1">{t('dashboard.welcome')}</p>
        <h2 className="text-4xl font-extrabold tracking-tight text-on-surface">{t('dashboard.glance')}</h2>
      </div>

      {/* Bento Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {/* Today's Appointments */}
        <div className="bg-white p-8 rounded-xl shadow-[0px_20px_40px_rgba(0,97,164,0.03)] flex flex-col justify-between min-h-[180px] border border-slate-50">
          <div>
            <span className="material-symbols-outlined text-primary mb-4">calendar_month</span>
            <p className="text-slate-500 font-medium text-sm">{t('dashboard.stats.appointments')}</p>
          </div>
          <div className="flex items-baseline gap-2">
            <h3 className="text-5xl font-extrabold text-on-surface">8</h3>
            <span className="text-green-600 font-bold text-sm flex items-center">
              <span className="material-symbols-outlined text-sm">trending_up</span>
              12%
            </span>
          </div>
        </div>

        {/* Pending Confirmations */}
        <div className="bg-white p-8 rounded-xl shadow-[0px_20px_40px_rgba(0,97,164,0.03)] flex flex-col justify-between min-h-[180px] border border-slate-50">
          <div>
            <span className="material-symbols-outlined text-amber-500 mb-4">pending_actions</span>
            <p className="text-slate-500 font-medium text-sm">{t('dashboard.stats.pending')}</p>
          </div>
          <div className="flex items-baseline gap-2">
            <h3 className="text-5xl font-extrabold text-on-surface">3</h3>
            <p className="text-slate-400 text-xs font-medium">Requiere atención</p>
          </div>
        </div>

        {/* Revenue Summary */}
        <div className="bg-gradient-to-br from-primary to-blue-500 p-8 rounded-xl shadow-xl shadow-primary/10 flex flex-col justify-between min-h-[180px] text-white">
          <div>
            <span className="material-symbols-outlined mb-4" style={{ fontVariationSettings: "'FILL' 1" }}>account_balance_wallet</span>
            <p className="text-blue-100 font-medium text-sm">{t('dashboard.stats.weekly')}</p>
          </div>
          <div>
            <h3 className="text-4xl font-extrabold">$12,450</h3>
            <p className="text-blue-100 text-xs opacity-80 mt-1">{t('dashboard.stats.projected')}: $15,000</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Main Schedule View */}
        <div className="lg:col-span-8 space-y-10">
          <section>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold tracking-tight">{t('dashboard.schedule.title')}</h3>
              <button className="text-primary text-sm font-bold flex items-center gap-1 hover:underline cursor-pointer">
                {t('dashboard.schedule.view_all')} <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>
            <div className="space-y-4">
              <AppointmentItem 
                time="09:00" 
                period="AM" 
                name="Sarah Jenkins" 
                service="Limpieza Anual y Rayos X" 
                status="Confirmado" 
                statusColor="bg-green-100 text-green-700"
                img="https://lh3.googleusercontent.com/aida-public/AB6AXuCEZKc4F41z2AtzqnjqlCSg9YHsgaLhOUiyv-y4QXkADi2xYF2LE_WX5_5VQ2MLNNQ74KW_vMoGMTalByO2krms_W_hhiWviSpXnBaG9OC4dEc5k1MDNDt7g7emymaHwf9onwJhY5mJocuF018GMTjgxkBTaZx8eiTNMZ-65nRmLVT0X9pPb-KQdq6t-3pOGx00VBFkjqk1YcUcbE__XvR-5boduJ0hfgmys8SY7d0zYMocBZna5SVfZPwip7AB0nL8WPu9kmrF"
              />
              <AppointmentItem 
                time="10:30" 
                period="AM" 
                name="Marcus Thompson" 
                service="Seguimiento de Endodoncia" 
                status="En Progreso" 
                statusColor="bg-amber-100 text-amber-700"
                primaryTime
              />
              <AppointmentItem 
                time="01:15" 
                period="PM" 
                name="David Chen" 
                service="Consulta de Muela del Juicio" 
                status="En Espera" 
                statusColor="bg-slate-100 text-slate-600"
                img="https://lh3.googleusercontent.com/aida-public/AB6AXuAAFh7B5eTdi8J_8KaiXObpgcp5p1aYNjYvNojtYkJPd9Y91gZ1iTzmSd5gpZXK7HpU6TWZOFAzvUWbsDF77suZGu8i1__TacBb24MSL3FQ7uIKG9P2f7zOTIWfhngm64-DZybBq983Z-pQc1KYVeGTX5vj5vtehUidciHeyIr9KPG0fAECGFjhRQucHERTN2JbuekZEk9-QGKGRtpQIxNALopM2JiDD-xrQ1a7wyeGE6K5qlpcUNieBBGVKihZlS0eRZb8M2XD"
              />
            </div>
          </section>
        </div>

        {/* Sidebar Content */}
        <div className="lg:col-span-4 space-y-8">
          {/* Quick Actions */}
          <div className="bg-slate-50 p-8 rounded-xl border border-slate-100">
            <h3 className="text-lg font-bold mb-6">{t('dashboard.quick_actions.title')}</h3>
            <div className="space-y-3">
              <QuickActionButton icon="add_circle" label={t('dashboard.quick_actions.create')} color="blue" />
              <QuickActionButton icon="description" label={t('dashboard.quick_actions.invoice')} color="green" />
              <QuickActionButton icon="history" label={t('dashboard.quick_actions.history')} color="amber" />
            </div>
          </div>

          {/* Mini Calendar */}
          <div className="bg-white p-8 rounded-xl shadow-[0px_20px_40px_rgba(0,97,164,0.03)] border border-slate-50">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold">Octubre 2026</h3>
              <div className="flex gap-2">
                <button className="material-symbols-outlined text-slate-400 text-lg hover:text-primary transition-colors cursor-pointer">chevron_left</button>
                <button className="material-symbols-outlined text-slate-400 text-lg hover:text-primary transition-colors cursor-pointer">chevron_right</button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-y-4 text-center text-xs">
              {['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do'].map(d => <span key={d} className="text-slate-400 font-bold uppercase">{d}</span>)}
              {Array.from({ length: 31 }, (_, i) => (
                <span key={i} className={`py-2 rounded-lg cursor-pointer hover:bg-blue-50 transition-colors ${i+1 === 21 ? 'font-bold text-primary border border-primary/20 bg-primary/5' : ''}`}>
                  {i + 1}
                </span>
              ))}
            </div>
            <div className="mt-6 pt-6 border-t border-slate-50">
              <p className="text-xs text-slate-500 font-medium">{t('dashboard.calendar.upcoming')}</p>
              <p className="text-sm font-bold text-primary mt-1">{t('dashboard.calendar.meeting')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const AppointmentItem = ({ time, period, name, service, status, statusColor, img, primaryTime }) => (
  <div className="flex items-center gap-6 p-6 bg-white rounded-xl group hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300 border border-slate-50">
    <div className="text-center min-w-[60px]">
      <p className={`text-xs font-bold uppercase tracking-tighter ${primaryTime ? 'text-primary' : 'text-slate-400'}`}>{time}</p>
      <p className={`text-xs font-medium ${primaryTime ? 'text-primary' : 'text-slate-400'}`}>{period}</p>
    </div>
    <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden">
      {img ? <img src={img} alt={name} className="w-full h-full object-cover" /> : <span className="material-symbols-outlined text-slate-400">person</span>}
    </div>
    <div className="flex-1">
      <h4 className="font-bold text-slate-900">{name}</h4>
      <p className="text-sm text-slate-500">{service}</p>
    </div>
    <div className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusColor}`}>
      {status}
    </div>
    <button className="p-2 text-slate-300 group-hover:text-primary transition-colors cursor-pointer">
      <span className="material-symbols-outlined">more_vert</span>
    </button>
  </div>
);

const QuickActionButton = ({ icon, label, color }) => {
    const colors = {
        blue: "bg-blue-50 text-blue-600 hover:bg-blue-600",
        green: "bg-green-50 text-green-600 hover:bg-green-600",
        amber: "bg-amber-50 text-amber-600 hover:bg-amber-600"
    };

    return (
        <button className="w-full bg-white hover:bg-white text-slate-700 p-4 rounded-xl flex items-center gap-4 transition-all duration-300 group shadow-sm border border-slate-100 cursor-pointer">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${colors[color]} group-hover:text-white`}>
                <span className="material-symbols-outlined">{icon}</span>
            </div>
            <span className="font-semibold text-sm">{label}</span>
        </button>
    );
}

export default Dashboard;
