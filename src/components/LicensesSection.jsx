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
    <section className="py-32 relative overflow-hidden">
      {/* Background accents */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-20 space-y-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 text-primary rounded-full text-[10px] font-black uppercase tracking-widest mb-4"
          >
            <Icons.Star />
            <span>Precios Transparentes</span>
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter"
          >
            Planes a tu <span className="text-primary italic">Medida</span>
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-slate-500 text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed"
          >
            Sin letras pequeñas. Escalabilidad real para cada etapa de tu clínica dental.
          </motion.p>

          {/* Billing Toggle */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="flex items-center justify-center gap-6 pt-8"
          >
            <span className={`text-sm font-black transition-colors ${billingCycle === 'monthly' ? 'text-slate-900' : 'text-slate-400'}`}>MENSUAL</span>
            <button 
              onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
              className="w-16 h-8 bg-slate-200 rounded-full p-1 transition-colors relative"
            >
              <motion.div 
                animate={{ x: billingCycle === 'monthly' ? 0 : 32 }}
                className="w-6 h-6 bg-primary rounded-full shadow-lg"
              />
            </button>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-black transition-colors ${billingCycle === 'yearly' ? 'text-slate-900' : 'text-slate-400'}`}>ANUAL</span>
              <span className="px-2 py-0.5 bg-green-100 text-green-600 text-[9px] font-black rounded-md uppercase">-20% OFF</span>
            </div>
          </motion.div>
        </div>

        <div className="w-full flex justify-center mb-10 min-h-[40px]">
          {loading && (
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 items-stretch">
          {licencias.map((l, idx) => {
            const isRecommended = l.nombre === 'Estándar';
            const price = PRICE_MAP[l.nombre];
            const isCustom = price === 'Personalizado';
            
            // Simular precio anual
            const displayPrice = !isCustom && billingCycle === 'yearly' 
              ? (parseInt(price.replace('.', '')) * 0.8 * 12).toLocaleString()
              : price;

            return (
              <motion.article 
                key={l.id} 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -8 }}
                className={`relative p-10 rounded-[3rem] flex flex-col justify-between transition-all duration-500 border border-slate-100 ${
                  isRecommended 
                  ? 'bg-white shadow-[0_40px_100px_-15px_rgba(0,0,0,0.1)] ring-2 ring-primary scale-100 lg:scale-105 z-20' 
                  : 'bg-white/60 backdrop-blur-xl hover:bg-white hover:shadow-2xl'
                }`}
              >
                {isRecommended && (
                  <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-2xl">
                    <Icons.Star />
                    <span>MÁS POPULAR</span>
                  </div>
                )}

                <div className="space-y-8">
                  <div>
                    <h3 className={`text-3xl font-black mb-2 ${isRecommended ? 'text-primary' : 'text-slate-900'}`}>
                      {l.nombre}
                    </h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <div className="w-1 h-1 bg-primary rounded-full" />
                      {l.max_dentistas} {l.max_dentistas === 1 ? 'Doctor' : 'Doctores'}
                    </p>
                  </div>

                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-black text-slate-900 tracking-tighter">
                      {!isCustom && '$'}{displayPrice}
                    </span>
                    {!isCustom && (
                      <span className="text-slate-400 font-bold text-xs">/{billingCycle === 'monthly' ? 'mes' : 'año'}</span>
                    )}
                  </div>

                  <div className="h-px bg-slate-100 w-full" />

                  <ul className="space-y-5">
                    <BenefitItem text={t('landing.licenses.benefit_1')} active={true} />
                    <BenefitItem text={t('landing.licenses.benefit_2')} active={true} />
                    <BenefitItem text={t('landing.licenses.benefit_3')} active={true} />
                    <BenefitItem text="Historial Clínico Pro" active={idx >= 1} />
                    <BenefitItem text="Soporte Prioritario" active={isRecommended || idx > 1} />
                    {idx === 3 && <BenefitItem text="Cloud Multi-Sede" active={true} />}
                  </ul>
                </div>

                <div className="mt-12">
                  {isCustom ? (
                    <a 
                      href={`mailto:ventas@molaris-ops.com?subject=Consulta%20Licencia%20${encodeURIComponent(l.nombre)}`} 
                      className="block w-full text-center py-5 bg-slate-900 text-white rounded-[2rem] font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-slate-900/10"
                    >
                      Contactar Ventas
                    </a>
                  ) : (
                    <Link 
                      to="/register" 
                      className={`block w-full text-center py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest transition-all ${
                        isRecommended 
                        ? 'bg-primary text-white shadow-2xl shadow-primary/30 hover:scale-105 active:scale-95' 
                        : 'bg-slate-100 text-slate-900 hover:bg-slate-200 active:scale-95'
                      }`}
                    >
                      Elegir Plan
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
          className="mt-20 flex flex-col items-center gap-6"
        >
          <p className="text-slate-400 font-bold text-sm">Todas nuestras licencias incluyen:</p>
          <div className="flex flex-wrap justify-center gap-8 md:gap-16">
            {['Actualizaciones Gratis', 'Encriptación AES-256', 'Soporte vía WhatsApp'].map(item => (
              <div key={item} className="flex items-center gap-2">
                <div className="text-primary"><Icons.Check /></div>
                <span className="text-xs font-black text-slate-700 uppercase tracking-widest">{item}</span>
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

