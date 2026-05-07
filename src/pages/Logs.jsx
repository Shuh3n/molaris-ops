import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../components/ToastContext';

const Logs = () => {
  const { t } = useTranslation();
  const { addToast } = useToast();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  
  // Filters
  const [filters, setFilters] = useState({
    accion: 'all',
    entidad_tipo: 'all',
    fecha_desde: '',
    fecha_hasta: ''
  });

  const fetchLogs = useCallback(async (clinicaId) => {
    setLoading(true);
    try {
      let query = supabase
        .from('logs_actividad')
        .select(`
          *,
          perfiles (nombre_completo)
        `)
        .eq('clinica_id', clinicaId)
        .order('creado_en', { ascending: false });

      if (filters.accion !== 'all') {
        query = query.eq('accion', filters.accion);
      }
      if (filters.entidad_tipo !== 'all') {
        query = query.eq('entidad_tipo', filters.entidad_tipo);
      }
      if (filters.fecha_desde) {
        query = query.gte('creado_en', `${filters.fecha_desde}T00:00:00`);
      }
      if (filters.fecha_hasta) {
        query = query.lte('creado_en', `${filters.fecha_hasta}T23:59:59`);
      }

      const { data, error } = await query.limit(100);
      
      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      console.error("Error fetching logs:", error);
      addToast('Error al cargar el historial', 'error');
    } finally {
      setLoading(false);
    }
  }, [filters, addToast]);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: profile } = await supabase
          .from('perfiles')
          .select('clinica_id')
          .eq('id', session.user.id)
          .single();
        setUserProfile(profile);
      }
    };
    checkUser();
  }, []);

  useEffect(() => {
    if (userProfile?.clinica_id) {
      fetchLogs(userProfile.clinica_id);
    }
  }, [userProfile, fetchLogs]);

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const getActionBadge = (accion) => {
    switch (accion) {
      case 'creacion': return 'bg-green-100 text-green-700';
      case 'actualizacion': return 'bg-blue-100 text-blue-700';
      case 'borrado': return 'bg-red-100 text-red-700';
      case 'cambio_estado': return 'bg-purple-100 text-purple-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-0 text-left">
      <header className="mb-10">
        <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900 mb-2">{t('logs.title')}</h2>
        <p className="text-slate-500 font-medium leading-relaxed">{t('logs.subtitle')}</p>
      </header>

      {/* Filters Section */}
      <div className="bg-white p-4 sm:p-6 rounded-[2rem] shadow-sm border border-slate-100 mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="space-y-1">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{t('logs.filters.action')}</label>
          <select 
            value={filters.accion}
            onChange={(e) => handleFilterChange('accion', e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold focus:ring-2 focus:ring-primary/10 outline-none transition-all"
          >
            <option value="all">{t('logs.filters.all_actions')}</option>
            <option value="creacion">{t('logs.actions.creacion')}</option>
            <option value="actualizacion">{t('logs.actions.actualizacion')}</option>
            <option value="borrado">{t('logs.actions.borrado')}</option>
            <option value="cambio_estado">{t('logs.actions.cambio_estado')}</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{t('logs.filters.entity')}</label>
          <select 
            value={filters.entidad_tipo}
            onChange={(e) => handleFilterChange('entidad_tipo', e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold focus:ring-2 focus:ring-primary/10 outline-none transition-all"
          >
            <option value="all">{t('logs.filters.all_entities')}</option>
            <option value="citas">Citas</option>
            <option value="pacientes">Pacientes</option>
            <option value="facturas">Facturas</option>
            <option value="perfiles">Perfiles</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{t('logs.filters.from')}</label>
          <input 
            type="date"
            value={filters.fecha_desde}
            onChange={(e) => handleFilterChange('fecha_desde', e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold focus:ring-2 focus:ring-primary/10 outline-none transition-all"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{t('logs.filters.until')}</label>
          <input 
            type="date"
            value={filters.fecha_hasta}
            onChange={(e) => handleFilterChange('fecha_hasta', e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold focus:ring-2 focus:ring-primary/10 outline-none transition-all"
          />
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400">
                <th className="px-6 py-4 text-left font-black">{t('logs.table.date')}</th>
                <th className="px-6 py-4 text-left font-black">{t('logs.table.user')}</th>
                <th className="px-6 py-4 text-left font-black">{t('logs.table.action')}</th>
                <th className="px-6 py-4 text-left font-black">{t('logs.table.entity')}</th>
                <th className="px-6 py-4 text-left font-black">{t('logs.table.details')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-20 text-center">
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full mx-auto" />
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-20 text-center text-slate-300 italic font-medium">No se encontraron registros que coincidan con los filtros.</td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-xs font-bold text-slate-700">{new Date(log.creado_en).toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-primary/5 flex items-center justify-center text-primary text-[10px] font-black">
                          {log.perfiles?.nombre_completo?.charAt(0) || 'S'}
                        </div>
                        <span className="text-xs font-bold text-slate-600">{log.perfiles?.nombre_completo || 'Sistema'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${getActionBadge(log.accion)}`}>
                        {t(`logs.actions.${log.accion}`)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-xs font-bold text-slate-500 capitalize">{log.entidad_tipo}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-[10px] font-medium text-slate-400 line-clamp-1 max-w-[150px] sm:max-w-xs group-hover:line-clamp-none transition-all">
                        {log.detalles ? JSON.stringify(log.detalles) : 'Sin detalles adicionales'}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Logs;
