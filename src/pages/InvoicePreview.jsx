import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { motion } from 'framer-motion';

const FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/manage-bill`;

const InvoicePreview = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const printRef = useRef();

  const [factura, setFactura] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFactura = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const res = await fetch(`${FUNCTION_URL}?id=${id}`, {
          headers: {
            'Authorization': `Bearer ${session?.access_token}`,
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          }
        });
        if (!res.ok) throw new Error('Factura no encontrada');
        const data = await res.json();
        setFactura(data);
      } catch (err) {
        console.error(err);
        navigate('/dashboard/recepcionista/facturacion');
      } finally {
        setLoading(false);
      }
    };
    fetchFactura();
  }, [id, navigate]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!factura) return null;

  const isPaid = factura.estado === 'pagado';
  const paciente = factura.pacientes;
  const fechaEmision = new Date(factura.created_at).toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' });
  const fechaServicio = factura.fecha_servicio
    ? new Date(factura.fecha_servicio + 'T00:00:00').toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' })
    : '—';

  return (
    <>
      {/* Estilos de impresión — se inyectan en el <head> via style tag */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #invoice-print, #invoice-print * { visibility: visible; }
          #invoice-print { position: fixed; top: 0; left: 0; width: 100%; }
          .no-print { display: none !important; }
        }
      `}</style>

      <div className="max-w-5xl mx-auto">
        {/* Header de página — no se imprime */}
        <div className="no-print flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-4">
          <div>
            <nav className="flex gap-2 text-xs font-bold text-primary mb-2 tracking-wider">
              <Link to="/dashboard/recepcionista/facturacion" className="opacity-50 hover:opacity-100 transition-opacity uppercase">
                Facturación
              </Link>
              <span className="opacity-30">/</span>
              <span className="uppercase">Factura #{id}</span>
            </nav>
            <h2 className="text-4xl font-extrabold font-headline tracking-tight text-on-surface">
              Factura #{id}
            </h2>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white text-slate-700 font-semibold text-sm shadow-sm hover:bg-slate-50 transition-all cursor-pointer border border-slate-100"
            >
              <span className="material-symbols-outlined text-lg">download</span>
              {t('invoice.download_pdf')}
            </button>
            {paciente?.telefono && (
              <a
                href={`https://wa.me/${paciente.telefono.replace(/\D/g, '')}?text=Hola%20${paciente.nombre}%2C%20adjunto%20su%20factura%20%23${id}%20de%20MOLARIS%20OPS`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-green-100 text-green-700 font-bold text-sm hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg">send</span>
                {t('invoice.send_whatsapp')}
              </a>
            )}
          </div>
        </div>

        {/* Documento imprimible */}
        <div id="invoice-print" ref={printRef} className="grid grid-cols-12 gap-8">
          <div className="col-span-12 lg:col-span-9">
            <div className="bg-white rounded-[2rem] p-8 md:p-16 shadow-[0px_20px_40px_rgba(0,97,164,0.06)] relative overflow-hidden border border-slate-50">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />

              {/* Cabecera del documento */}
              <div className="flex flex-col sm:flex-row justify-between items-start mb-16 relative z-10 gap-8">
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-white">
                      <img src="/favicon.svg" alt="Logo" className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black font-headline tracking-tighter text-on-surface leading-none">MOLARIS OPS</h3>
                      <p className="text-[10px] tracking-[0.2em] font-bold text-slate-400 uppercase">{t('common.clinic_slogan')}</p>
                    </div>
                  </div>
                  <div className="space-y-1 text-slate-500 text-sm font-medium">
                    <p>Av. Principal 123, Suite 400</p>
                    <p>contacto@molarisops.clinic</p>
                    <p>+1 (555) 902-3341</p>
                  </div>
                </div>
                <div className="text-right flex flex-col items-end">
                  <span className={`inline-block px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-6 ${isPaid ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                    {isPaid ? t('billing.status.paid') : t('billing.status.pending')}
                  </span>
                  <div className="space-y-4">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('invoice.date_issued')}</p>
                      <p className="text-on-surface font-semibold">{fechaEmision}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Fecha de Servicio</p>
                      <p className="text-on-surface font-semibold">{fechaServicio}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Info del paciente */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
                <div className="bg-slate-50 p-8 rounded-2xl">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">{t('invoice.bill_to')}</p>
                  <h4 className="text-xl font-bold text-on-surface mb-1">
                    {paciente ? `${paciente.nombre} ${paciente.apellido}` : '—'}
                  </h4>
                  <p className="text-slate-500 text-sm font-medium">{t('invoice.patient_id')}: {paciente?.documento_id || '—'}</p>
                  {paciente?.email && <p className="text-slate-500 text-sm mt-2">{paciente.email}</p>}
                  {paciente?.direccion && <p className="text-slate-500 text-sm">{paciente.direccion}</p>}
                </div>
                <div className="flex flex-col justify-end p-8">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">{t('invoice.practice_details')}</p>
                  <p className="text-slate-500 text-sm font-medium">Factura N°: {factura.id}</p>
                  <p className="text-slate-500 text-sm font-medium">Categoría: {factura.categoria || '—'}</p>
                </div>
              </div>

              {/* Detalle del servicio */}
              <div className="mb-12 overflow-x-auto">
                <div className="min-w-[500px]">
                  <div className="grid grid-cols-12 px-6 pb-4 border-b border-slate-100">
                    <div className="col-span-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('billing.table.description')}</div>
                    <div className="col-span-2 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Cant.</div>
                    <div className="col-span-2 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('billing.table.cost')}</div>
                  </div>
                  <div className="grid grid-cols-12 px-6 py-6 items-center hover:bg-slate-50 rounded-xl transition-colors">
                    <div className="col-span-8">
                      <h5 className="font-bold text-on-surface mb-1">{factura.categoria}</h5>
                      <p className="text-xs text-slate-500">{factura.descripcion || '—'}</p>
                    </div>
                    <div className="col-span-2 text-right text-slate-500 font-medium">1</div>
                    <div className="col-span-2 text-right font-bold text-on-surface">
                      ${new Intl.NumberFormat('es-AR').format(factura.costo)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Total */}
              <div className="flex justify-end">
                <div className="w-full max-w-xs space-y-4">
                  <div className="flex justify-between items-center px-6">
                    <span className="text-slate-500 font-medium">{t('invoice.summary.subtotal')}</span>
                    <span className="font-semibold">${new Intl.NumberFormat('es-AR').format(factura.costo)}</span>
                  </div>
                  <div className="flex justify-between items-center px-6">
                    <span className="text-slate-500 font-medium">{t('invoice.summary.tax')}</span>
                    <span className="font-semibold">$0</span>
                  </div>
                  <div className="h-px bg-slate-100 mx-6" />
                  <div className="flex justify-between items-center px-6 py-4 bg-primary/5 rounded-2xl">
                    <span className="text-primary font-black uppercase tracking-widest text-xs">{t('invoice.summary.total')}</span>
                    <span className="text-2xl font-black font-headline text-primary">
                      ${new Intl.NumberFormat('es-AR').format(factura.costo)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-16 pt-8 border-t border-slate-100 text-center">
                <p className="text-xs text-slate-500 leading-relaxed italic">{t('invoice.footer')}</p>
              </div>
            </div>
          </div>

          {/* Sidebar — no esencial en impresión */}
          <div className="col-span-12 lg:col-span-3 space-y-6 no-print">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-50">
              <h4 className="text-sm font-bold mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-lg">history</span>
                {t('invoice.history.title')}
              </h4>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isPaid ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'}`}>
                  <span className="material-symbols-outlined text-xl">{isPaid ? 'check' : 'pending'}</span>
                </div>
                <div>
                  <p className="text-xs font-bold">{isPaid ? t('invoice.history.received') : 'Pendiente de pago'}</p>
                  <p className="text-[10px] text-slate-500">{fechaEmision}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default InvoicePreview;