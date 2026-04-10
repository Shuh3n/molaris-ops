import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

const LanguageToggle = () => {
  const { i18n } = useTranslation();
  const currentLang = i18n.language.split('-')[0];

  const toggleLanguage = () => {
    const newLang = currentLang === 'es' ? 'en' : 'es';
    i18n.changeLanguage(newLang);
  };

  return (
    <div className="flex items-center gap-3">
      <span className={`text-[10px] font-bold tracking-widest transition-colors ${currentLang === 'es' ? 'text-primary' : 'text-slate-400'}`}>
        ESP
      </span>
      <div 
        onClick={toggleLanguage}
        className="relative w-12 h-6 bg-slate-200 rounded-full p-1 cursor-pointer transition-colors hover:bg-slate-300"
      >
        <motion.div
          className="w-4 h-4 bg-white rounded-full shadow-sm"
          animate={{
            x: currentLang === 'es' ? 0 : 24,
          }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      </div>
      <span className={`text-[10px] font-bold tracking-widest transition-colors ${currentLang === 'en' ? 'text-primary' : 'text-slate-400'}`}>
        ENG
      </span>
    </div>
  );
};

export default LanguageToggle;
