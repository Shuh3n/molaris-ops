import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion';
import LanguageToggle from '../components/LanguageToggle';
import LicensesSection from '../components/LicensesSection';

// Custom SVG Icons
const Icons = {
  WhatsApp: ({ size = 24, strokeWidth = 2, ...props }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 1 1-7.6-7.6 8.38 8.38 0 0 1 3.8.9L22 4l-2 5z"/></svg>
  ),
  Bill: ({ size = 24, strokeWidth = 2, ...props }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/><path d="M12 11h4"/><path d="M12 16h4"/><path d="M8 11h.01"/><path d="M8 16h.01"/></svg>
  ),
  Team: ({ size = 24, strokeWidth = 2, ...props }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
  ),
  Calendar: ({ size = 24, strokeWidth = 2, ...props }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
  ),
  Dashboard: ({ size = 24, strokeWidth = 2, ...props }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/></svg>
  ),
  Check: ({ size = 18, strokeWidth = 3, ...props }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" {...props}><polyline points="20 6 9 17 4 12"/></svg>
  ),
  ArrowRight: ({ size = 18, strokeWidth = 2.5, ...props }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
  ),
  Shield: ({ size = 24, strokeWidth = 2, ...props }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
  )
};

const ProblemsSolutionsMarquee = ({ t }) => {
  const problems = [
    t('landing.licenses.problems.item1'),
    t('landing.licenses.problems.item2'),
    t('landing.licenses.problems.item3'),
    t('landing.licenses.problems.item4'),
  ];
  const solutions = [
    t('landing.licenses.solutions.item1'),
    t('landing.licenses.solutions.item2'),
    t('landing.licenses.solutions.item3'),
    t('landing.licenses.solutions.item4'),
  ];

  return (
    <section className="py-12 bg-slate-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-6">
          <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">{t('landing.licenses.problems.title')}</h3>
        </div>

        <div className="overflow-hidden">
          <div className="flex animate-marquee-left">
            {problems.concat(problems).map((p, i) => (
              <span key={`p-${i}`} className="mx-10 text-lg sm:text-xl font-bold text-slate-900 whitespace-nowrap">{p}</span>
            ))}
          </div>
        </div>

        <div className="mt-6 overflow-hidden">
          <div className="flex animate-marquee-right">
            {solutions.concat(solutions).map((s, i) => (
              <span key={`s-${i}`} className="mx-10 text-lg sm:text-xl font-bold text-slate-900 whitespace-nowrap">{s}</span>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes marquee-left { 0% { transform: translateX(0%); } 100% { transform: translateX(-50%); } }
        @keyframes marquee-right { 0% { transform: translateX(-50%); } 100% { transform: translateX(0%); } }
        .animate-marquee-left { animation: marquee-left 20s linear infinite; will-change: transform; }
        .animate-marquee-right { animation: marquee-right 20s linear infinite; will-change: transform; }
        @media (prefers-reduced-motion: reduce) { .animate-marquee-left, .animate-marquee-right { animation: none; } }
      `}</style>
    </section>
  );
};

const Landing = () => {
  const { t } = useTranslation();
  const [showDemo, setShowDemo] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { scrollYProgress } = useScroll();
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

  // Mouse Parallax Effect
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 50, damping: 20 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      const { clientX, clientY } = e;
      const moveX = (clientX - window.innerWidth / 2) / 25;
      const moveY = (clientY - window.innerHeight / 2) / 25;
      mouseX.set(moveX);
      mouseY.set(moveY);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900 overflow-x-hidden selection:bg-primary/20 selection:text-primary">
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <motion.div 
          style={{ x: springX, y: springY }}
          className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-primary/5 blur-[120px] rounded-full" 
        />
        <motion.div 
          style={{ x: useTransform(springX, (v) => -v * 1.5), y: useTransform(springY, (v) => -v * 1.5) }}
          className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-400/5 blur-[120px] rounded-full" 
        />
      </div>

      {/* Modern Glass Navbar */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 left-0 right-0 z-[100] px-4 py-4"
      >
        <div className="max-w-7xl mx-auto px-6 py-3 bg-white/70 backdrop-blur-xl border border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.05)] rounded-2xl flex justify-between items-center">
          <Link to="/" className="flex items-center gap-3 group">
            <motion.div 
              whileHover={{ rotate: -10 }}
              className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center shadow-lg"
            >
              <img src="/favicon.svg" alt="logo" className="w-6 h-6" />
            </motion.div>
            <span className="font-black text-xl tracking-tighter uppercase">{t('landing.title')}</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-8">
            <nav className="flex items-center gap-8">
              <a href="#features" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-primary transition-colors">
                {t('landing.nav.features')}
              </a>
              <a href="#solutions" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-primary transition-colors">
                {t('landing.nav.solutions')}
              </a>
              <a href="#pricing" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-primary transition-colors">
                {t('landing.nav.pricing')}
              </a>
            </nav>
            <div className="h-4 w-px bg-slate-100" />
            <LanguageToggle />
            <Link to="/login" className="px-6 py-2.5 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-primary transition-all shadow-xl shadow-slate-900/10">
              {t('landing.login_btn')}
            </Link>
          </div>
          
          <div className="md:hidden flex items-center gap-4">
             <Link to="/login" className="px-5 py-2 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl">
               {t('landing.login_btn')}
             </Link>
             <button 
               onClick={() => setIsMenuOpen(!isMenuOpen)}
               className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-900"
             >
               <span className="material-symbols-outlined">
                 {isMenuOpen ? 'close' : 'menu'}
               </span>
             </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu Panel */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Liquid Glass Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 z-[105] bg-slate-900/10 backdrop-blur-md lg:hidden"
            />

            <motion.div
              initial={{ opacity: 0, x: '100%' }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-[85%] z-[110] bg-white/60 backdrop-blur-[50px] border-l border-white/50 shadow-[-20px_0_50px_rgba(0,0,0,0.1)] lg:hidden"
            >
              <div className="flex flex-col h-full p-8 pt-32 space-y-12 relative overflow-y-auto">
                {/* Close Button Inside Menu */}
                <button 
                  onClick={() => setIsMenuOpen(false)}
                  className="absolute top-8 right-8 w-12 h-12 rounded-2xl bg-white/50 border border-white flex items-center justify-center text-slate-900 shadow-sm"
                >
                  <span className="material-symbols-outlined text-2xl font-bold">close</span>
                </button>

                <nav className="flex flex-col space-y-6">
                  <a 
                    href="#features" 
                    onClick={() => setIsMenuOpen(false)}
                    className="text-3xl sm:text-4xl font-black uppercase tracking-tighter text-slate-900 hover:text-primary transition-colors break-words"
                  >
                    {t('landing.nav.features')}
                  </a>
                  <a 
                    href="#solutions" 
                    onClick={() => setIsMenuOpen(false)}
                    className="text-3xl sm:text-4xl font-black uppercase tracking-tighter text-slate-900 hover:text-primary transition-colors break-words"
                  >
                    {t('landing.nav.solutions')}
                  </a>
                  <a 
                    href="#pricing" 
                    onClick={() => setIsMenuOpen(false)}
                    className="text-3xl sm:text-4xl font-black uppercase tracking-tighter text-slate-900 hover:text-primary transition-colors break-words"
                  >
                    {t('landing.nav.pricing')}
                  </a>
                </nav>

                <div className="pt-12 border-t border-slate-900/5 flex flex-col gap-5">
                  <Link 
                    to="/login" 
                    onClick={() => setIsMenuOpen(false)}
                    className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest text-center shadow-xl shadow-slate-900/20 px-4"
                  >
                    {t('landing.login_btn')}
                  </Link>
                  <Link 
                    to="/register" 
                    onClick={() => setIsMenuOpen(false)}
                    className="w-full py-5 bg-primary text-white rounded-2xl font-black text-[10px] uppercase tracking-widest text-center shadow-xl shadow-primary/20 px-4"
                  >
                    {t('landing.get_started')}
                  </Link>
                  <div className="flex justify-center pt-2">
                    <LanguageToggle />
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <main className="relative z-10 pt-12 md:pt-16">
        {/* Hero Section */}
        <section className="px-6 py-8 lg:py-16 max-w-7xl mx-auto flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-8 max-w-4xl"
          >
            <div className="inline-flex items-center gap-3 px-4 py-2 bg-slate-50 border border-slate-100 rounded-full">
              <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">{t('landing.hero.tag')}</span>
            </div>
            
            <h1 className="text-5xl sm:text-7xl lg:text-[6rem] font-black leading-[0.9] tracking-tight text-slate-900">
              {t('landing.hero.title')} <br/>
              <span className="text-primary italic relative">
                {t('landing.hero.title_accent')}
                <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 100 10" preserveAspectRatio="none">
                  <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="2" fill="none" className="opacity-10" />
                </svg>
              </span>
            </h1>
            
            <p className="text-lg md:text-2xl text-slate-500 max-w-2xl mx-auto leading-relaxed font-medium">
              {t('landing.hero.desc')}
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center pt-8">
              <Link to="/register" className="group relative px-10 py-5 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-primary/30 hover:shadow-primary/50 transition-all flex items-center justify-center gap-4 overflow-hidden">
                <span className="relative z-10">{t('landing.hero.cta')}</span>
                <Icons.ArrowRight />
                <div className="absolute inset-0 bg-white/10 translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
              </Link>
              
              <button 
                onClick={() => setShowDemo(true)}
                className="px-10 py-5 bg-white text-slate-900 border border-slate-200 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-slate-50 transition-all flex items-center justify-center gap-4 shadow-sm"
              >
                <Icons.Calendar />
                {t('landing.hero.demo')}
              </button>
            </div>
          </motion.div>

          {/* Product Showcase */}
          <motion.div
            style={{ scale, opacity }}
            className="mt-16 lg:mt-24 relative w-full group"
          >
            <div className="absolute inset-0 bg-primary/10 blur-[120px] rounded-full scale-75 group-hover:scale-90 transition-transform duration-1000" />
            <div className="relative bg-white p-2 md:p-4 rounded-[2.5rem] md:rounded-[4rem] shadow-[0_64px_128px_-16px_rgba(0,0,0,0.1)] border border-white/50 overflow-hidden">
              <img 
                src="/molaris-og.jpg" 
                alt="Dashboard" 
                className="rounded-[2rem] md:rounded-[3rem] w-full shadow-2xl transition-transform duration-1000 group-hover:scale-[1.01]"
              />
              
              <motion.div 
                animate={{ y: [0, -20, 0], x: [0, 10, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-1/4 -right-8 md:right-12 bg-white/90 backdrop-blur-2xl p-6 rounded-[2rem] shadow-2xl border border-white/50 hidden lg:flex items-center gap-5"
              >
                <div className="w-14 h-14 bg-green-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/30">
                  <Icons.Check />
                </div>
                <div className="text-left pr-8">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
                  <p className="text-xl font-black text-slate-900">100% Operational</p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </section>


        <motion.section 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          id="features" 
          className="py-20 lg:py-32 px-6 max-w-7xl mx-auto"
        >
          <div className="flex flex-col md:flex-row justify-between items-end mb-20 md:mb-32 gap-8">
            <div className="max-w-xl space-y-6 text-left">
              <div className="w-12 h-1 bg-primary rounded-full" />
              <h2 className="text-4xl md:text-6xl font-black tracking-tight leading-none text-slate-900">
                {t('landing.features_section.title')}
              </h2>
            </div>
            <p className="text-lg md:text-xl text-slate-500 max-w-sm font-medium leading-relaxed text-left">
              {t('landing.features_section.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 xl:gap-12">
            <ModernFeatureCard 
              icon={<Icons.WhatsApp />} 
              title={t('landing.features_section.wsp_title')} 
              desc={t('landing.features_section.wsp_desc')} 
              accent="green"
              delay={0}
            />
            <ModernFeatureCard 
              icon={<Icons.Bill />} 
              title={t('landing.features_section.finances_title')} 
              desc={t('landing.features_section.finances_desc')} 
              accent="blue"
              delay={0.1}
            />
            <ModernFeatureCard 
              icon={<Icons.Shield />} 
              title={t('landing.features_section.security_title')} 
              desc={t('landing.features_section.security_desc')} 
              accent="indigo"
              delay={0.2}
            />
          </div>
        </motion.section>

        {/* Problems & Solutions animated rows (left / right) */}
        <ProblemsSolutionsMarquee t={t} />

        <motion.section 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          id="solutions" 
          className="py-20 bg-slate-900 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-primary/10 blur-[150px] opacity-30" />
          <div className="max-w-7xl mx-auto px-6 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            <div className="space-y-12">
               <div className="space-y-6">
                  <h2 className="text-4xl md:text-6xl font-black text-white leading-[1.1] tracking-tight">
                    {t('landing.showcase.title')}
                  </h2>
                  <p className="text-xl text-slate-400 font-medium leading-relaxed">
                    {t('landing.showcase.desc')}
                  </p>
               </div>
               
               <div className="space-y-8">
                  <ShowcaseItem title={t('landing.showcase.item1_title')} desc={t('landing.showcase.item1_desc')} />
                  <ShowcaseItem title={t('landing.showcase.item2_title')} desc={t('landing.showcase.item2_desc')} />
                  <ShowcaseItem title={t('landing.showcase.item3_title')} desc={t('landing.showcase.item3_desc')} />
               </div>

               <div className="pt-8">
                  <button 
                    onClick={() => setShowDemo(true)}
                    className="px-10 py-5 bg-white text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl hover:bg-primary hover:text-white transition-all"
                  >
                    {t('landing.showcase.cta')}
                  </button>
               </div>
            </div>
            
            <motion.div 
              initial={{ x: 100, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="absolute -inset-10 bg-primary/20 blur-[100px] rounded-full" />
              <div className="relative bg-slate-800 p-2 rounded-[2.5rem] border border-slate-700 shadow-3xl">
                <img src="/molaris-og.jpg" alt="Interface" className="rounded-[2.2rem] opacity-90 group-hover:opacity-100 transition-opacity" />
              </div>
            </motion.div>
          </div>
        </motion.section>

        {/* Pricing Integrated */}
        <section id="pricing">
          <LicensesSection />
        </section>

        {/* Final CTA */}
        <section className="py-20 px-6">
          <motion.div 
            whileHover={{ scale: 0.99 }}
            className="max-w-7xl mx-auto p-12 lg:p-32 rounded-[4rem] bg-slate-900 text-white text-center relative overflow-hidden group shadow-[0_48px_96px_-24px_rgba(0,0,0,0.5)]"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-blue-600/30 blur-[120px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            <div className="relative z-10 space-y-12">
              <h2 className="text-4xl md:text-8xl font-black leading-tight tracking-tight">
                {t('landing.final_cta.title')} <br/> <span className="text-primary italic">{t('landing.final_cta.title_accent')}</span>.
              </h2>
              <p className="text-xl md:text-2xl text-slate-400 font-medium max-w-2xl mx-auto">
                {t('landing.final_cta.desc')}
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Link to="/register" className="px-12 py-6 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-primary/40 hover:scale-105 active:scale-95 transition-all">
                  {t('landing.final_cta.cta')}
                </Link>
                <button className="px-12 py-6 bg-white/5 border border-white/10 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-white/10 transition-all">
                  {t('landing.final_cta.sales')}
                </button>
              </div>
            </div>
          </motion.div>
        </section>
      </main>

      <footer className="py-32 px-6 border-t border-slate-100 bg-white relative z-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-20">
          <div className="col-span-2 space-y-8">
            <div className="flex items-center gap-4">
              <motion.div 
                whileHover={{ rotate: -10 }}
                className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center shadow-lg"
              >
                 <img src="/favicon.svg" alt="logo" className="w-6 h-6" />
              </motion.div>
              <span className="font-black text-2xl tracking-tighter uppercase">{t('landing.title')}</span>
            </div>
            <p className="text-slate-400 text-lg font-medium leading-relaxed max-w-md">
              {t('landing.footer.desc')}
            </p>
            <div className="flex gap-6">
               <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-primary/10 hover:text-primary transition-all cursor-pointer">
                  <Icons.WhatsApp />
               </div>
               <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-primary/10 hover:text-primary transition-all cursor-pointer">
                  <Icons.Shield />
               </div>
            </div>
          </div>
          
          <div className="space-y-8">
             <h5 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-900">{t('landing.footer.product')}</h5>
             <nav className="flex flex-col gap-4 text-slate-400 font-bold text-sm">
                <a href="#features" className="hover:text-primary transition-colors">{t('landing.nav.features')}</a>
                <a href="#pricing" className="hover:text-primary transition-colors">{t('landing.nav.pricing')}</a>
                <a href="#" className="hover:text-primary transition-colors">{t('landing.footer.security_title')}</a>
             </nav>
          </div>
          
          <div className="space-y-8">
             <h5 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-900">{t('landing.footer.legal')}</h5>
             <nav className="flex flex-col gap-4 text-slate-400 font-bold text-sm">
                <Link to="/privacidad" className="hover:text-primary transition-colors">{t('landing.footer.privacy')}</Link>
                <Link to="/terminos" className="hover:text-primary transition-colors">{t('landing.footer.terms')}</Link>
                <Link to="/cookies" className="hover:text-primary transition-colors">{t('landing.footer.cookies')}</Link>
             </nav>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-32 pt-10 border-t border-slate-50 flex flex-col md:flex-row justify-between items-center gap-6">
           <p className="text-slate-400 font-bold text-xs">© 2026 {t('landing.title')}. Todos los derechos reservados.</p>
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('landing.footer.tagline')}</p>
        </div>
      </footer>

      <AnimatePresence>
        {showDemo && <DemoModal onClose={() => setShowDemo(false)} />}
      </AnimatePresence>
    </div>
  );
};

const ModernFeatureCard = ({ icon, title, desc, accent, delay }) => {
  const accents = {
    green: "group-hover:text-green-500",
    blue: "group-hover:text-blue-500",
    indigo: "group-hover:text-indigo-500"
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="p-10 lg:p-12 bg-white rounded-[3rem] border border-slate-100 shadow-[0_8px_32px_rgba(0,0,0,0.02)] hover:shadow-2xl hover:border-primary/20 transition-all duration-500 group relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-2 h-0 bg-primary group-hover:h-full transition-all duration-700" />
      <div className={`mb-10 text-slate-400 transition-colors duration-500 ${accents[accent]}`}>
        {React.cloneElement(icon, { size: 40, strokeWidth: 1.5 })}
      </div>
      <div className="space-y-4">
        <h3 className="text-2xl font-black tracking-tight text-slate-900 group-hover:text-primary transition-colors duration-500">{title}</h3>
        <p className="text-slate-500 font-medium leading-relaxed text-lg">{desc}</p>
      </div>
    </motion.div>
  );
};

const ShowcaseItem = ({ title, desc }) => (
  <div className="flex gap-6 group">
    <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center shrink-0 mt-1 group-hover:bg-primary group-hover:border-primary transition-all duration-500">
       <Icons.Check />
    </div>
    <div className="space-y-1 text-left">
       <h4 className="text-xl font-black text-white">{title}</h4>
       <p className="text-slate-400 font-medium">{desc}</p>
    </div>
  </div>
);

const DemoModal = ({ onClose }) => {
  const { t } = useTranslation();
  const [role, setRole] = useState('recepcionista');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [isCtaVisible, setIsCtaVisible] = useState(true);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, [role, activeTab]);
  
  const mockData = {
    citas: [
      { id: 1, hora: '09:00', paciente: 'Carlos Rodríguez', motivo: 'Ortodoncia', estado: 'completada' },
      { id: 2, hora: '10:30', paciente: 'Elena Gómez', motivo: 'Limpieza', estado: 'confirmada' },
      { id: 3, hora: '11:15', paciente: 'Mateo Sánchez', motivo: 'Consulta', estado: 'programada' },
      { id: 4, hora: '14:00', paciente: 'Sofía Castro', motivo: 'Diseño Sonrisa', estado: 'confirmada' },
    ],
    pacientes: [
      { id: 1, nombre: 'Carlos Rodríguez', id_doc: '10203040', telefono: '+57 300 123 4567', estado: 'checked_in' },
      { id: 2, nombre: 'Elena Gómez', id_doc: '50607080', telefono: '+57 310 987 6543', estado: 'completed' },
      { id: 3, nombre: 'Mateo Sánchez', id_doc: '90102030', telefono: '+57 320 456 7890', estado: 'new' },
      { id: 4, nombre: 'Sofía Castro', id_doc: '11223344', telefono: '+57 305 222 3333', estado: 'follow_up' },
    ],
    facturas: [
      { id: 'FAC-001', paciente: 'Carlos Rodríguez', fecha: '2026-05-04', total: '$120.000', estado: 'paid' },
      { id: 'FAC-002', paciente: 'Lucía Méndez', fecha: '2026-05-03', total: '$85.000', estado: 'pending' },
      { id: 'FAC-003', paciente: 'Andrés Villa', fecha: '2026-05-02', total: '$250.000', estado: 'paid' },
      { id: 'FAC-004', paciente: 'Elena Gómez', fecha: '2026-05-01', total: '$1.200.000', estado: 'pending' },
    ],
    equipo: [
      { id: 1, nombre: 'Dr. Arango', rol: 'Ortodoncista', estado: 'activo' },
      { id: 2, nombre: 'Dra. Casas', rol: 'Endodoncista', estado: 'activo' },
      { id: 3, nombre: 'Juana Pérez', rol: 'Recepcionista', estado: 'activo' },
    ],
    servicios: [
      { id: 1, nombre: 'Consulta General', precio: '$50.000' },
      { id: 2, nombre: 'Limpieza Profunda', precio: '$85.000' },
      { id: 3, nombre: 'Ortodoncia (Control)', precio: '$120.000' },
    ]
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <>
            <header className="space-y-4 text-left">
              <div className="h-1 w-12 bg-primary rounded-full" />
              <h2 className="text-5xl font-black text-slate-900 tracking-tight">{t('landing.licenses.demo_modal.welcome', { name: role === 'recepcionista' ? 'Juana' : 'Dr. Arango' })}</h2>
              <p className="text-slate-500 font-medium text-xl">{t('landing.licenses.demo_modal.subtitle')}</p>
            </header>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <StatCard label={t('landing.licenses.demo_modal.stats.appointments')} value="12" icon={<Icons.Calendar />} color="blue" />
              <StatCard label={t('landing.licenses.demo_modal.stats.whatsapp')} value="28" icon={<Icons.WhatsApp />} color="green" />
              <StatCard label={t('landing.licenses.demo_modal.stats.revenue')} value="$2.4M" icon={<Icons.Bill />} color="purple" />
            </div>

            <div className="bg-white p-10 lg:p-12 rounded-[3.5rem] border border-slate-100 shadow-2xl shadow-slate-200/50 text-left">
              <div className="flex items-center justify-between mb-10">
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">{t('landing.licenses.demo_modal.next_appointments')}</h3>
                <button className="text-[10px] font-black text-primary uppercase tracking-[0.2em] hover:opacity-70 transition-opacity">{t('landing.licenses.demo_modal.view_agenda')}</button>
              </div>
              <div className="space-y-4">
                {mockData.citas.map(cita => (
                  <div key={cita.id} className="group flex items-center justify-between p-6 bg-slate-50/50 rounded-[2.5rem] hover:bg-white hover:shadow-xl transition-all duration-500 border border-transparent hover:border-slate-100">
                     <div className="flex items-center gap-8">
                        <span className="text-xl font-black text-primary/40 group-hover:text-primary transition-colors w-16 tracking-tighter">{cita.hora}</span>
                        <div>
                           <p className="text-xl font-black text-slate-900 tracking-tight">{cita.paciente}</p>
                           <p className="text-[9px] font-black uppercase text-slate-400 tracking-[0.2em] mt-1">{cita.motivo}</p>
                        </div>
                     </div>
                     <span className={`px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-widest ${cita.estado === 'confirmada' ? 'bg-green-100 text-green-600' : cita.estado === 'completada' ? 'bg-blue-100 text-blue-600' : 'bg-primary/10 text-primary'}`}>
                       {t(`appointments.status.${cita.estado}`)}
                     </span>
                  </div>
                ))}
              </div>
            </div>
          </>
        );
      case 'citas':
        return (
          <div className="space-y-12 text-left">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
               <h2 className="text-5xl font-black text-slate-900 tracking-tight">{t('landing.licenses.demo_modal.master_agenda')}</h2>
               <button className="px-10 py-5 bg-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:-translate-y-1 transition-all">{t('landing.licenses.demo_modal.add_appointment')}</button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-6">
               {['lun','mar','mie','jue','vie','sab','dom'].map((dia, idx) => (
                 <div key={dia} className={`p-6 rounded-[2rem] border transition-all duration-500 ${idx === 1 ? 'bg-slate-900 text-white border-slate-900 shadow-2xl' : 'bg-white text-slate-900 border-slate-100 shadow-sm'}`}>
                    <p className={`text-[10px] font-black tracking-widest uppercase mb-2 ${idx === 1 ? 'text-primary' : 'text-slate-400'}`}>{t(`common.days.${dia}`)}</p>
                    <p className="text-3xl font-black tracking-tighter">{idx + 12}</p>
                 </div>
               ))}
            </div>
            <div className="bg-white p-32 rounded-[4rem] border-2 border-dashed border-slate-100 text-center flex flex-col items-center justify-center gap-6 group">
               <div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center group-hover:scale-110 transition-transform duration-700">
                  <Icons.Calendar />
               </div>
               <p className="text-2xl font-bold text-slate-300 italic tracking-tight">{t('landing.licenses.demo_modal.calendar_view')}</p>
            </div>
          </div>
        );
      case 'pacientes':
        return (
          <div className="space-y-12 text-left">
            <header className="space-y-4">
              <h2 className="text-5xl font-black text-slate-900 tracking-tight">{t('patients.title')}</h2>
              <p className="text-slate-500 font-medium text-xl">{t('patients.subtitle')}</p>
            </header>
            <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-2xl overflow-hidden">
              <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                <div className="flex gap-4">
                  <div className="px-6 py-3 bg-slate-50 rounded-xl border border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('common.search')}</div>
                </div>
                <button className="px-8 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary transition-all">{t('patients.new_patient')}</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50/50">
                      <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">{t('patients.table.identity')}</th>
                      <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">{t('patients.table.phone')}</th>
                      <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">{t('patients.table.status')}</th>
                      <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">{t('common.actions.view')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {mockData.pacientes.map(p => (
                      <tr key={p.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-8 py-6">
                          <p className="font-black text-slate-900 tracking-tight">{p.nombre}</p>
                          <p className="text-[10px] font-bold text-slate-400">ID: {p.id_doc}</p>
                        </td>
                        <td className="px-8 py-6 text-sm font-bold text-slate-600">{p.telefono}</td>
                        <td className="px-8 py-6">
                          <span className="px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-slate-100 text-slate-600">
                            {t(`patients.status.${p.estado}`)}
                          </span>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <button className="w-10 h-10 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                            <Icons.ArrowRight size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      case 'facturacion':
        return (
          <div className="space-y-12 text-left">
            <header className="space-y-4">
              <h2 className="text-5xl font-black text-slate-900 tracking-tight">{t('billing.title')}</h2>
              <p className="text-slate-500 font-medium text-xl">{t('billing.subtitle')}</p>
            </header>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl flex flex-col gap-6">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('billing.stats.outstanding')}</p>
                <p className="text-5xl font-black text-slate-900 tracking-tighter">$1.842.000</p>
                <div className="px-6 py-3 bg-red-50 text-red-600 rounded-2xl text-[10px] font-black uppercase tracking-widest w-fit">{t('billing.stats.action_required')}</div>
              </div>
              <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl flex flex-col gap-6">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('billing.stats.revenue_mtd')}</p>
                <p className="text-5xl font-black text-slate-900 tracking-tighter">$14.500.000</p>
                <div className="px-6 py-3 bg-green-50 text-green-600 rounded-2xl text-[10px] font-black uppercase tracking-widest w-fit">+12% vs {t('common.filters.month')}</div>
              </div>
            </div>
            <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-2xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">{t('billing.table.patient')}</th>
                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">{t('billing.table.date')}</th>
                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">{t('billing.table.cost')}</th>
                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">{t('billing.table.status')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {mockData.facturas.map(f => (
                    <tr key={f.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-8 py-6">
                        <p className="font-black text-slate-900 tracking-tight">{f.paciente}</p>
                        <p className="text-[10px] font-bold text-slate-400">{f.id}</p>
                      </td>
                      <td className="px-8 py-6 text-sm font-bold text-slate-600">{f.fecha}</td>
                      <td className="px-8 py-6 text-sm font-black text-slate-900 tracking-tight">{f.total}</td>
                      <td className="px-8 py-6 text-right">
                        <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${f.estado === 'paid' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                          {t(`billing.status.${f.estado}`)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      case 'gestion':
        return (
          <div className="space-y-12 text-left">
            <header className="space-y-4">
              <h2 className="text-5xl font-black text-slate-900 tracking-tight">{t('settings.title')}</h2>
              <p className="text-slate-500 font-medium text-xl">{t('settings.subtitle')}</p>
            </header>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white p-12 rounded-[4rem] border border-slate-100 shadow-xl space-y-8 group hover:border-primary/20 transition-all duration-500">
                <div className="w-16 h-16 rounded-[1.5rem] bg-slate-900 text-white flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Icons.Shield />
                </div>
                <div className="space-y-3">
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">{t('settings.tabs.clinic')}</h3>
                  <p className="text-slate-400 font-medium">{t('settings.sections.info')}</p>
                </div>
                <div className="p-6 bg-slate-50 rounded-[2rem] space-y-4">
                   <div className="flex justify-between border-b border-slate-100 pb-4">
                      <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">{t('settings.fields.name')}</span>
                      <span className="text-[10px] font-black text-slate-900">Molaris Dental Center</span>
                   </div>
                   <div className="flex justify-between">
                      <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">{t('settings.fields.email')}</span>
                      <span className="text-[10px] font-black text-slate-900">contacto@molaris.com</span>
                   </div>
                </div>
              </div>

              <div className="bg-white p-12 rounded-[4rem] border border-slate-100 shadow-xl space-y-8 group hover:border-green-500/20 transition-all duration-500">
                <div className="w-16 h-16 rounded-[1.5rem] bg-green-500 text-white flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Icons.WhatsApp />
                </div>
                <div className="space-y-3">
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">{t('settings.tabs.whatsapp')}</h3>
                  <p className="text-slate-400 font-medium">{t('settings.alerts.reminders')}</p>
                </div>
                <div className="flex items-center gap-4 p-6 bg-green-50 rounded-[2rem]">
                   <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                   <span className="text-[10px] font-black text-green-700 uppercase tracking-widest">{t('settings.fields.wsp_status')}: Activo</span>
                </div>
              </div>

              <div className="bg-white p-12 rounded-[4rem] border border-slate-100 shadow-xl space-y-8 group hover:border-blue-500/20 transition-all duration-500 md:col-span-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-[1.5rem] bg-blue-500 text-white flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Icons.Team />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-2xl font-black text-slate-900 tracking-tight">{t('settings.tabs.team')}</h3>
                      <p className="text-slate-400 font-medium">{t('settings.sections.team_list')}</p>
                    </div>
                  </div>
                  <button className="px-8 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest">{t('settings.access.manage')}</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                   {mockData.equipo.map(m => (
                     <div key={m.id} className="p-6 bg-slate-50/50 rounded-[2rem] border border-slate-100 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center font-black text-slate-400 shadow-sm border border-slate-100">
                          {m.nombre[0]}
                        </div>
                        <div>
                           <p className="text-sm font-black text-slate-900 tracking-tight">{m.nombre}</p>
                           <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{m.rol}</p>
                        </div>
                     </div>
                   ))}
                </div>
              </div>
            </div>
            <div className="py-20 text-center space-y-8">
               <p className="text-xl font-medium text-slate-400">{t('landing.licenses.demo_modal.section_active')}</p>
               <Link to="/register" onClick={onClose} className="inline-block px-12 py-5 bg-primary text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl shadow-primary/30">{t('landing.licenses.demo_modal.try_free')}</Link>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-950/90 backdrop-blur-2xl p-0 md:p-8"
    >
      <motion.div 
        initial={{ scale: 0.95, y: 40 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-white w-full h-full md:max-w-7xl md:rounded-[3rem] shadow-[0_0_100px_rgba(0,0,0,0.5)] relative flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="h-20 border-b border-slate-100 flex items-center justify-between px-8 bg-white shrink-0">
          <div className="flex items-center gap-12">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center shadow-lg">
                 <img src="/favicon.svg" className="w-6 h-6" alt="logo" />
              </div>
              <span className="font-black text-slate-900 tracking-tighter uppercase">{t('landing.licenses.demo_modal.title')}</span>
            </div>
            
            <div className="hidden lg:flex bg-slate-100 p-1 rounded-2xl">
              <button 
                onClick={() => setRole('recepcionista')}
                className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${role === 'recepcionista' ? 'bg-white text-primary shadow-sm' : 'text-slate-400'}`}
              >
                {t('landing.licenses.demo_modal.role_receptionist')}
              </button>
              <button 
                onClick={() => setRole('odontologo')}
                className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${role === 'odontologo' ? 'bg-white text-primary shadow-sm' : 'text-slate-400'}`}
              >
                {t('landing.licenses.demo_modal.role_dentist')}
              </button>
            </div>
          </div>
          
          <button onClick={onClose} className="w-12 h-12 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <div className="flex-grow flex overflow-hidden relative">
          {/* Sidebar - Hidden on Mobile */}
          <div className="hidden md:flex w-72 bg-white border-r border-slate-100 flex-col py-10 shrink-0">
            <nav className="space-y-2 px-4">
              <DemoSidebarLink icon={<Icons.Dashboard />} label={t('landing.licenses.demo_modal.sidebar.dashboard')} active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
              <DemoSidebarLink icon={<Icons.Calendar />} label={t('landing.licenses.demo_modal.sidebar.agenda')} active={activeTab === 'citas'} onClick={() => setActiveTab('citas')} />
              <DemoSidebarLink icon={<Icons.Team />} label={t('landing.licenses.demo_modal.sidebar.patients')} active={activeTab === 'pacientes'} onClick={() => setActiveTab('pacientes')} />
              {role === 'recepcionista' && (
                <>
                  <DemoSidebarLink icon={<Icons.Bill />} label={t('landing.licenses.demo_modal.sidebar.billing')} active={activeTab === 'facturacion'} onClick={() => setActiveTab('facturacion')} />
                  <DemoSidebarLink icon={<Icons.Shield />} label={t('landing.licenses.demo_modal.sidebar.management')} active={activeTab === 'gestion'} onClick={() => setActiveTab('gestion')} />
                </>
              )}
            </nav>
            
            <div className="mt-auto px-6">
               <div className="p-5 bg-slate-50 rounded-[2rem] flex items-center gap-4 border border-slate-100 shadow-sm">
                  <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-xs uppercase">
                    {role[0]}
                  </div>
                  <div className="overflow-hidden text-left">
                    <p className="text-sm font-black text-slate-900 truncate tracking-tight">{role === 'recepcionista' ? 'Juana Pérez' : 'Dr. Arango'}</p>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{role}</p>
                  </div>
               </div>
            </div>
          </div>

          {/* Bottom Navbar - Visible only on Mobile */}
          <div className="md:hidden fixed bottom-0 left-0 right-0 h-20 bg-white/80 backdrop-blur-2xl border-t border-slate-100 z-[100] flex items-center justify-around px-4 pb-2">
            <DemoBottomNavItem icon={<Icons.Dashboard />} label="Dash" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
            <DemoBottomNavItem icon={<Icons.Calendar />} label="Citas" active={activeTab === 'citas'} onClick={() => setActiveTab('citas')} />
            <DemoBottomNavItem icon={<Icons.Team />} label="Pacientes" active={activeTab === 'pacientes'} onClick={() => setActiveTab('pacientes')} />
            {role === 'recepcionista' && (
              <DemoBottomNavItem icon={<Icons.Bill />} label="Fact" active={activeTab === 'facturacion'} onClick={() => setActiveTab('facturacion')} />
            )}
          </div>

          {/* Viewport */}
          <div className="flex-grow overflow-y-auto bg-slate-50/30 p-6 md:p-16 pb-32 md:pb-16 relative">
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div 
                  key="loader"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm z-10"
                >
                  <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                </motion.div>
              ) : (
                <motion.div
                  key={activeTab + role}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="max-w-5xl mx-auto space-y-16"
                >
                  {renderTabContent()}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Global CTA - Hideable */}
        <AnimatePresence>
          {isCtaVisible && (
            <motion.div 
              initial={{ y: 100, opacity: 0, x: '-50%' }}
              animate={{ y: 0, opacity: 1, x: '-50%' }}
              exit={{ y: 100, opacity: 0, x: '-50%' }}
              className="fixed bottom-24 md:bottom-10 left-1/2 w-[calc(100%-2rem)] max-w-2xl z-[150]"
            >
              <div className="bg-slate-900 text-white px-8 py-6 md:px-10 rounded-[2.5rem] shadow-[0_32px_64px_rgba(0,0,0,0.5)] flex flex-col sm:flex-row items-center justify-between gap-6 border border-white/10 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                
                <button 
                  onClick={() => setIsCtaVisible(false)}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/20 transition-all z-10"
                >
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>

                <p className="text-sm font-black tracking-tight text-center sm:text-left pr-4">
                  {t('landing.licenses.demo_modal.ready_to_transform')}
                </p>
                <Link 
                  to="/register" 
                  onClick={onClose} 
                  className="w-full sm:w-auto px-8 py-4 bg-primary text-white rounded-full font-black text-[10px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20 text-center"
                >
                  {t('landing.licenses.demo_modal.try_free')}
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Restore CTA Button (only if hidden) */}
        {!isCtaVisible && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            onClick={() => setIsCtaVisible(true)}
            className="fixed bottom-24 md:bottom-10 right-6 w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-2xl z-[150] border border-white/10"
          >
            <span className="material-symbols-outlined text-primary">rocket_launch</span>
          </motion.button>
        )}
      </motion.div>
    </motion.div>
  );
};

const DemoSidebarLink = ({ icon, label, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-6 px-6 py-4 rounded-2xl transition-all duration-500 ${active ? 'bg-primary/10 text-primary shadow-sm' : 'text-slate-400 hover:text-slate-900 hover:bg-slate-50'}`}
  >
    <div className={`shrink-0 transition-all duration-500 ${active ? 'scale-110 rotate-3' : ''}`}>
       {React.cloneElement(icon, { size: 22, strokeWidth: active ? 3 : 2 })}
    </div>
    <span className="hidden lg:block text-[11px] font-black uppercase tracking-widest">{label}</span>
  </button>
);

const DemoBottomNavItem = ({ icon, label, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center gap-1 transition-all duration-300 ${active ? 'text-primary' : 'text-slate-400'}`}
  >
    <div className={`p-2.5 rounded-2xl transition-all ${active ? 'bg-primary/10 shadow-inner' : ''}`}>
        {React.cloneElement(icon, { size: 24, strokeWidth: active ? 3 : 2 })}
    </div>
    <span className="text-[10px] font-bold uppercase tracking-widest truncate max-w-[60px] text-center">{label}</span>
  </button>
);

const StatCard = ({ label, value, icon, color }) => {
  const colors = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    purple: "bg-purple-50 text-purple-600"
  };

  return (
    <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-[0_16px_48px_rgba(0,0,0,0.04)] flex flex-col gap-8 text-left group hover:border-primary/20 hover:shadow-2xl transition-all duration-700">
       <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-700 group-hover:scale-110 group-hover:rotate-6 ${colors[color]}`}>
          {React.cloneElement(icon, { size: 24, strokeWidth: 2.5 })}
       </div>
       <div>
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-2">{label}</p>
          <p className="text-4xl font-black text-slate-900 tracking-tighter">{value}</p>
       </div>
    </div>
  );
};

export default Landing;
