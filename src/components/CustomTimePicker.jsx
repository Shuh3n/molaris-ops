import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const CustomTimePicker = ({ value, onChange, label, placeholder, icon = 'schedule' }) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });
  const containerRef = useRef(null);

  const hours = Array.from({ length: 14 }, (_, i) => i + 7); // De 7 AM a 8 PM
  const minutes = ['00', '15', '30', '45'];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const updateCoords = () => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width
      });
    }
  };

  useEffect(() => {
    if (isOpen) {
      updateCoords();
      window.addEventListener('scroll', updateCoords, true);
      window.addEventListener('resize', updateCoords);
    }
    return () => {
      window.removeEventListener('scroll', updateCoords, true);
      window.removeEventListener('resize', updateCoords);
    };
  }, [isOpen]);

  const handleTimeSelect = (h, m) => {
    const formattedHour = h.toString().padStart(2, '0');
    onChange(`${formattedHour}:${m}`);
    setIsOpen(false);
  };

  const [selectedH, selectedM] = value ? value.split(':') : ['', ''];

  return (
    <div className="space-y-3 relative w-full" ref={containerRef}>
      {label && <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{label}</label>}
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full flex items-center gap-4 px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm transition-all hover:bg-slate-100/50 outline-none ${isOpen ? 'ring-4 ring-primary/10 border-primary/20' : ''}`}
        >
          <span className={`material-symbols-outlined text-lg transition-colors ${isOpen || value ? 'text-primary' : 'text-slate-400'}`}>
            {icon}
          </span>
          <span className={`font-medium ${value ? 'text-slate-900' : 'text-slate-400'}`}>
            {value || placeholder || '09:00'}
          </span>
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 5, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="fixed z-[9999] w-full sm:w-[300px] bg-white rounded-[2rem] shadow-2xl border border-slate-100 overflow-hidden"
              style={{ 
                top: coords.top, 
                left: window.innerWidth < 400 ? '50%' : coords.left,
                transform: window.innerWidth < 400 ? 'translateX(-50%)' : 'none'
              }}
            >
              <div className="flex h-[300px]">
                {/* Hours Column */}
                <div className="flex-1 overflow-y-auto no-scrollbar py-4 border-r border-slate-50">
                  <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest text-center mb-4">Hora</p>
                  {hours.map(h => {
                    const formattedH = h.toString().padStart(2, '0');
                    return (
                      <button
                        key={h}
                        type="button"
                        onClick={() => handleTimeSelect(h, selectedM || '00')}
                        className={`w-full py-3 text-sm font-bold transition-all ${selectedH === formattedH ? 'bg-primary text-white scale-110 rounded-lg mx-2 w-auto' : 'text-slate-600 hover:bg-primary/5 hover:text-primary'}`}
                      >
                        {formattedH}
                      </button>
                    );
                  })}
                </div>
                {/* Minutes Column */}
                <div className="flex-1 overflow-y-auto no-scrollbar py-4 bg-slate-50/30">
                  <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest text-center mb-4">Min</p>
                  {minutes.map(m => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => handleTimeSelect(selectedH || '09', m)}
                      className={`w-full py-3 text-sm font-bold transition-all ${selectedM === m ? 'bg-primary text-white scale-110 rounded-lg mx-2 w-auto' : 'text-slate-600 hover:bg-primary/5 hover:text-primary'}`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-center">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-6 py-2 bg-white text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-widest border border-slate-100 shadow-sm hover:text-slate-600 transition-all"
                >
                  Cerrar
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CustomTimePicker;
