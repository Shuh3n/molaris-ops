import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

const Billing = () => {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="max-w-7xl mx-auto">
      {/* Dashboard Header Section */}
      <section className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-4xl font-extrabold tracking-tight text-on-surface">{t('billing.title')}</h2>
          <p className="text-slate-500 font-medium opacity-70">{t('billing.subtitle')}</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-on-surface font-semibold shadow-sm hover:bg-slate-50 transition-all border border-slate-100 cursor-pointer">
            <span className="material-symbols-outlined text-[20px]">file_download</span> {t('common.export')}
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-primary text-white font-bold shadow-xl shadow-blue-200 hover:shadow-blue-300 transition-all active:scale-95 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">add</span> {t('billing.new_invoice')}
          </button>
        </div>
      </section>

      {/* Bento Stats Grid */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <div className="md:col-span-2 p-8 rounded-[2rem] bg-gradient-to-br from-blue-700 to-blue-500 text-white shadow-2xl shadow-blue-100 flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-blue-100 font-medium text-sm mb-1">{t('billing.stats.outstanding')}</p>
            <h3 className="text-5xl font-extrabold tracking-tighter">$24,840.00</h3>
          </div>
          <div className="relative z-10 flex items-center gap-4 mt-8">
            <div className="flex items-center gap-1 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold">
              <span className="material-symbols-outlined text-[14px]">trending_up</span> +12% vs last month
            </div>
            <p className="text-blue-100 text-xs">{t('billing.stats.pending_desc')}</p>
          </div>
          {/* Decorative element */}
          <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
        </div>
        
        <div className="p-6 rounded-[2rem] bg-white shadow-sm border border-slate-50 flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-green-50 flex items-center justify-center text-green-600 mb-4">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            </div>
            <p className="text-slate-500 text-sm font-medium">{t('billing.stats.revenue_mtd')}</p>
            <h3 className="text-2xl font-bold text-on-surface">$12,450</h3>
          </div>
          <div className="h-1 bg-slate-100 rounded-full overflow-hidden mt-4">
            <div className="h-full bg-green-500 w-[75%]"></div>
          </div>
        </div>

        <div className="p-6 rounded-[2rem] bg-white shadow-sm border border-slate-50 flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 mb-4">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>error</span>
            </div>
            <p className="text-slate-500 text-sm font-medium">{t('billing.stats.overdue')}</p>
            <h3 className="text-2xl font-bold text-on-surface">$3,120</h3>
          </div>
          <p className="text-[10px] text-amber-600 font-bold uppercase tracking-widest">{t('billing.stats.action_required')}</p>
        </div>
      </section>

      {/* Invoice Table Container */}
      <section className="bg-white rounded-[2rem] shadow-sm overflow-hidden border border-slate-50">
        <div className="p-6 border-b border-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4 overflow-x-auto no-scrollbar">
            <h3 className="font-bold text-lg px-2 whitespace-nowrap">{t('billing.table.recent')}</h3>
            <div className="flex gap-2">
              <StatusChip label="Todos" active />
              <StatusChip label={t('billing.status.paid')} />
              <StatusChip label={t('billing.status.pending')} />
            </div>
          </div>
          <button className="text-primary font-bold text-sm hover:underline cursor-pointer whitespace-nowrap">{t('billing.table.view_all')}</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[10px] uppercase tracking-widest text-slate-400 font-bold bg-slate-50/50">
                <th className="px-8 py-4">{t('billing.table.patient')}</th>
                <th className="px-6 py-4">{t('billing.table.description')}</th>
                <th className="px-6 py-4">{t('billing.table.cost')}</th>
                <th className="px-6 py-4">{t('billing.table.date')}</th>
                <th className="px-6 py-4 text-center">{t('billing.table.status')}</th>
                <th className="px-8 py-4 text-right">{t('billing.table.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              <InvoiceRow 
                name="Sarah Jenkins" 
                id="DT-9482" 
                desc="Endodoncia y Corona de Porcelana" 
                cost="$1,450.00" 
                date="24 Oct, 2026" 
                status="Pagado" 
                statusColor="bg-green-100 text-green-700" 
                dotColor="bg-green-500"
                img="https://lh3.googleusercontent.com/aida-public/AB6AXuBOL1w-pP5ODDcSnbrGKC7KyYjp7yK7QfldaqWCkNvOceAUmatA5hQJDdpDLaGdl3yBP2tbU7h9CcH6jABVKOHklZ1lCgvcCc_O1h3KFfmg1ZmXURGTSA6quIc-wAl-18Njj_v4ZTj79F_NXgAcDFSKkH0peH_pPJtLcMOc4G6HVC-UGIUf_165xJxVjSiki0AYS8ai1U4y4zZ82tIMg-OyKAdL7svpClqu4JuaY4dj1xuYLLG5L3FdPXf0stXjoF_tS1mRwfzh"
              />
              <InvoiceRow 
                name="Michael Ross" 
                id="DT-9510" 
                desc="Limpieza Completa y Blanqueamiento" 
                cost="$320.00" 
                date="22 Oct, 2026" 
                status="Pendiente" 
                statusColor="bg-amber-100 text-amber-700" 
                dotColor="bg-amber-500"
                img="https://lh3.googleusercontent.com/aida-public/AB6AXuCSHqxi-wIFvZlkpix8sdXCMfCWvy0jaPvTUVWhmRoVSnzL7-GR27MIZMAZltKWtwC7fF-zJL7WbFeu6r5zpSvp6qCIjVqQpao8Jq87r_XpaDKMtwjM8GDNVqvrLs_CR2BQ4VItbVDDxRl6jpKgsG6WD90Jtv29DwqWxnB1zkEEq4nVZ8pjRASlvR9vn29QIJLmlWteT0rDxccOo2TPb2Z4EqAwJTRVP84TcM811-u_-nKDwnTebrHBcei_PRwUNyaUQVlgdc73"
              />
              <InvoiceRow 
                name="Jessica Thompson" 
                id="DT-8821" 
                desc="Extracción de Muela del Juicio" 
                cost="$550.00" 
                date="20 Oct, 2026" 
                status="Pagado" 
                statusColor="bg-green-100 text-green-700" 
                dotColor="bg-green-500"
                img="https://lh3.googleusercontent.com/aida-public/AB6AXuDUUDiKAF8jbAr82UpYxMJf15GFbnOudsxdV8QgHSuvJzCVAOjjaNAKmZcCMoid9onha9uYij23VLvLMacwXigAJWLDIREcP0mlRd6U7KkNWfhtrIL2HiGFy-0Iiii3Y9_U3PKiMPBI03SaY4pJ_CXf7znMH6w-ffqw_O0PgEGB8LkGNqBwPDLRxdJq-pWpKFIxt9zgn_ZET0cXFeqWhU6SQwW_X8YxylpG1wMytjZPbnMpUKxt11kzR34NCbmn3tWQOY4GPXdc"
              />
            </tbody>
          </table>
        </div>
        <div className="p-4 bg-slate-50/30 text-center">
          <button className="text-[11px] font-bold uppercase tracking-widest text-slate-400 hover:text-primary transition-colors cursor-pointer">Cargar más registros</button>
        </div>
      </section>

      {/* Modal / Slide-over */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                onClick={() => setIsModalOpen(false)}
                className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] cursor-pointer" 
            />
            <motion.div 
                initial={{ x: '100%' }} 
                animate={{ x: 0 }} 
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed right-0 top-0 w-full max-w-xl bg-white h-screen shadow-2xl z-[70] flex flex-col"
            >
                <header className="p-8 border-b border-slate-100 flex items-center justify-between">
                    <div>
                        <h3 className="text-2xl font-extrabold text-slate-900">{t('billing.modal.title')}</h3>
                        <p className="text-sm text-slate-500">{t('billing.modal.subtitle')}</p>
                    </div>
                    <button 
                        onClick={() => setIsModalOpen(false)}
                        className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-slate-50 text-slate-400 transition-colors cursor-pointer"
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </header>
                <form className="flex-1 overflow-y-auto p-8 space-y-8 no-scrollbar">
                    {/* Patient Search */}
                    <div className="space-y-4">
                        <label className="block text-[10px] uppercase tracking-widest font-extrabold text-primary">{t('billing.modal.selection')}</label>
                        <div className="relative group">
                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">person_search</span>
                            <input 
                                className="w-full border-none bg-slate-100 rounded-xl py-4 pl-12 pr-4 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-primary transition-all outline-none" 
                                placeholder={t('billing.modal.search_placeholder')} 
                                type="text"
                            />
                        </div>
                    </div>
                    {/* Service Details */}
                    <div className="space-y-4">
                        <label className="block text-[10px] uppercase tracking-widest font-extrabold text-primary">{t('billing.modal.service_details')}</label>
                        <div className="bg-slate-50 p-5 rounded-2xl space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500">{t('billing.modal.category')}</label>
                                <select className="w-full border-none bg-white rounded-xl py-3 focus:ring-2 focus:ring-primary outline-none">
                                    <option>Consulta General</option>
                                    <option>Endodoncia</option>
                                    <option>Odontología Estética</option>
                                    <option>Ortodoncia</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500">{t('billing.modal.treatment_desc')}</label>
                                <textarea className="w-full border-none bg-white rounded-xl py-3 focus:ring-2 focus:ring-primary outline-none resize-none" placeholder="Ingresa notas del tratamiento..." rows="3"></textarea>
                            </div>
                        </div>
                    </div>
                    {/* Financials */}
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="block text-[10px] uppercase tracking-widest font-extrabold text-primary">{t('billing.modal.total_cost')}</label>
                            <input className="w-full border-none bg-slate-100 rounded-xl py-4 px-4 font-bold text-xl focus:ring-2 focus:ring-primary outline-none" placeholder="0.00" type="number"/>
                        </div>
                        <div className="space-y-2">
                            <label className="block text-[10px] uppercase tracking-widest font-extrabold text-primary">{t('billing.modal.service_date')}</label>
                            <input className="w-full border-none bg-slate-100 rounded-xl py-4 px-4 text-slate-900 focus:ring-2 focus:ring-primary outline-none" type="date"/>
                        </div>
                    </div>
                    {/* Payment Status */}
                    <div className="space-y-4">
                        <label className="block text-[10px] uppercase tracking-widest font-extrabold text-primary">{t('billing.modal.initial_status')}</label>
                        <div className="flex gap-4">
                            <label className="flex-1 cursor-pointer">
                                <input checked type="radio" name="status" className="hidden peer" />
                                <div className="p-4 border-2 border-transparent bg-slate-50 rounded-2xl peer-checked:border-primary peer-checked:bg-primary/5 text-center transition-all">
                                    <span className="material-symbols-outlined block mb-1">pending</span>
                                    <span className="text-sm font-bold">{t('billing.status.pending')}</span>
                                </div>
                            </label>
                            <label className="flex-1 cursor-pointer">
                                <input type="radio" name="status" className="hidden peer" />
                                <div className="p-4 border-2 border-transparent bg-slate-50 rounded-2xl peer-checked:border-green-500 peer-checked:bg-green-50 text-center transition-all">
                                    <span className="material-symbols-outlined block mb-1">payments</span>
                                    <span className="text-sm font-bold">{t('billing.status.paid')}</span>
                                </div>
                            </label>
                        </div>
                    </div>
                </form>
                <footer className="p-8 border-t border-slate-100 flex gap-4">
                    <button 
                        onClick={() => setIsModalOpen(false)}
                        className="flex-1 py-4 px-6 rounded-full font-bold text-slate-500 hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                        {t('billing.modal.discard')}
                    </button>
                    <button className="flex-1 py-4 px-6 rounded-full font-bold bg-primary text-white shadow-xl shadow-blue-200 active:scale-95 transition-transform cursor-pointer">
                        {t('billing.modal.create')}
                    </button>
                </footer>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

const StatusChip = ({ label, active }) => (
  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider cursor-pointer transition-colors whitespace-nowrap ${active ? 'bg-blue-50 text-blue-600' : 'hover:bg-slate-50 text-slate-400'}`}>
    {label}
  </span>
);

const InvoiceRow = ({ name, id, desc, cost, date, status, statusColor, dotColor, img }) => (
  <tr className="group hover:bg-blue-50/30 transition-colors">
    <td className="px-8 py-5 whitespace-nowrap">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden">
          <img className="w-full h-full object-cover" src={img} alt={name} />
        </div>
        <div>
          <p className="font-bold text-slate-900">{name}</p>
          <p className="text-[11px] text-slate-400">ID: #{id}</p>
        </div>
      </div>
    </td>
    <td className="px-6 py-5 whitespace-nowrap">
      <p className="text-slate-600 font-medium">{desc}</p>
    </td>
    <td className="px-6 py-5 whitespace-nowrap">
      <p className="font-bold text-slate-900">{cost}</p>
    </td>
    <td className="px-6 py-5 whitespace-nowrap text-slate-500 text-sm">{date}</td>
    <td className="px-6 py-5 whitespace-nowrap">
      <div className="flex justify-center">
        <span className={`px-4 py-1.5 rounded-full text-[11px] font-bold flex items-center gap-1.5 ${statusColor}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`}></span> {status}
        </span>
      </div>
    </td>
    <td className="px-8 py-5 whitespace-nowrap text-right">
      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Link to={`/billing/invoice/${id}`} className="p-2 text-slate-400 hover:text-primary transition-colors hover:bg-white rounded-lg" title="Ver Detalles"><span className="material-symbols-outlined">visibility</span></Link>
        <button className="p-2 text-slate-400 hover:text-primary transition-colors hover:bg-white rounded-lg cursor-pointer" title="Imprimir"><span className="material-symbols-outlined">print</span></button>
        <button className="p-2 text-slate-400 hover:text-primary transition-colors hover:bg-white rounded-lg cursor-pointer" title="Opciones"><span className="material-symbols-outlined">more_vert</span></button>
      </div>
    </td>
  </tr>
);

export default Billing;
