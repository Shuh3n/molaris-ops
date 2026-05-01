import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/** Convierte una hora en formato 24h (número) a formato 12h con AM/PM */
const to12h = (h) => {
  const period = h < 12 ? 'AM' : 'PM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return { h12, period };
};

/** Formatea un valor "HH:MM" en legible: "1:00 PM" */
const formatDisplayTime = (value) => {
  if (!value) return null;
  const [hStr, mStr] = value.split(':');
  const h = parseInt(hStr, 10);
  const { h12, period } = to12h(h);
  return `${h12}:${mStr} ${period}`;
};

const CustomTimePicker = ({ value, onChange, label, placeholder, icon = 'schedule', selectedDate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });
  const containerRef = useRef(null);

  // Determinar si el día seleccionado es sábado
  const isSaturday = selectedDate
    ? new Date(selectedDate + 'T00:00:00').getDay() === 6
    : false;

  const allHours = Array.from({ length: 14 }, (_, i) => i + 7); // 7 AM → 8 PM
  const hours = isSaturday ? allHours.filter(h => h <= 16) : allHours;
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
    // En sábado no se puede superar las 16:00
    if (isSaturday && (h > 16 || (h === 16 && m !== '00'))) return;
    const formattedHour = h.toString().padStart(2, '0');
    onChange(`${formattedHour}:${m}`);
    setIsOpen(false);
  };

  const [selectedH, selectedM] = value ? value.split(':') : ['', ''];
  const selectedHNum = selectedH ? parseInt(selectedH, 10) : null;

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
          {value ? (
            <span className="font-bold text-slate-900">
              {formatDisplayTime(value)}
            </span>
          ) : (
            <span className="font-medium text-slate-400">{placeholder || 'Seleccionar hora...'}</span>
          )}
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 5, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="fixed z-[9999] bg-white rounded-[2rem] shadow-2xl border border-slate-100 overflow-hidden"
              style={{
                top: coords.top,
                left: window.innerWidth < 400 ? '50%' : coords.left,
                transform: window.innerWidth < 400 ? 'translateX(-50%)' : 'none',
                width: '280px',
              }}
            >
              {/* Header */}
              <div className="px-6 py-4 border-b border-slate-50 bg-slate-50/50 text-center">
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
                  {value ? formatDisplayTime(value) : 'Elige una hora'}
                </p>
              </div>

              <div className="flex h-[280px]">
                {/* Columna de Horas */}
                <div className="flex-1 overflow-y-auto no-scrollbar py-3 border-r border-slate-50">
                  <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest text-center mb-3">Hora</p>
                  {hours.map(h => {
                    const formattedH = h.toString().padStart(2, '0');
                    const { h12, period } = to12h(h);
                    const isSelected = selectedHNum === h;
                    return (
                      <button
                        key={h}
                        type="button"
                        onClick={() => handleTimeSelect(h, selectedM || '00')}
                        className={`w-full py-2.5 px-4 flex items-center justify-between text-sm font-bold transition-all
                          ${isSelected
                            ? 'bg-primary text-white'
                            : 'text-slate-600 hover:bg-primary/5 hover:text-primary'
                          }`}
                      >
                        <span>{h12}</span>
                        <span className={`text-[10px] font-black tracking-widest ${isSelected ? 'text-white/70' : 'text-slate-300'}`}>
                          {period}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Columna de Minutos */}
                <div className="flex-1 overflow-y-auto no-scrollbar py-3">
                  <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest text-center mb-3">Min</p>
                  {minutes.map(m => {
                    const isSelected = selectedM === m;
                    return (
                      <button
                        key={m}
                        type="button"
                        onClick={() => handleTimeSelect(selectedHNum || 9, m)}
                        className={`w-full py-2.5 px-4 text-sm font-bold transition-all
                          ${isSelected
                            ? 'bg-primary text-white'
                            : 'text-slate-600 hover:bg-primary/5 hover:text-primary'
                          }`}
                      >
                        :{m}
                      </button>
                    );
                  })}
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
