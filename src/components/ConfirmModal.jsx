import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText, cancelText, type = 'danger' }) => {
  const { t } = useTranslation();

  const colors = {
    danger: {
      bg: 'bg-red-50',
      icon: 'text-red-500',
      button: 'bg-red-500 shadow-red-200'
    },
    warning: {
      bg: 'bg-amber-50',
      icon: 'text-amber-500',
      button: 'bg-amber-500 shadow-amber-200'
    },
    info: {
      bg: 'bg-blue-50',
      icon: 'text-primary',
      button: 'bg-primary shadow-primary/20'
    }
  };

  const style = colors[type] || colors.danger;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm cursor-pointer"
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl p-8 lg:p-10 text-center pointer-events-auto"
          >
            <div className={`w-20 h-20 ${style.bg} rounded-3xl flex items-center justify-center mx-auto mb-6`}>
              <span className={`material-symbols-outlined text-4xl ${style.icon}`}>
                {type === 'danger' ? 'delete_forever' : type === 'warning' ? 'warning' : 'info'}
              </span>
            </div>
            
            <h3 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">
              {title || t('common.confirm_delete_title')}
            </h3>
            <p className="text-slate-500 font-medium leading-relaxed mb-10 text-sm">
              {message || t('common.confirm_delete_message')}
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all border-2 border-slate-100 cursor-pointer"
              >
                {cancelText || t('common.actions.cancel')}
              </button>
              <button
                type="button"
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className={`flex-1 px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-white shadow-xl transition-all hover:scale-[1.02] active:scale-95 cursor-pointer ${style.button}`}
              >
                {confirmText || t('common.actions.confirm')}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmModal;
