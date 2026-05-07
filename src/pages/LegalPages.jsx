import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const LegalPage = ({ title, lastUpdated, children }) => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-body selection:bg-primary/20 selection:text-primary">
      {/* Mini Navbar */}
      <nav className="fixed top-0 left-0 right-0 h-20 bg-white/80 backdrop-blur-xl border-b border-slate-100 z-50 flex items-center justify-between px-6 lg:px-12">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center">
            <img src="/favicon.svg" alt="logo" className="w-5 h-5" />
          </div>
          <span className="font-black text-lg tracking-tighter uppercase">MOLARIS OPS</span>
        </Link>
        <Link to="/" className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-primary transition-colors">Volver</Link>
      </nav>

      <main className="pt-40 pb-32 px-6">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-12"
          >
            <header className="space-y-4">
              <h1 className="text-4xl md:text-6xl font-black tracking-tight text-slate-900 uppercase italic">
                {title}
              </h1>
              <p className="text-slate-400 font-bold text-xs tracking-widest uppercase">
                Última actualización: {lastUpdated}
              </p>
            </header>

            <div className="prose prose-slate prose-lg max-w-none prose-headings:font-black prose-headings:uppercase prose-headings:tracking-tight prose-p:text-slate-600 prose-p:leading-relaxed">
              {children}
            </div>
          </motion.div>
        </div>
      </main>

      <footer className="py-12 border-t border-slate-100 text-center">
        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">© 2026 MOLARIS OPS. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
};

export const PrivacyPolicy = () => (
  <LegalPage title="Política de Privacidad" lastUpdated="Mayo 2026">
    <p>En Molaris OPS, la privacidad de los datos clínicos es nuestra máxima prioridad. Esta política describe cómo recolectamos, usamos y protegemos la información de su clínica y sus pacientes.</p>
    <h3>1. Recolección de Datos</h3>
    <p>Recolectamos información necesaria para la gestión clínica, incluyendo datos de contacto, registros de salud y facturación, siempre bajo los más altos estándares de seguridad.</p>
    <h3>2. Seguridad de la Información</h3>
    <p>Utilizamos encriptación AES-256 de grado bancario para proteger toda la información almacenada en nuestros servidores.</p>
    <h3>3. Sus Derechos</h3>
    <p>Usted mantiene en todo momento la propiedad de sus datos y tiene derecho a exportarlos o eliminarlos de nuestra plataforma.</p>
  </LegalPage>
);

export const TermsOfService = () => (
  <LegalPage title="Términos de Servicio" lastUpdated="Mayo 2026">
    <p>Al utilizar Molaris OPS, usted acepta los siguientes términos y condiciones de uso de nuestra plataforma de gestión dental.</p>
    <h3>1. Uso de la Licencia</h3>
    <p>La licencia es intransferible y está sujeta al plan seleccionado. El uso indebido de la plataforma puede resultar en la suspensión del servicio.</p>
    <h3>2. Responsabilidad</h3>
    <p>Molaris OPS es una herramienta de apoyo administrativo. El profesional clínico es el único responsable de la exactitud de los diagnósticos y tratamientos registrados.</p>
    <h3>3. Pagos y Cancelaciones</h3>
    <p>Los planes se facturan por adelantado y pueden cancelarse en cualquier momento, manteniendo el acceso hasta el final del periodo pagado.</p>
  </LegalPage>
);

export const CookiesPolicy = () => (
  <LegalPage title="Política de Cookies" lastUpdated="Mayo 2026">
    <p>Molaris OPS utiliza cookies técnicas y analíticas para mejorar su experiencia de uso y optimizar el rendimiento de nuestra plataforma.</p>
    <h3>1. ¿Qué son las cookies?</h3>
    <p>Son pequeños archivos de texto que se almacenan en su navegador para recordar sus preferencias y sesiones activas.</p>
    <h3>2. Tipos de Cookies</h3>
    <ul>
      <li><strong>Esenciales:</strong> Necesarias para el inicio de sesión y la seguridad.</li>
      <li><strong>Analíticas:</strong> Nos ayudan a entender cómo se usa la plataforma para mejorarla.</li>
    </ul>
    <h3>3. Gestión de Cookies</h3>
    <p>Puede desactivar las cookies en la configuración de su navegador, aunque esto podría afectar el funcionamiento de algunas características de Molaris OPS.</p>
  </LegalPage>
);
