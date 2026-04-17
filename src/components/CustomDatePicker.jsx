import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, isToday, isBefore, startOfToday, parse, isValid, parseISO, isAfter } from 'date-fns';
import { es, enUS } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';

const CustomDatePicker = ({ value, onChange, label, placeholder, icon = 'calendar_today', maxDate = new Date(), minDate }) => {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });
  const [isInvalid, setIsInvalid] = useState(false);
  const containerRef = useRef(null);

  const locale = i18n.language === 'es' ? es : enUS;
  const dateFormat = i18n.language === 'es' ? 'dd/MM/yyyy' : 'MM/dd/yyyy';

  useEffect(() => {
    if (value) {
      const datePart = value.split('T')[0];
      const date = parseISO(datePart); 
      if (isValid(date)) {
        setInputValue(format(date, dateFormat));
        setCurrentMonth(date);
        setIsInvalid(false);
      }
    } else {
      setInputValue('');
    }
  }, [value, dateFormat]);

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

  const handleInputChange = (e) => {
    let val = e.target.value.replace(/\D/g, ''); 
    if (val.length > 8) val = val.slice(0, 8);

    let maskedVal = '';
    if (val.length > 0) maskedVal += val.slice(0, 2);
    if (val.length > 2) maskedVal += '/' + val.slice(2, 4);
    if (val.length > 4) maskedVal += '/' + val.slice(4, 8);

    setInputValue(maskedVal);

    if (val.length === 8) {
      const parsedDate = parse(maskedVal, dateFormat, new Date());
      if (isValid(parsedDate)) {
        // Validación de fecha futura
        if (maxDate && isAfter(parsedDate, maxDate) && !isSameDay(parsedDate, maxDate)) {
          setIsInvalid(true);
          return;
        }
        if (minDate && isBefore(parsedDate, startOfToday()) && !isSameDay(parsedDate, startOfToday())) {
          setIsInvalid(true);
          return;
        }
        setIsInvalid(false);
        const year = parsedDate.getFullYear();
        const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
        const day = String(parsedDate.getDate()).padStart(2, '0');
        onChange(`${year}-${month}-${day}`);
        setCurrentMonth(parsedDate);
      } else {
        setIsInvalid(true);
      }
    } else {
      setIsInvalid(false);
    }
  };

  const handleDateClick = (date) => {
    if (maxDate && isAfter(date, maxDate) && !isSameDay(date, maxDate)) return;
    if (minDate && isBefore(date, startOfToday()) && !isSameDay(date, startOfToday())) return;
    setIsInvalid(false);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    onChange(`${year}-${month}-${day}`);
    setIsOpen(false);
  };

  return (
    <div className="space-y-3 relative w-full" ref={containerRef}>
      {label && <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{label}</label>}
      <div className="relative group">
        <span className={`material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-lg transition-colors z-10 ${isInvalid ? 'text-red-500' : (isOpen || value ? 'text-primary' : 'text-slate-400')}`}>
          {isInvalid ? 'error' : icon}
        </span>
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder || dateFormat}
          className={`w-full pl-12 pr-4 py-4 bg-slate-50 border-2 rounded-2xl text-sm font-bold transition-all outline-none placeholder:text-slate-300 
            ${isInvalid ? 'border-red-400 ring-4 ring-red-400/5' : (isOpen ? 'border-primary/20 ring-4 ring-primary/10' : 'border-slate-100')} 
            text-slate-900`}
        />
        {isInvalid && (
          <p className="text-[9px] text-red-500 font-black uppercase tracking-widest mt-1 ml-1">
            {maxDate && isAfter(parse(inputValue, dateFormat, new Date()), maxDate) ? 'No puede ser futura' : 'Fecha inválida'}
          </p>
        )}

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 5, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="fixed z-[9999] w-[320px] bg-white rounded-[2rem] shadow-2xl border border-slate-100 overflow-hidden"
              style={{ 
                top: coords.top, 
                left: window.innerWidth < 400 ? '50%' : coords.left,
                transform: window.innerWidth < 400 ? 'translateX(-50%)' : 'none'
              }}
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-50 bg-slate-50/50">
                <button type="button" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-primary hover:bg-white rounded-lg transition-all shadow-sm border border-slate-100">
                  <span className="material-symbols-outlined text-lg">chevron_left</span>
                </button>
                <h4 className="text-sm font-black text-slate-900 capitalize tracking-tight">{format(currentMonth, 'MMMM yyyy', { locale })}</h4>
                <button type="button" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-primary hover:bg-white rounded-lg transition-all shadow-sm border border-slate-100">
                  <span className="material-symbols-outlined text-lg">chevron_right</span>
                </button>
              </div>
              <div className="p-2">
                <div className="grid grid-cols-7 mb-2">
                  {(i18n.language === 'es' ? ['D', 'L', 'M', 'M', 'J', 'V', 'S'] : ['S', 'M', 'T', 'W', 'T', 'F', 'S']).map((day, i) => (
                    <div key={i} className="text-center text-[10px] font-black text-slate-300 uppercase py-2">{day}</div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1 px-4 pb-4">
                  {eachDayOfInterval({ 
                    start: startOfWeek(startOfMonth(currentMonth)), 
                    end: endOfWeek(endOfMonth(currentMonth)) 
                  }).map((day, i) => {
                    const isSelected = value && format(day, 'yyyy-MM-dd') === value.split('T')[0];
                    const isFuture = maxDate && isAfter(day, maxDate) && !isSameDay(day, maxDate);
                    const isDisabled = !isSameMonth(day, currentMonth) || isFuture || (minDate && isBefore(day, startOfToday()) && !isSameDay(day, startOfToday()));
                    return (
                      <button key={i} type="button" disabled={isDisabled} onClick={() => handleDateClick(day)}
                        className={`h-9 w-9 flex items-center justify-center rounded-xl text-xs font-bold transition-all relative ${isSelected ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-110 z-10' : isDisabled ? 'text-slate-200 cursor-not-allowed' : 'text-slate-600 hover:bg-primary/5 hover:text-primary'} ${isToday(day) && !isSelected ? 'text-primary ring-1 ring-primary/20 bg-primary/5' : ''}`}>
                        {format(day, 'd')}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="p-4 bg-slate-50/50 border-t border-slate-50 flex justify-center">
                <button type="button" onClick={() => { const today = new Date(); setCurrentMonth(today); handleDateClick(today); }}
                  className="px-4 py-2 bg-white text-primary rounded-xl text-[10px] font-black uppercase tracking-widest border border-slate-100 shadow-sm hover:bg-slate-50 transition-all">
                  {i18n.language === 'es' ? 'Hoy' : 'Today'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CustomDatePicker;
