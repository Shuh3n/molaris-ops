import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const CustomSelect = ({ label, options, value, onChange, placeholder, icon, searchPlaceholder = "Buscar..." }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });
  const containerRef = useRef(null);

  const selectedOption = options.find(opt => opt.id === value);

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
      window.addEventListener('scroll', updateCoords);
      window.addEventListener('resize', updateCoords);
    }
    return () => {
      window.removeEventListener('scroll', updateCoords);
      window.removeEventListener('resize', updateCoords);
    };
  }, [isOpen]);

  const filteredOptions = options.filter(opt => 
    (opt.nombre || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-3 relative" ref={containerRef}>
      {label && <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{label}</label>}
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full flex items-center justify-between px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm transition-all hover:bg-slate-100/50 outline-none ${isOpen ? 'ring-4 ring-primary/10 border-primary/20' : ''}`}
        >
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-slate-400 text-lg">{icon}</span>
            <span className={`font-medium ${selectedOption ? 'text-slate-900' : 'text-slate-400'}`}>
              {selectedOption ? selectedOption.nombre : placeholder}
            </span>
          </div>
          <span className={`material-symbols-outlined text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
            expand_more
          </span>
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 5, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="fixed z-[9999] bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden mt-1"
              style={{ 
                top: coords.top, 
                left: coords.left, 
                width: coords.width,
                maxHeight: '300px'
              }}
            >
              {options.length > 5 && (
                <div className="p-3 border-b border-slate-50">
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
                    <input
                      autoFocus
                      type="text"
                      className="w-full pl-9 pr-4 py-2 bg-slate-50 border-none rounded-xl text-xs outline-none focus:ring-2 focus:ring-primary/10 font-medium"
                      placeholder={searchPlaceholder}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
              )}
              
              <div className="max-h-[200px] overflow-y-auto no-scrollbar py-2">
                {filteredOptions.length === 0 ? (
                  <div className="px-6 py-8 text-center text-slate-400">
                    <span className="material-symbols-outlined text-3xl mb-2 opacity-20">search_off</span>
                    <p className="text-xs italic font-medium">No se encontraron resultados</p>
                  </div>
                ) : (
                  filteredOptions.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        onChange(opt.id);
                        setIsOpen(false);
                        setSearchTerm('');
                      }}
                      className={`w-full px-6 py-3.5 text-left text-sm flex items-center justify-between transition-all hover:bg-primary/5 hover:text-primary group ${value === opt.id ? 'bg-primary/5 text-primary font-bold' : 'text-slate-600 font-medium'}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full transition-all ${value === opt.id ? 'bg-primary scale-100' : 'bg-transparent scale-0 group-hover:scale-100 group-hover:bg-primary/30'}`} />
                        {opt.nombre}
                      </div>
                      {value === opt.id && (
                        <span className="material-symbols-outlined text-lg">check_circle</span>
                      )}
                    </button>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CustomSelect;
