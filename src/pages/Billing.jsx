import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useToast } from '../components/ToastContext';
import PatientSearch from '../components/PatientSearch';
import ConfirmModal from '../components/ConfirmModal';

const FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/manage-bill`;

const getAuthHeaders = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return {
    'Authorization': `Bearer ${session?.access_token}`,
    'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
    'Content-Type': 'application/json',
  };
};

const EMPTY_FORM = {
  paciente: '',
  cita_id: null,
  categoria: 'Consulta General',
  descripcion: '',
  costo: 0,
  fecha_servicio: new Date().toISOString().split('T')[0],
  estado: 'pendiente',
};

const CATEGORIAS = [
  'Consulta General',
  'Endodoncia',
  'Odontología Estética',
  'Ortodoncia',
  'Limpieza Dental',
  'Extracción',
  'Blanqueamiento',
  'Urgencia',
];

const Billing = () => {
  const { t } = useTranslation();
  const { addToast } = useToast();

  const [facturas, setFacturas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFactura, setEditingFactura] = useState(null); 
  const [confirmConfig, setConfirmConfig] = useState({ isOpen: false, id: null });
  const [filterStatus, setFilterStatus] = useState('all');

  const fetchFacturas = useCallback(async () => {
    setLoading(true);
    try {
      const headers = await getAuthHeaders();
      const res = await fetch(FUNCTION_URL, { headers });
      if (!res.ok) throw new Error('Error al cargar facturas');
      const data = await res.json();
      setFacturas(data);
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => { fetchFacturas(); }, [fetchFacturas]);

  const totalOutstanding = facturas
    .filter(f => f.estado === 'pendiente')
    .reduce((acc, f) => acc + Number(f.costo), 0);

  const totalRevenue = facturas
    .filter(f => f.estado === 'pagado')
    .reduce((acc, f) => acc + Number(f.costo), 0);

  const filtradas = facturas.filter(f => {
    if (filterStatus === 'all') return true;
    return f.estado === filterStatus;
  });

  const handleOpenCreate = () => { setEditingFactura(null); setIsModalOpen(true); };
  const handleOpenEdit = (factura) => { setEditingFactura(factura); setIsModalOpen(true); };
  const handleDelete = (id) => setConfirmConfig({ isOpen: true, id });

  const handleSave = async (formData) => {
    try {
      const headers = await getAuthHeaders();
      const isEdit = !!editingFactura;
      const url = isEdit ? `${FUNCTION_URL}?id=${editingFactura.id}` : FUNCTION_URL;
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, { method, headers, body: JSON.stringify(formData) });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Error al guardar');
      }
      addToast(isEdit ? 'Factura actualizada' : 'Factura creada', 'success');
      setIsModalOpen(false);
      await fetchFacturas();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleConfirmDelete = async () => {
    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`${FUNCTION_URL}?id=${confirmConfig.id}`, { method: 'DELETE', headers });
      if (!res.ok) throw new Error('Error al eliminar');
      addToast('Factura eliminada', 'success');
      await fetchFacturas();
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setConfirmConfig({ isOpen: false, id: null });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-0">
      {/* Header */}
      <section className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-on-surface">{t('billing.title')}</h2>
          <p className="text-slate-500 font-medium opacity-70">{t('billing.subtitle')}</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-primary text-white font-black shadow-xl shadow-blue-200 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
            {t('billing.new_invoice')}
          </button>
        </div>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="sm:col-span-2 p-8 rounded-[2.5rem] bg-gradient-to-br from-blue-700 to-blue-500 text-white shadow-2xl shadow-blue-100 flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-blue-100 font-bold text-xs uppercase tracking-widest mb-2 opacity-80">{t('billing.stats.outstanding')}</p>
            <h3 className="text-4xl lg:text-5xl font-black tracking-tighter">
              ${new Intl.NumberFormat('es-AR').format(totalOutstanding)}
            </h3>
          </div>
          <div className="relative z-10 mt-8">
            <p className="text-blue-100 text-xs font-medium">
              {facturas.filter(f => f.estado === 'pendiente').length} facturas pendientes
            </p>
          </div>
          <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
        </div>

        <div className="p-8 rounded-[2.5rem] bg-white shadow-sm border border-slate-50 flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-green-50 flex items-center justify-center text-green-600 mb-6">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>     
            </div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">{t('billing.stats.revenue_mtd')}</p> 
            <h3 className="text-2xl font-black text-slate-900">${new Intl.NumberFormat('es-AR').format(totalRevenue)}</h3>
          </div>
        </div>

        <div className="p-8 rounded-[2.5rem] bg-white shadow-sm border border-slate-50 flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 mb-6">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>receipt_long</span>     
            </div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Total Facturas</p>
            <h3 className="text-2xl font-black text-slate-900">{facturas.length}</h3>
          </div>
        </div>
      </section>

      {/* Tabla */}
      <section className="bg-white rounded-[2.5rem] shadow-sm overflow-hidden border border-slate-100">
        <div className="p-8 border-b border-slate-50 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-4 overflow-x-auto no-scrollbar pb-2 lg:pb-0">
            <h3 className="font-black text-xl px-2 whitespace-nowrap">{t('billing.table.recent')}</h3>
            <div className="flex gap-2">
              {[['all', 'Todos'], ['pagado', t('billing.status.paid')], ['pendiente', t('billing.status.pending')]].map(([val, label]) => (
                <button
                  key={val}
                  onClick={() => setFilterStatus(val)}
                  className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${filterStatus === val ? 'bg-primary text-white shadow-md shadow-primary/20' : 'bg-slate-50 text-slate-400 hover:text-slate-600'}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto no-scrollbar">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          ) : filtradas.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-300 gap-4">
              <span className="material-symbols-outlined text-6xl opacity-20">receipt_long</span>
              <p className="font-bold italic text-slate-400 text-sm">No hay facturas para mostrar.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="text-[10px] uppercase tracking-widest text-slate-400 font-black bg-slate-50/50">
                  <th className="px-8 py-5">{t('billing.table.patient')}</th>
                  <th className="px-6 py-5">{t('billing.table.description')}</th>
                  <th className="px-6 py-5">{t('billing.table.cost')}</th>
                  <th className="px-6 py-5">{t('billing.table.date')}</th>
                  <th className="px-6 py-5 text-center">{t('billing.table.status')}</th>
                  <th className="px-8 py-5 text-right">{t('billing.table.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtradas.map((factura) => (
                  <InvoiceRow
                    key={factura.id}
                    factura={factura}
                    onEdit={() => handleOpenEdit(factura)}
                    onDelete={() => handleDelete(factura.id)}
                  />
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {/* Modal crear/editar */}
      <InvoiceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        factura={editingFactura}
      />

      {/* Confirm delete */}
      <ConfirmModal
        isOpen={confirmConfig.isOpen}
        onClose={() => setConfirmConfig({ isOpen: false, id: null })}
        onConfirm={handleConfirmDelete}
        title="¿Eliminar factura?"
        message="Esta acción eliminará la factura permanentemente."
        type="danger"
      />
    </div>
  );
};

// ─── Fila de tabla ────────────────────────────────────────────────────────────
const InvoiceRow = ({ factura, onEdit, onDelete }) => {
  const isPaid = factura.estado === 'pagado';
  const statusColor = isPaid ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700';
  const dotColor = isPaid ? 'bg-green-500' : 'bg-amber-500';
  const nombre = factura.pacientes
    ? `${factura.pacientes.nombre} ${factura.pacientes.apellido}`
    : 'Paciente';

  const displayId = String(factura.id).includes('-') ? factura.id.slice(0, 8) : factura.id;

  return (
    <tr className="group hover:bg-blue-50/30 transition-colors">
      <td className="px-8 py-6 whitespace-nowrap">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xs uppercase"> 
            {factura.pacientes?.nombre?.[0]}{factura.pacientes?.apellido?.[0]}
          </div>
          <div>
            <p className="font-bold text-slate-900">{nombre}</p>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">#{displayId}</p>
          </div>
        </div>
      </td>
      <td className="px-6 py-6">
        <p className="text-slate-600 font-medium text-sm">{factura.descripcion || factura.categoria || '—'}</p>
        <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">{factura.categoria}</p>
      </td>
      <td className="px-6 py-6 whitespace-nowrap">
        <p className="font-black text-slate-900">${new Intl.NumberFormat('es-AR').format(factura.costo)}</p>
      </td>
      <td className="px-6 py-6 whitespace-nowrap text-slate-400 font-bold text-xs uppercase">
        {factura.fecha_servicio
          ? new Date(factura.fecha_servicio + 'T00:00:00').toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })
          : '—'}
      </td>
      <td className="px-6 py-6 whitespace-nowrap">
        <div className="flex justify-center">
          <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${statusColor}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
            {isPaid ? 'Pagado' : 'Pendiente'}
          </span>
        </div>
      </td>
      <td className="px-8 py-6 whitespace-nowrap text-right">
        <div className="flex justify-end gap-2 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
          <Link
            to={`/dashboard/recepcionista/facturacion/invoice/${factura.id}`}
            className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-primary transition-all hover:bg-white rounded-xl shadow-sm border border-transparent hover:border-slate-100"
            title="Ver"
          >
            <span className="material-symbols-outlined text-[20px]">visibility</span>
          </Link>
          <button
            onClick={onEdit}
            className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-primary transition-all hover:bg-white rounded-xl shadow-sm border border-transparent hover:border-slate-100 cursor-pointer"
            title="Editar"
          >
            <span className="material-symbols-outlined text-[20px]">edit</span>
          </button>
          <button
            onClick={onDelete}
            className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-red-500 transition-all hover:bg-red-50 rounded-xl shadow-sm border border-transparent hover:border-red-100 cursor-pointer"
            title="Eliminar"
          >
            <span className="material-symbols-outlined text-[20px]">delete</span>
          </button>
        </div>
      </td>
    </tr>
  );
};

// ─── Modal Crear / Editar ─────────────────────────────────────────────────────
const InvoiceModal = ({ isOpen, onClose, onSave, factura }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [citas, setCitas] = useState([]);
  const [loadingCitas, setLoadingCitas] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [displayCosto, setDisplayCosto] = useState('0');

  const formatMoney = (value) => {
    if (value === undefined || value === null || value === '') return '';
    return new Intl.NumberFormat('es-AR').format(value);
  };

  const parseMoney = (value) => {
    return parseFloat(String(value).replace(/\./g, '').replace(/,/g, '.')) || 0;
  };

  // Cuando cambia el paciente, traemos sus citas
  useEffect(() => {
    const fetchCitasPaciente = async () => {
      if (!selectedPatient) {
        setCitas([]);
        return;
      }
      setLoadingCitas(true);
      try {
        const { data, error } = await supabase
          .from('citas')
          .select(`
            id, 
            fecha_hora, 
            motivo_id, 
            motivos_consulta:motivo_id (nombre, costo_base)
          `)
          .eq('paciente_id', selectedPatient.id)
          .order('fecha_hora', { ascending: false })
          .limit(10);

        if (!error) setCitas(data || []);
      } catch (err) {
        console.error("Error fetching citas:", err);
      } finally {
        setLoadingCitas(false);
      }
    };

    fetchCitasPaciente();
  }, [selectedPatient]);

  // Pre-llenado en edición
  useEffect(() => {
    if (factura) {
      const costoVal = factura.costo ?? 0;
      setFormData({
        paciente: factura.paciente,
        cita_id: factura.cita_id,
        categoria: factura.categoria || 'Consulta General',
        descripcion: factura.descripcion || '',
        costo: costoVal,
        fecha_servicio: factura.fecha_servicio || new Date().toISOString().split('T')[0],
        estado: factura.estado || 'pendiente',
      });
      setDisplayCosto(formatMoney(costoVal));
      setSelectedPatient(factura.pacientes || null);
    } else {
      setFormData(EMPTY_FORM);
      setDisplayCosto('0');
      setSelectedPatient(null);
    }
  }, [factura, isOpen]);

  const handleCitaSelect = (citaId) => {
    const cita = citas.find(c => c.id === citaId);
    if (cita) {
      const costo = cita.motivos_consulta?.costo_base || 0;
      setFormData(prev => ({
        ...prev,
        cita_id: citaId,
        categoria: cita.motivos_consulta?.nombre || prev.categoria,
        costo: costo,
        fecha_servicio: cita.fecha_hora.split('T')[0],
      }));
      setDisplayCosto(formatMoney(costo));
    }
  };

  const handleSubmit = async () => {
    if (!formData.paciente) return;
    setSubmitting(true);
    try {
      await onSave(formData);
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = "w-full px-5 py-3.5 bg-white border-2 border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/5 rounded-2xl text-sm font-bold transition-all placeholder:text-slate-300 outline-none text-slate-900";
  const labelClass = "text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 mb-1 block";

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="px-10 pt-10 pb-6 shrink-0 flex justify-between items-center border-b border-slate-50">
              <div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                  {factura ? 'Editar Factura' : t('billing.modal.title')}
                </h3>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">
                  {factura ? `#${String(factura.id).includes('-') ? factura.id.slice(0,8) : factura.id}` : t('billing.modal.subtitle')}
                </p>
              </div>
              <button onClick={onClose} className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-10 py-8 space-y-6 no-scrollbar">
              {/* Paciente */}
              <div>
                <label className={labelClass}>{t('billing.modal.selection')}</label>
                <PatientSearch
                  selectedPatient={selectedPatient}
                  onSelect={(p) => {
                    setSelectedPatient(p);
                    setFormData(prev => ({ ...prev, paciente: p.id }));
                  }}
                />
              </div>

              {/* Selección de Cita */}
              {selectedPatient && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                  <label className={labelClass}>Vincular a Cita (Opcional)</label>
                  {loadingCitas ? (
                    <div className="py-2 flex justify-center"><motion.div animate={{rotate:360}} transition={{repeat:Infinity, duration:1, ease:'linear'}} className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full" /></div>
                  ) : citas.length > 0 ? (
                    <select
                      value={formData.cita_id || ''}
                      onChange={e => handleCitaSelect(e.target.value)}
                      className={inputClass}
                    >
                      <option value="">— Elegir una cita reciente —</option>
                      {citas.map(c => (
                        <option key={c.id} value={c.id}>
                          {new Date(c.fecha_hora).toLocaleDateString()} - {c.motivos_consulta?.nombre}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-[10px] font-bold text-slate-400 bg-slate-50 p-3 rounded-xl">El paciente no tiene citas registradas.</p>
                  )}
                </motion.div>
              )}

              {/* Categoría */}
              <div>
                <label className={labelClass}>{t('billing.modal.category')}</label>
                <select
                  value={formData.categoria}
                  onChange={e => setFormData(prev => ({ ...prev, categoria: e.target.value }))}
                  className={inputClass}
                >
                  {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {/* Descripción */}
              <div>
                <label className={labelClass}>{t('billing.modal.treatment_desc')}</label>
                <textarea
                  value={formData.descripcion}
                  onChange={e => setFormData(prev => ({ ...prev, descripcion: e.target.value }))}
                  rows={3}
                  placeholder="Detalle del tratamiento realizado..."
                  className={`${inputClass} resize-none`}
                />
              </div>

              {/* Costo y Fecha */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>{t('billing.modal.total_cost')}</label>
                  <div className="relative">
                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                    <input
                      type="text"
                      value={displayCosto}
                      onFocus={(e) => {
                        if (parseMoney(e.target.value) === 0) setDisplayCosto('');
                      }}
                      onBlur={(e) => {
                        const val = parseMoney(e.target.value);
                        setFormData({ ...formData, costo: val });
                        setDisplayCosto(formatMoney(val));
                      }}
                      onChange={(e) => {
                        const rawValue = e.target.value.replace(/[^\d]/g, '');
                        const numericValue = parseInt(rawValue) || 0;
                        setDisplayCosto(formatMoney(numericValue));
                      }}
                      placeholder="0"
                      className={`${inputClass} pl-10`}
                    />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>{t('billing.modal.service_date')}</label>
                  <input
                    type="date"
                    value={formData.fecha_servicio}
                    onChange={e => setFormData(prev => ({ ...prev, fecha_servicio: e.target.value }))}
                    className={inputClass}
                  />
                </div>
              </div>

              {/* Estado */}
              <div>
                <label className={labelClass}>{t('billing.modal.initial_status')}</label>
                <div className="flex gap-4">
                  {[['pendiente', 'Pendiente', 'pending', 'primary'], ['pagado', 'Pagado', 'payments', 'green-500']].map(([val, label, icon]) => (
                    <label key={val} className="flex-1 cursor-pointer">
                      <input
                        type="radio"
                        name="estado"
                        value={val}
                        checked={formData.estado === val}
                        onChange={() => setFormData(prev => ({ ...prev, estado: val }))}
                        className="hidden"
                      />
                      <div className={`p-5 border-2 rounded-2xl text-center transition-all ${formData.estado === val ? (val === 'pagado' ? 'border-green-500 bg-green-50' : 'border-primary bg-primary/5') : 'border-slate-100 bg-slate-50'}`}>
                        <span className={`material-symbols-outlined block mb-1 ${formData.estado === val ? (val === 'pagado' ? 'text-green-600' : 'text-primary') : 'text-slate-400'}`}>{icon}</span>
                        <span className="text-xs font-black uppercase tracking-widest">{label}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-10 py-8 shrink-0 flex gap-4 border-t border-slate-50">
              <button onClick={onClose} className="flex-1 py-4 text-slate-400 hover:text-slate-600 font-black rounded-2xl border-2 border-slate-100 hover:border-slate-200 transition-all text-xs uppercase tracking-widest">
                {t('billing.modal.discard')}
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting || !formData.paciente}
                className="flex-[2] bg-primary text-white py-4 rounded-2xl font-black shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 text-xs uppercase tracking-widest flex items-center justify-center gap-2"
              >
                {submitting && <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} className="w-4 h-4 border-2 border-white border-t-transparent rounded-full" />}
                {factura ? 'Guardar Cambios' : t('billing.modal.create')}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default Billing;