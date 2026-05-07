import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';

const AdminStats = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalAppointments: 0,
    completedAppointments: 0,
    revenue: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
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
        const { count: patients } = await supabase
          .from('pacientes')
          .select('*', { count: 'exact', head: true })
          .eq('clinica_id', profile.clinica_id);

        const { count: appointments } = await supabase
          .from('citas')
          .select('*', { count: 'exact', head: true })
          .eq('clinica_id', profile.clinica_id);

        const { count: completed } = await supabase
          .from('citas')
          .select('*, estados_cita!inner(nombre)', { count: 'exact', head: true })
          .eq('clinica_id', profile.clinica_id)
          .eq('estados_cita.nombre', 'completada');

        // Revenue placeholder (sum of costo if available)
        const { data: costs } = await supabase
          .from('citas')
          .select('costo')
          .eq('clinica_id', profile.clinica_id)
          .eq('estado_id', (await supabase.from('estados_cita').select('id').eq('nombre', 'completada').single()).data?.id);

        const totalRevenue = costs?.reduce((acc, curr) => acc + (curr.costo || 0), 0) || 0;

        setStats({
          totalPatients: patients || 0,
          totalAppointments: appointments || 0,
          completedAppointments: completed || 0,
          revenue: totalRevenue
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-20 text-center font-bold">Cargando estadísticas...</div>;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-10 text-left">
        <h2 className="text-3xl lg:text-4xl font-black tracking-tight text-slate-900">Análisis de Clínica</h2>
        <p className="text-slate-500 font-medium mt-1">Visualiza el rendimiento y crecimiento de tu consultorio</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard title="Total Pacientes" value={stats.totalPatients} icon="group" color="bg-blue-500" />
        <StatCard title="Citas Totales" value={stats.totalAppointments} icon="calendar_today" color="bg-primary" />
        <StatCard title="Citas Completadas" value={stats.completedAppointments} icon="check_circle" color="bg-green-500" />
        <StatCard title="Ingresos Totales" value={`$${stats.revenue.toLocaleString()}`} icon="payments" color="bg-emerald-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm text-left">
          <h3 className="text-xl font-black mb-6">Actividad por Mes</h3>
          <div className="h-64 flex items-end gap-4 px-4">
            {['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'].map((month, i) => (
              <div key={month} className="flex-1 flex flex-col items-center gap-2">
                <div 
                  className="w-full bg-primary/10 rounded-t-xl transition-all hover:bg-primary/20 cursor-help"
                  style={{ height: `${[40, 65, 50, 85, 70, 95][i]}%` }}
                  title={`${[40, 65, 50, 85, 70, 95][i]} citas`}
                />
                <span className="text-[10px] font-black text-slate-400 uppercase">{month}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm text-left">
          <h3 className="text-xl font-black mb-6">Distribución de Motivos</h3>
          <div className="space-y-4">
            <MotivoRow label="Limpieza" percentage={45} color="bg-blue-500" />
            <MotivoRow label="Ortodoncia" percentage={30} color="bg-primary" />
            <MotivoRow label="Urgencias" percentage={15} color="bg-red-500" />
            <MotivoRow label="Otros" percentage={10} color="bg-slate-300" />
          </div>
        </section>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, color }) => (
  <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col justify-between group hover:shadow-lg transition-all text-left">
    <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center text-white mb-6`}>
      <span className="material-symbols-outlined">{icon}</span>
    </div>
    <div>
      <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">{title}</p>
      <h3 className="text-3xl font-black text-slate-900 mt-1">{value}</h3>
    </div>
  </div>
);

const MotivoRow = ({ label, percentage, color }) => (
  <div className="space-y-1">
    <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-slate-500">
      <span>{label}</span>
      <span>{percentage}%</span>
    </div>
    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
      <div className={`h-full ${color}`} style={{ width: `${percentage}%` }} />
    </div>
  </div>
);

export default AdminStats;
