import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import LanguageToggle from '../components/LanguageToggle';

const Landing = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50">
      {/* Navbar */}
      <nav className="flex justify-between items-center px-12 py-6 sticky top-0 bg-white/50 backdrop-blur-xl z-50">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-lg editorial-gradient flex items-center justify-center text-white font-bold text-xl shadow-md">M</div>
          <span className="font-headline font-extrabold text-2xl tracking-tight text-primary">{t('landing.title')}</span>
        </div>
        <div className="flex gap-8 items-center">
          <LanguageToggle />
          <Link to="/login" className="px-6 py-2 bg-primary text-white rounded-full font-bold shadow-lg hover:opacity-90 transition-all cursor-pointer">
            {t('landing.login_btn')}
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="flex-grow flex flex-col items-center justify-center px-6 text-center py-20">
        <div className="max-w-4xl space-y-8">
          <motion.h1 
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-6xl md:text-8xl font-extrabold leading-tight tracking-tighter"
          >
            {t('landing.subtitle').split('.')[0]} <br/>
            <span className="text-primary italic">{t('landing.subtitle').split('.')[1] || ''}</span>
          </motion.h1>
          
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed"
          >
            {t('landing.description')}
          </motion.p>
          
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="flex gap-4 justify-center pt-4"
          >
            <button className="px-10 py-4 bg-primary text-white rounded-full font-bold text-lg shadow-xl hover:scale-105 transition-transform">
              {t('landing.get_started')}
            </button>
            <button className="px-10 py-4 border-2 border-slate-200 text-slate-700 rounded-full font-bold text-lg hover:bg-slate-50 transition-colors">
              {t('landing.view_demo')}
            </button>
          </motion.div>
        </div>

        {/* Features */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6, duration: 1 }}
          className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-12 max-w-6xl w-full px-4"
        >
          <FeatureCard icon="analytics" title={t('landing.features.analytics')} desc={t('landing.features.analytics_desc')} color="primary" delay={0.1} />
          <FeatureCard icon="security" title={t('landing.features.secure')} desc={t('landing.features.secure_desc')} color="secondary" delay={0.2} />
          <FeatureCard icon="bolt" title={t('landing.features.scalable')} desc={t('landing.features.scalable_desc')} color="tertiary" delay={0.3} />
        </motion.div>
      </main>

      <footer className="py-12 text-center text-slate-400 text-sm">
        © 2026 {t('landing.title')}. All systems operational.
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, desc, color, delay }) => (
  <motion.div 
    whileHover={{ y: -10 }}
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay, duration: 0.5 }}
    className="p-8 rounded-3xl bg-white shadow-sm border border-slate-100 space-y-4 text-left"
  >
    <div className={`w-12 h-12 rounded-2xl bg-${color}/10 flex items-center justify-center text-${color}`}>
       <span className="material-symbols-outlined">{icon}</span>
    </div>
    <h3 className="text-xl font-bold">{title}</h3>
    <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
  </motion.div>
);

export default Landing;
