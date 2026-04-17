import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';

const PatientSearch = ({ onSelect, selectedPatient }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (selectedPatient) {
      setSearchTerm(`${selectedPatient.nombre} ${selectedPatient.apellido}`);
    }
  }, [selectedPatient]);

  useEffect(() => {
    const searchPatients = async () => {
      if (searchTerm.length < 2 || (selectedPatient && searchTerm === `${selectedPatient.nombre} ${selectedPatient.apellido}`)) {
        setResults([]);
        return;
      }

      setLoading(true);
      const { data, error } = await supabase
        .from('pacientes')
        .select('*')
        .or(`nombre.ilike.%${searchTerm}%,apellido.ilike.%${searchTerm}%`)
        .eq('activo', true)
        .limit(5);

      if (!error) {
        setResults(data);
      }
      setLoading(false);
    };

    const timeoutId = setTimeout(searchPatients, 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm, selectedPatient]);

  const handleSelect = (patient) => {
    setSearchTerm(`${patient.nombre} ${patient.apellido}`);
    setResults([]);
    setIsOpen(false);
    onSelect(patient);
  };

  return (
    <div ref={wrapperRef} className="relative w-full">
      <div className="relative group">
        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg transition-colors group-focus-within:text-primary">person_search</span>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Buscar paciente por nombre..."
          className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:ring-4 focus:ring-primary/10 focus:border-primary/20 transition-all outline-none font-medium placeholder:text-slate-400"
        />
        {loading && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <motion.div 
              animate={{ rotate: 360 }} 
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full"
            />
          </div>
        )}
      </div>

      <AnimatePresence>
        {isOpen && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="absolute z-50 w-full mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden"
          >
            {results.map((patient) => (
              <button
                key={patient.id}
                onClick={() => handleSelect(patient)}
                className="w-full px-5 py-4 text-left hover:bg-slate-50 transition-colors flex items-center gap-3 border-b border-slate-50 last:border-0"
              >
                <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                  {patient.nombre[0]}{patient.apellido[0]}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">{patient.nombre} {patient.apellido}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{patient.telefono || 'Sin teléfono'}</p>
                </div>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PatientSearch;
