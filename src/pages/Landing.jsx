import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Landing = () => {
  const { t, i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'es' ? 'en' : 'es';
    i18n.changeLanguage(newLang);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <nav className="flex justify-between items-center px-12 py-6">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-lg editorial-gradient flex items-center justify-center text-white font-bold text-xl shadow-md">M</div>
          <span className="font-headline font-extrabold text-2xl tracking-tight text-primary">{t('landing.title')}</span>
        </div>
        <div className="flex gap-8 items-center">
          <button onClick={toggleLanguage} className="text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-primary transition-colors cursor-pointer">
            {i18n.language === 'es' ? 'English' : 'Español'}
          </button>
          <Link to="/login" className="px-6 py-2 bg-primary text-white rounded-full font-bold shadow-lg hover:opacity-90 transition-all cursor-pointer">
            {t('landing.login_btn')}
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="flex-grow flex flex-col items-center justify-center px-6 text-center">
        <div className="max-w-4xl space-y-8">
          <h1 className="text-6xl md:text-8xl font-extrabold leading-tight tracking-tighter">
            {t('landing.subtitle').split('.')[0]} <br/>
            <span className="text-primary italic">{t('landing.subtitle').split('.')[1] || ''}</span>
          </h1>
          <p className="text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
            {t('landing.description')}
          </p>
          <div className="flex gap-4 justify-center pt-4">
            <button className="px-10 py-4 bg-primary text-white rounded-full font-bold text-lg shadow-xl hover:scale-105 transition-transform">
              {t('landing.get_started')}
            </button>
            <button className="px-10 py-4 border-2 border-slate-200 text-slate-700 rounded-full font-bold text-lg hover:bg-slate-50 transition-colors">
              {t('landing.view_demo')}
            </button>
          </div>
        </div>

        {/* Features */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-12 max-w-6xl w-full px-4">
          <FeatureCard icon="analytics" title={t('landing.features.analytics')} desc={t('landing.features.analytics_desc')} color="primary" />
          <FeatureCard icon="security" title={t('landing.features.secure')} desc={t('landing.features.secure_desc')} color="secondary" />
          <FeatureCard icon="bolt" title={t('landing.features.scalable')} desc={t('landing.features.scalable_desc')} color="tertiary" />
        </div>
      </main>

      <footer className="py-12 text-center text-slate-400 text-sm">
        © 2026 {t('landing.title')}. All systems operational.
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, desc, color }) => (
  <div className="p-8 rounded-3xl bg-white shadow-sm border border-slate-100 space-y-4 text-left">
    <div className={`w-12 h-12 rounded-2xl bg-${color}/10 flex items-center justify-center text-${color}`}>
       <span className="material-symbols-outlined">{icon}</span>
    </div>
    <h3 className="text-xl font-bold">{title}</h3>
    <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
  </div>
);

export default Landing;
