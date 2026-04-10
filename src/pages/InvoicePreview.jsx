import React from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, Link } from 'react-router-dom';

const InvoicePreview = () => {
  const { t } = useTranslation();
  const { id } = useParams();

  return (
    <div className="max-w-5xl mx-auto">
      {/* Page Header & Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-4">
        <div>
          <nav className="flex gap-2 text-xs font-bold text-primary mb-2 tracking-wider">
            <Link to="/billing" className="opacity-50 hover:opacity-100 transition-opacity uppercase">{t('common.billing')}</Link>
            <span className="opacity-30">/</span>
            <span className="uppercase">{t('invoice.preview_title')}</span>
          </nav>
          <h2 className="text-4xl font-extrabold font-headline tracking-tight text-on-surface">Factura #INV-2026-{id || '001'}</h2>
        </div>
        <div className="flex flex-wrap gap-3">
          <button className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white text-slate-700 font-semibold text-sm shadow-sm hover:bg-slate-50 transition-all cursor-pointer">
            <span className="material-symbols-outlined text-lg">print</span>
            {t('common.actions.print')}
          </button>
          <button className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white text-slate-700 font-semibold text-sm shadow-sm hover:bg-slate-50 transition-all cursor-pointer">
            <span className="material-symbols-outlined text-lg">download</span>
            {t('invoice.download_pdf')}
          </button>
          <button className="flex items-center gap-2 px-6 py-3 rounded-xl bg-green-100 text-green-700 font-bold text-sm hover:scale-[1.02] active:scale-95 transition-all cursor-pointer">
            <span className="material-symbols-outlined text-lg">send</span>
            {t('invoice.send_whatsapp')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Invoice Document Paper */}
        <div className="col-span-12 lg:col-span-9">
          <div className="bg-white rounded-[2rem] p-8 md:p-16 shadow-[0px_20px_40px_rgba(0,97,164,0.06)] relative overflow-hidden border border-slate-50">
            {/* Subtle brand watermark */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
            
            {/* Document Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start mb-20 relative z-10 gap-8">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-white">
                    <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>dentistry</span>
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
                <span className="inline-block px-4 py-1.5 rounded-full bg-green-100 text-green-700 text-xs font-black uppercase tracking-widest mb-6">
                    {t('billing.status.paid')}
                </span>
                <div className="space-y-4">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('invoice.date_issued')}</p>
                    <p className="text-on-surface font-semibold">24 Oct, 2026</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('invoice.due_date')}</p>
                    <p className="text-on-surface font-semibold">24 Oct, 2026</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Client Info Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20">
              <div className="bg-slate-50 p-8 rounded-2xl">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">{t('invoice.bill_to')}</p>
                <h4 className="text-xl font-bold text-on-surface font-headline mb-1">Sarah Jenkins</h4>
                <p className="text-slate-500 text-sm font-medium">{t('invoice.patient_id')}: #DT-9482</p>
                <p className="text-slate-500 text-sm mt-4">Calle Roble 482, Apt 4C<br/>Ciudad, CP 97204</p>
              </div>
              <div className="flex flex-col justify-end p-8">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">{t('invoice.practice_details')}</p>
                <p className="text-slate-500 text-sm font-medium">{t('invoice.npi')}: 1948203112</p>
                <p className="text-slate-500 text-sm font-medium">{t('invoice.tax_id')}: 94-220139</p>
              </div>
            </div>

            {/* Services Table */}
            <div className="mb-12 overflow-x-auto">
              <div className="min-w-[600px]">
                <div className="grid grid-cols-12 px-6 pb-4 border-b border-slate-100">
                  <div className="col-span-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('billing.table.description')}</div>
                  <div className="col-span-2 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Cantidad</div>
                  <div className="col-span-2 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('billing.table.cost')}</div>
                </div>
                <div className="space-y-0">
                  <ServiceRow title="Tratamiento de Conducto" desc="Diente #14 - Tratamiento endodóntico" qty="1" amount="$850.00" />
                  <ServiceRow title="Corona de Porcelana" desc="Ajuste de corona estética personalizada" qty="1" amount="$600.00" />
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="flex justify-end">
              <div className="w-full max-w-xs space-y-4">
                <div className="flex justify-between items-center px-6">
                  <span className="text-slate-500 font-medium">{t('invoice.summary.subtotal')}</span>
                  <span className="font-semibold text-on-surface">$1,450.00</span>
                </div>
                <div className="flex justify-between items-center px-6">
                  <span className="text-slate-500 font-medium">{t('invoice.summary.tax')}</span>
                  <span className="font-semibold text-on-surface">$0.00</span>
                </div>
                <div className="h-[1px] bg-slate-100 mx-6"></div>
                <div className="flex justify-between items-center px-6 py-4 bg-primary/5 rounded-2xl">
                  <span className="text-primary font-black uppercase tracking-widest text-xs">{t('invoice.summary.total')}</span>
                  <span className="text-2xl font-black font-headline text-primary">$1,450.00</span>
                </div>
              </div>
            </div>

            {/* Footer Note */}
            <div className="mt-20 pt-8 border-t border-slate-100 text-center">
              <p className="text-xs text-slate-500 leading-relaxed italic">
                {t('invoice.footer')}
              </p>
            </div>
          </div>
        </div>

        {/* Sidebar Context */}
        <div className="col-span-12 lg:col-span-3 space-y-6">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-50">
                <h4 className="text-sm font-bold text-on-surface font-headline mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-lg">history</span>
                    {t('invoice.history.title')}
                </h4>
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                            <span className="material-symbols-outlined text-xl">check</span>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-on-surface">{t('invoice.history.received')}</p>
                            <p className="text-[10px] text-slate-500">24 Oct, 2026 • Visa ****4291</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-50">
                <h4 className="text-sm font-bold text-on-surface font-headline mb-4">Acciones Rápidas</h4>
                <div className="space-y-2">
                    <QuickActionItem label="Agregar Nota Interna" icon="chevron_right" />
                    <QuickActionItem label="Ver Plan de Tratamiento" icon="chevron_right" />
                    <QuickActionItem label="Anular Factura" icon="delete" danger />
                </div>
            </div>

            <div className="rounded-3xl overflow-hidden relative h-48 shadow-sm group border border-slate-50">
                <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuBG-kqzgJCKgTkPVZZzwRxXQuFtEgwoVfgtXxRz2QhaJLweOdx1oFIe5YSxyK3fM9PCCFoH3KUSC4dY6ZEuFnBPM37YISH6POwdSI5bqcn8JjhZaE5t1lMB4zEw2XUJyuugzcZuTBCyUQdEBPyCkM7MpAz22rrVtYdX2lgqbfjG1PCQ5bt1y5wO4mACKhmLOkYH8mwCePiVKTN9zrcKdFh46M7C3kubnbfqh6mxk0dKw1yzmq3csCnxoEZLSTOKvrnhxtYYNwon" alt="Clinic" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                    <p className="text-white text-xs font-bold leading-tight">La comodidad del paciente es nuestra prioridad. <br/><span className="opacity-70 font-medium">Reserva tu próximo chequeo hoy.</span></p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

const ServiceRow = ({ title, desc, qty, amount }) => (
  <div className="grid grid-cols-12 px-6 py-6 hover:bg-slate-50 transition-colors rounded-xl items-center">
    <div className="col-span-8">
      <h5 className="font-bold text-on-surface mb-1">{title}</h5>
      <p className="text-xs text-slate-500">{desc}</p>
    </div>
    <div className="col-span-2 text-right text-slate-500 font-medium">{qty}</div>
    <div className="col-span-2 text-right font-bold text-on-surface">{amount}</div>
  </div>
);

const QuickActionItem = ({ label, icon, danger }) => (
  <button className={`w-full text-left px-4 py-3 rounded-xl hover:bg-slate-50 transition-colors text-sm font-semibold flex items-center justify-between cursor-pointer ${danger ? 'text-red-500' : 'text-slate-600'}`}>
    {label}
    <span className="material-symbols-outlined text-sm">{icon}</span>
  </button>
);

export default InvoicePreview;
