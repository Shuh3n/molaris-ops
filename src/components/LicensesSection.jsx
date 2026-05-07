import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

const PRICE_MAP = {
  'Básica': '20.000',
  'Estándar': '50.000',
  'Pro': '80.000',
  'Pro+': 'Personalizado'
};

const Icons = {
  Check: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
  ),
  Star: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
  )
};

const LicensesSection = () => {
  const { t } = useTranslation();
  const [licencias, setLicencias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [billingCycle, setBillingCycle] = useState('monthly'); // 'monthly' | 'yearly'

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data, error } = await supabase.from('licencias').select('*').order('max_dentistas', { ascending: true });
      if (error) console.error('Error fetching licencias', error);
      if (mounted) setLicencias(data || []);
      setLoading(false);
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <section className="py-24 md:py-32 relative overflow-hidden bg-slate-50/50">
      {/* Background accents */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="text-center mb-16 md:mb-24 space-y-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white shadow-sm border border-slate-100 text-primary rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-4"
          >
            <Icons.Star />
            <span>{t('landing.licenses.transparent_pricing')}</span>
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl sm:text-5xl md:text-7xl font-black text-slate-900 tracking-tight leading-[1.1]"
          >
            {t('landing.licenses.title_1', 'Planes a tu')} <span className="text-primary italic relative">
              {t('landing.licenses.title_2', 'Medida')}
              <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 100 10" preserveAspectRatio="none">
                <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="2" fill="none" className="opacity-20" />
              </svg>
            </span>
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-slate-500 text-base sm:text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed px-4"
          >
            {t('landing.licenses.subtitle')}
          </motion.p>

          {/* Billing Toggle */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="flex items-center justify-center gap-4 pt-8"
          >
            <span className={`text-[10px] font-black tracking-widest transition-colors ${billingCycle === 'monthly' ? 'text-slate-900' : 'text-slate-400'}`}>{t('landing.licenses.billing.monthly')}</span>
            <button 
              onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
              className="w-14 h-7 bg-slate-200/50 backdrop-blur-sm rounded-full p-1 transition-all hover:bg-slate-300/50 relative group"
            >
              <motion.div 
                animate={{ x: billingCycle === 'monthly' ? 0 : 28 }}
                className="w-5 h-5 bg-primary rounded-full shadow-lg shadow-primary/30"
              />
            </button>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-black tracking-widest transition-colors ${billingCycle === 'yearly' ? 'text-slate-900' : 'text-slate-400'}`}>{t('landing.licenses.billing.yearly')}</span>
              <span className="px-2 py-1 bg-green-500 text-white text-[9px] font-black rounded-lg uppercase shadow-lg shadow-green-500/20">{t('landing.licenses.billing.off')}</span>
            </div>
          </motion.div>
        </div>

        <div className="w-full flex justify-center mb-10 min-h-[40px]">
          {loading && (
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-4 xl:gap-6 items-stretch">
          {licencias.map((l, idx) => {
            const isRecommended = l.nombre === 'Estándar';
            const price = PRICE_MAP[l.nombre];
            const isCustom = price === 'Personalizado';
            
            const rawPrice = !isCustom ? parseInt(price.replace('.', '')) : 0;
            const displayPrice = !isCustom && billingCycle === 'yearly' 
              ? (rawPrice * 0.8 * 12).toLocaleString('es-CL')
              : price;

            return (
              <motion.article 
                key={l.id} 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -8 }}
                className={`relative p-5 sm:p-8 lg:p-5 xl:p-10 rounded-[2.5rem] flex flex-col transition-all duration-500 border group ${
                  isRecommended 
                  ? 'bg-white shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] border-primary/20 ring-1 ring-primary/5 z-20 scale-100 lg:scale-[1.02] xl:scale-105' 
                  : 'bg-white/70 backdrop-blur-xl border-slate-100 hover:bg-white hover:shadow-2xl hover:border-slate-200'
                }`}
              >
                {isRecommended && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-5 py-1.5 rounded-full text-[7px] xl:text-[8px] font-black uppercase tracking-[0.2em] flex items-center gap-2 shadow-xl z-30 whitespace-nowrap">
                    <Icons.Star />
                    <span>{t('landing.licenses.most_popular')}</span>
                  </div>
                )}

                <div className="flex-grow space-y-6 sm:space-y-8 lg:space-y-6 xl:space-y-10">
                  <div className="space-y-2">
                      <h3 className={`text-2xl sm:text-3xl lg:text-xl xl:text-3xl font-black tracking-tight ${isRecommended ? 'text-primary' : 'text-slate-900'}`}>
                        {t(`landing.licenses.demo_modal.plans.${l.nombre}`, l.nombre)}
                      </h3>

                      {l.descripcion && (
                        <p className="text-sm text-slate-500 mt-1">{l.descripcion}</p>
                      )}

                      <div className="flex flex-wrap items-center gap-3 mt-2">
                        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-100/50 border border-slate-100/30 min-w-0">
                          <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                          <p className="text-[9px] xl:text-[10px] font-black text-slate-500 uppercase tracking-widest truncate max-w-[7rem] sm:max-w-[10rem]">
                            {l.max_dentistas} {l.max_dentistas === 1 ? t('landing.licenses.doctor') : t('landing.licenses.doctors')}
                          </p>
                        </div>

                        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-100/50 border border-slate-100/30 min-w-0">
                          <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                          <p className="text-[9px] xl:text-[10px] font-black text-slate-500 uppercase tracking-widest truncate max-w-[7rem] sm:max-w-[10rem]">
                            {l.max_recepcionistas} {l.max_recepcionistas === 1 ? t('landing.licenses.receptionist') : t('landing.licenses.receptionists')}
                          </p>
                        </div>
                      </div>
                  </div>

                  <div className="flex flex-col gap-1 min-h-[70px] lg:min-h-[60px] xl:min-h-[90px] justify-center">
                    <div className="flex items-baseline gap-1 flex-wrap">
                      <span className={`font-black text-slate-900 tracking-tighter transition-all duration-300 ${
                        isCustom 
                          ? 'text-2xl sm:text-3xl lg:text-xl xl:text-3xl' 
                          : (displayPrice.length > 8 
                              ? 'text-2xl sm:text-3xl lg:text-xl xl:text-4xl' 
                              : 'text-3xl sm:text-4xl lg:text-2xl xl:text-5xl')
                      }`}>
                        {!isCustom && <span className="text-lg sm:text-2xl lg:text-base xl:text-2xl align-top mr-0.5 opacity-40">$</span>}
                        {displayPrice}
                      </span>
                    </div>
                    {!isCustom && (
                      <span className="text-slate-400 font-black text-[9px] xl:text-[10px] uppercase tracking-[0.2em]">
                        {billingCycle === 'monthly' ? t('landing.licenses.per_month') : t('landing.licenses.per_year')}
                      </span>
                    )}
                  </div>

                  <div className="h-px bg-gradient-to-r from-transparent via-slate-100 to-transparent w-full" />

                  <ul className="space-y-4 sm:space-y-5 lg:space-y-4 xl:space-y-5">
                    <BenefitItem text={t('landing.licenses.benefits.support')} active={true} />
                    <BenefitItem text={t('landing.licenses.benefits.backups')} active={true} />
                    <BenefitItem text={t('landing.licenses.benefits.updates')} active={true} />
                    <BenefitItem text={t('landing.licenses.benefits.clinical_history')} active={idx >= 1} />
                    <BenefitItem text={t('landing.licenses.benefits.priority_support')} active={isRecommended || idx > 1} />
                    {idx === 3 && <BenefitItem text={t('landing.licenses.benefits.multi_site')} active={true} />}
                  </ul>
                </div>

                <div className="mt-8 sm:mt-10 lg:mt-8 xl:mt-12">
                  {isCustom ? (
                    <a 
                      href={`mailto:ventas@molaris-ops.com?subject=Consulta%20Licencia%20${encodeURIComponent(l.nombre)}`} 
                      className="relative block w-full text-center py-4 sm:py-5 lg:py-3.5 xl:py-5 bg-slate-900 text-white rounded-[1.2rem] xl:rounded-[2rem] font-black text-[9px] xl:text-[10px] uppercase tracking-[0.2em] transition-all hover:bg-slate-800 hover:shadow-xl active:scale-95 overflow-hidden"
                    >
                      <span className="relative z-10">{t('landing.licenses.contact_cta')}</span>
                    </a>
                  ) : (
                    <Link 
                      to="/register" 
                      className={`block w-full text-center py-4 sm:py-5 lg:py-3.5 xl:py-5 rounded-[1.2rem] xl:rounded-[2rem] font-black text-[9px] xl:text-[10px] uppercase tracking-[0.2em] transition-all active:scale-95 ${
                        isRecommended 
                        ? 'bg-primary text-white shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-1' 
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-900'
                      }`}
                    >
                      {t('landing.licenses.choose_plan')}
                    </Link>
                  )}
                </div>
              </motion.article>
            );
          })}
        </div>

        {/* Bottom trust badge */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-20 pt-10 border-t border-slate-100 flex flex-col items-center gap-8"
        >
          <div className="flex flex-col items-center gap-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">{t('landing.licenses.benefits.title')}</span>
            <p className="text-slate-900 font-bold text-sm">{t('landing.licenses.benefits.subtitle')}</p>
          </div>
          <div className="flex flex-wrap justify-center gap-x-12 gap-y-6">
            {[t('landing.licenses.benefits.updates'), t('landing.licenses.benefits.security'), t('landing.licenses.benefits.whatsapp')].map(item => (
              <div key={item} className="flex items-center gap-3 group">
                <div className="text-primary transition-transform group-hover:scale-110"><Icons.Check /></div>
                <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{item}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

const BenefitItem = ({ text, active }) => (
  <li className={`flex items-center gap-3 text-sm font-bold ${active ? 'text-slate-700' : 'text-slate-300'}`}>
    <div className={`shrink-0 ${active ? 'text-primary' : 'text-slate-200'}`}>
      <Icons.Check />
    </div>
    <span>{text}</span>
  </li>
);

export default LicensesSection;

