import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const Dashboard = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [basePath, setBasePath] = useState('/dashboard/recepcionista');
  const [userProfile, setUserProfile] = useState(null);
  const [stats, setStats] = useState({ today: 0, pending: 0, weeklyRevenue: 0 });
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const currentLocale = i18n.language.startsWith('es') ? 'es-ES' : 'en-US';

  useEffect(() => {
    const fetchRoleAndData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: profile } = await supabase
        .from('perfiles')
        .select('nombre_completo, clinica_id, roles(nombre)')
        .eq('id', session.user.id)
        .single();

      setUserProfile(profile);
      const role = profile?.roles?.nombre;
      
      let path = '/dashboard/recepcionista';
      if (role === 'ADMIN_GLOBAL') path = '/dashboard/adminglobal';
      else if (role === 'ORTODONCISTA') path = '/dashboard/dentista';
      setBasePath(path);

      if (profile?.clinica_id) {
        await fetchDashboardStats(profile.clinica_id);
      }
      setLoading(false);
    };

    const fetchDashboardStats = async (clinicaId) => {
      try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Today's appointments
        const { count: todayCount } = await supabase
          .from('citas')
          .select('*, estados_cita!inner(nombre)', { count: 'exact', head: true })
          .eq('clinica_id', clinicaId)
          .gte('fecha_hora', today.toISOString())
          .lt('fecha_hora', tomorrow.toISOString())
          .neq('estados_cita.nombre', 'cancelada');

        // Pending confirmations
        const { count: pendingCount } = await supabase
          .from('citas')
          .select('*, estados_cita!inner(nombre)', { count: 'exact', head: true })
          .eq('clinica_id', clinicaId)
          .eq('estados_cita.nombre', 'programada');

        // Weekly Revenue (last 7 days)
        const lastWeek = new Date();
        lastWeek.setDate(lastWeek.getDate() - 7);
        
        const { data: estadoCompletada } = await supabase
          .from('estados_cita')
          .select('id')
          .eq('nombre', 'completada')
          .single();

        const { data: weeklyCosts } = await supabase
          .from('citas')
          .select('costo')
          .eq('clinica_id', clinicaId)
          .gte('fecha_hora', lastWeek.toISOString())
          .eq('estado_id', estadoCompletada?.id);
        
        const revenue = weeklyCosts?.reduce((acc, curr) => acc + (curr.costo || 0), 0) || 0;

        setStats({ 
          today: todayCount || 0, 
          pending: pendingCount || 0, 
          weeklyRevenue: revenue 
        });

        // Upcoming
        const { data: upcoming } = await supabase
          .from('citas')
          .select(`
            id,
            fecha_hora,
            pacientes (nombre, apellido),
            motivos_consulta:motivo_id (nombre),
            estados_cita:estado_id (nombre)
          `)
          .eq('clinica_id', clinicaId)
          .gte('fecha_hora', today.toISOString())
          .order('fecha_hora', { ascending: true })
          .limit(3);

        setUpcomingAppointments(upcoming?.map(apt => ({
          ...apt,
          estado: apt.estados_cita?.nombre,
        })) || []);
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
      }
    };

    fetchRoleAndData();
  }, [i18n.language]);

  if (loading) return <div className="p-20 text-center font-bold">Cargando dashboard...</div>;

  return (
    <div className="max-w-[1600px] mx-auto">
      {/* Editorial Welcome */}
      <div className="mb-10 text-left">
        <p className="text-primary font-black tracking-[0.2em] text-[10px] uppercase mb-2 ml-1">
          {t('dashboard.welcome').split(',')[0]}, {userProfile?.nombre_completo?.split(' ')[0]}
        </p>
        <h2 className="text-3xl lg:text-4xl font-black tracking-tight text-slate-900">{t('dashboard.glance')}</h2>
        <p className="text-slate-400 text-xs font-bold mt-1 uppercase tracking-widest">
          {new Date().toLocaleDateString(currentLocale, { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
      </div>

      {/* Bento Summary Cards - GRID RESPONSIVO */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-10">
        {/* Today's Appointments */}
        <div className="bg-white p-8 rounded-[2rem] shadow-sm flex flex-col justify-between min-h-[200px] border border-slate-100 group hover:shadow-lg transition-all duration-500">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform text-left">
              <span className="material-symbols-outlined">calendar_month</span>
            </div>
            <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest text-left">{t('dashboard.stats.appointments')}</p>
          </div>
          <div className="flex items-baseline gap-3 mt-4">
            <h3 className="text-5xl font-black text-slate-900">{stats.today}</h3>
          </div>
        </div>

        {/* Pending Confirmations */}
        <div className="bg-white p-8 rounded-[2rem] shadow-sm flex flex-col justify-between min-h-[200px] border border-slate-100 group hover:shadow-lg transition-all duration-500 text-left">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-500 mb-6 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined">pending_actions</span>
            </div>
            <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">{t('dashboard.stats.pending')}</p>
          </div>
          <div className="flex items-baseline gap-3 mt-4">
            <h3 className="text-5xl font-black text-slate-900">{stats.pending}</h3>
            <p className="text-amber-600 text-[10px] font-black uppercase tracking-widest bg-amber-50 px-2 py-1 rounded-lg">Programadas</p>
          </div>
        </div>

        {/* Revenue Summary */}
        <div className="bg-gradient-to-br from-primary to-blue-500 p-8 rounded-[2rem] shadow-xl shadow-primary/20 flex flex-col justify-between min-h-[200px] text-white relative overflow-hidden group md:col-span-2 xl:col-span-1 text-left">
          <div className="relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>account_balance_wallet</span>
            </div>
            <p className="text-blue-100 font-bold text-[10px] uppercase tracking-widest opacity-80">Ingresos (Últ. 7 días)</p>
          </div>
          <div className="relative z-10 mt-4">
            <h3 className="text-4xl font-black">${stats.weeklyRevenue.toLocaleString()}</h3>
            <p className="text-blue-100 text-[10px] font-bold uppercase tracking-widest opacity-60 mt-1">Sincronizado</p>
          </div>
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
        {/* Main Schedule View */}
        <div className="xl:col-span-8 space-y-10">
          <section>
            <div className="flex items-center justify-between mb-8 px-2">
              <h3 className="text-2xl font-black tracking-tight text-slate-900">{t('dashboard.schedule.title')}</h3>
              <button onClick={() => navigate(`${basePath}/citas`)} className="text-primary text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:translate-x-1 transition-transform cursor-pointer">
                {t('dashboard.schedule.view_all')} <span className="material-symbols-outlined text-lg">arrow_forward</span>
              </button>
            </div>
            <div className="space-y-4">
              {upcomingAppointments.length === 0 ? (
                <div className="p-10 bg-white rounded-2xl border border-dashed border-slate-200 text-center text-slate-400 italic">
                  No hay citas próximas programadas.
                </div>
              ) : upcomingAppointments.map((apt) => (
                <AppointmentItem 
                  key={apt.id}
                  time={new Date(apt.fecha_hora).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} 
                  period="" 
                  name={`${apt.pacientes?.nombre} ${apt.pacientes?.apellido}`} 
                  service={apt.motivos_consulta?.nombre || 'Consulta General'} 
                  status={t(`appointments.status.${apt.estado}`)} 
                  statusColor={
                    apt.estado === 'programada' ? 'bg-blue-50 text-blue-700' :
                    apt.estado === 'completada' ? 'bg-green-50 text-green-700' : 'bg-slate-50 text-slate-500'
                  }
                />
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar Content */}
        <div className="xl:col-span-4 space-y-10">
          {/* Quick Actions */}
          <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 text-left">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-8 ml-1">{t('dashboard.quick_actions.title')}</h3>
            <div className="space-y-4">
              <QuickActionButton onClick={() => navigate(`${basePath}/citas`)} icon="add_circle" label={t('dashboard.quick_actions.create')} color="blue" />
              <QuickActionButton onClick={() => navigate(`${basePath}/facturacion`)} icon="description" label={t('dashboard.quick_actions.invoice')} color="green" />
              <QuickActionButton onClick={() => navigate(`${basePath}/pacientes`)} icon="history" label={t('dashboard.quick_actions.history')} color="amber" />
            </div>
          </div>

          {/* Mini Calendar */}
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden text-left">
            <div className="flex items-center justify-between mb-8 px-1">
              <h3 className="font-black text-slate-900 tracking-tight uppercase text-xs tracking-widest">
                {new Date().toLocaleDateString(currentLocale, { month: 'long', year: 'numeric' })}
              </h3>
            </div>
            <div className="grid grid-cols-7 gap-y-2 text-center text-[10px]">
              {['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do'].map(d => <span key={d} className="text-slate-300 font-black uppercase">{d}</span>)}
              {Array.from({ length: 31 }, (_, i) => {
                const day = i + 1;
                const isToday = day === new Date().getDate();
                return (
                  <span key={i} className={`py-2 rounded-xl font-bold ${isToday ? 'text-white bg-primary shadow-lg shadow-primary/20' : 'text-slate-500'}`}>
                    {day}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const AppointmentItem = ({ time, period, name, service, status, statusColor, img, primaryTime }) => (
  <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 p-6 bg-white rounded-2xl group hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300 border border-slate-100">
    <div className="flex items-center gap-4 sm:flex-col sm:gap-0 sm:min-w-[60px] sm:text-center border-b sm:border-b-0 sm:border-r border-slate-50 pb-3 sm:pb-0 sm:pr-4">
      <p className={`text-xs font-black uppercase tracking-widest ${primaryTime ? 'text-primary' : 'text-slate-400'}`}>{time}</p>
      <p className={`text-[10px] font-bold ${primaryTime ? 'text-primary opacity-60' : 'text-slate-300'}`}>{period}</p>
    </div>
    <div className="flex items-center gap-4 flex-1">
      <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center overflow-hidden ring-1 ring-slate-100">
        {img ? <img src={img} alt={name} className="w-full h-full object-cover" /> : <span className="material-symbols-outlined text-slate-300">person</span>}
      </div>
      <div className="flex-1">
        <h4 className="font-bold text-slate-900 tracking-tight">{name}</h4>
        <p className="text-xs text-slate-400 font-medium line-clamp-1">{service}</p>
      </div>
    </div>
    <div className="flex items-center justify-between sm:justify-end gap-4 mt-2 sm:mt-0">
      <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${statusColor}`}>
        {status}
      </div>
      <button className="w-10 h-10 flex items-center justify-center text-slate-300 group-hover:text-primary transition-colors cursor-pointer hover:bg-slate-50 rounded-xl">
        <span className="material-symbols-outlined">more_vert</span>
      </button>
    </div>
  </div>
);

const QuickActionButton = ({ icon, label, color, onClick }) => {
    const colors = {
        blue: "bg-blue-50 text-primary group-hover:bg-primary",
        green: "bg-green-50 text-green-600 group-hover:bg-green-600",
        amber: "bg-amber-50 text-amber-600 group-hover:bg-amber-600"
    };

    return (
        <button onClick={onClick} className="w-full bg-white hover:shadow-md text-slate-700 p-4 rounded-2xl flex items-center gap-4 transition-all duration-300 group border border-slate-100 cursor-pointer">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-500 ${colors[color]} group-hover:text-white group-hover:scale-110 group-hover:rotate-6 shadow-sm`}>
                <span className="material-symbols-outlined">{icon}</span>
            </div>
            <span className="font-black text-[10px] uppercase tracking-widest">{label}</span>
        </button>
    );
}

export default Dashboard;
