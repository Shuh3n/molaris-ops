import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const PatientModal = ({ isOpen, onClose, onSave, patient = null }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    telefono: '',
    telefono_secundario: '',
    documento_id: '',
    fecha_nacimiento: '',
    genero: '',
    email: '',
    direccion: '',
    ocupacion: '',
    alergias: '',
    enfermedades_sistemicas: '',
    nombre_representante: '',
    cedula_representante: '',
    parentesco_representante: ''
  });
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    if (patient) {
      setFormData({
        nombre: patient.nombre || '',
        apellido: patient.apellido || '',
        telefono: patient.telefono || '',
        telefono_secundario: patient.telefono_secundario || '',
        documento_id: patient.documento_id || '',
        fecha_nacimiento: patient.fecha_nacimiento || '',
        genero: patient.genero || '',
        email: patient.email || '',
        direccion: patient.direccion || '',
        ocupacion: patient.ocupacion || '',
        alergias: patient.alergias || '',
        enfermedades_sistemicas: patient.enfermedades_sistemicas || '',
        nombre_representante: patient.nombre_representante || '',
        cedula_representante: patient.cedula_representante || '',
        parentesco_representante: patient.parentesco_representante || ''
      });
    } else {
      setFormData({
        nombre: '',
        apellido: '',
        telefono: '',
        telefono_secundario: '',
        documento_id: '',
        fecha_nacimiento: '',
        genero: '',
        email: '',
        direccion: '',
        ocupacion: '',
        alergias: '',
        enfermedades_sistemicas: '',
        nombre_representante: '',
        cedula_representante: '',
        parentesco_representante: ''
      });
    }
    setCurrentStep(1);
  }, [patient, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (currentStep < 4) {
      setCurrentStep(prev => prev + 1);
      return;
    }
    
    setLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error("Error saving patient:", error);
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep < 4) setCurrentStep(prev => prev + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(prev => prev - 1);
  };

  const steps = [
    { id: 1, label: 'Identificación', icon: 'person' },
    { id: 2, label: 'Contacto', icon: 'call' },
    { id: 3, label: 'Clínico', icon: 'medical_services' },
    { id: 4, label: 'Representante', icon: 'family_history' }
  ];

  const inputClasses = "w-full px-5 py-3.5 bg-white border-2 border-slate-200 rounded-2xl text-slate-900 font-bold focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all placeholder:text-slate-400";
  const labelClasses = "text-[11px] font-black uppercase tracking-widest text-slate-600 ml-1 mb-1 block";

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="relative w-full max-w-2xl bg-white rounded-[2rem] lg:rounded-[2.5rem] shadow-2xl shadow-slate-900/20 overflow-hidden flex flex-col max-h-[95vh]"
          >
            {/* Header */}
            <header className="p-6 lg:p-10 pb-0 shrink-0">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight mb-1">
                    {patient ? t('patients.modal.title_edit') : t('patients.modal.title_create')}
                  </h2>
                  <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">
                    Paso {currentStep} de 4 — {steps.find(s => s.id === currentStep)?.label}
                  </p>
                </div>
                <button 
                  onClick={onClose}
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:text-red-500 transition-colors"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              {/* Progress Bar */}
              <div className="flex gap-2 mb-8">
                {steps.map(step => (
                  <div 
                    key={step.id} 
                    className={`h-2 flex-1 rounded-full transition-all duration-500 ${
                      step.id <= currentStep ? 'bg-primary' : 'bg-slate-100'
                    }`}
                  />
                ))}
              </div>
            </header>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 lg:p-10 pt-0 no-scrollbar">
              <form id="patient-form" onSubmit={handleSubmit} className="space-y-8">
                <AnimatePresence mode="wait">
                  {currentStep === 1 && (
                    <motion.div 
                      key="step1"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="grid grid-cols-1 sm:grid-cols-2 gap-6"
                    >
                      <div className="space-y-1 sm:col-span-1">
                        <label className={labelClasses}>Nombres</label>
                        <input required name="nombre" value={formData.nombre} onChange={handleChange} className={inputClasses} placeholder="Ej. Juan" />
                      </div>
                      <div className="space-y-1 sm:col-span-1">
                        <label className={labelClasses}>Apellidos</label>
                        <input required name="apellido" value={formData.apellido} onChange={handleChange} className={inputClasses} placeholder="Ej. Pérez" />
                      </div>
                      <div className="space-y-1">
                        <label className={labelClasses}>Documento ID</label>
                        <input required name="documento_id" value={formData.documento_id} onChange={handleChange} className={inputClasses} placeholder="Número de cédula" />
                      </div>
                      <div className="space-y-1">
                        <label className={labelClasses}>F. Nacimiento</label>
                        <input required type="date" name="fecha_nacimiento" value={formData.fecha_nacimiento} onChange={handleChange} className={inputClasses} />
                      </div>
                      <div className="space-y-1">
                        <label className={labelClasses}>Género</label>
                        <select name="genero" value={formData.genero} onChange={handleChange} className={inputClasses}>
                          <option value="">Seleccionar...</option>
                          <option value="M">Masculino</option>
                          <option value="F">Femenino</option>
                          <option value="O">Otro</option>
                        </select>
                      </div>
                    </motion.div>
                  )}

                  {currentStep === 2 && (
                    <motion.div 
                      key="step2"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-1">
                          <label className={labelClasses}>Teléfono Principal</label>
                          <input name="telefono" value={formData.telefono} onChange={handleChange} className={inputClasses} placeholder="+54 9..." />
                        </div>
                        <div className="space-y-1">
                          <label className={labelClasses}>Teléfono Secundario</label>
                          <input name="telefono_secundario" value={formData.telefono_secundario} onChange={handleChange} className={inputClasses} placeholder="Emergencias" />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className={labelClasses}>Email</label>
                        <input type="email" name="email" value={formData.email} onChange={handleChange} className={inputClasses} placeholder="paciente@ejemplo.com" />
                      </div>
                      <div className="space-y-1">
                        <label className={labelClasses}>Dirección de Residencia</label>
                        <textarea name="direccion" value={formData.direccion} onChange={handleChange} rows="2" className={`${inputClasses} resize-none`} placeholder="Ciudad, barrio, calle..."></textarea>
                      </div>
                      <div className="space-y-1">
                        <label className={labelClasses}>Ocupación</label>
                        <input name="ocupacion" value={formData.ocupacion} onChange={handleChange} className={inputClasses} placeholder="Ej. Estudiante" />
                      </div>
                    </motion.div>
                  )}

                  {currentStep === 3 && (
                    <motion.div 
                      key="step3"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <div className="space-y-1">
                        <label className={labelClasses}>Alergias (Medicamentos, Látex, Metales)</label>
                        <textarea name="alergias" value={formData.alergias} onChange={handleChange} rows="3" placeholder="Ej. Penicilina, Látex..." className={`${inputClasses} resize-none`}></textarea>
                      </div>
                      <div className="space-y-1">
                        <label className={labelClasses}>Enfermedades Sistémicas (Diabetes, HTA, Cardíacas)</label>
                        <textarea name="enfermedades_sistemicas" value={formData.enfermedades_sistemicas} onChange={handleChange} rows="3" placeholder="Ej. Hipertensión controlada..." className={`${inputClasses} resize-none`}></textarea>
                      </div>
                    </motion.div>
                  )}

                  {currentStep === 4 && (
                    <motion.div 
                      key="step4"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <div className="space-y-1">
                        <label className={labelClasses}>Nombre del Representante</label>
                        <input name="nombre_representante" value={formData.nombre_representante} onChange={handleChange} className={inputClasses} placeholder="Para menores de edad" />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-1">
                          <label className={labelClasses}>Cédula Representante</label>
                          <input name="cedula_representante" value={formData.cedula_representante} onChange={handleChange} className={inputClasses} placeholder="Documento ID" />
                        </div>
                        <div className="space-y-1">
                          <label className={labelClasses}>Parentesco</label>
                          <input name="parentesco_representante" value={formData.parentesco_representante} onChange={handleChange} className={inputClasses} placeholder="Padre, Madre, etc." />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </form>
            </div>

            {/* Footer */}
            <div className="p-6 lg:p-10 bg-slate-50 shrink-0 flex flex-col sm:flex-row gap-4">
              <button
                type="button"
                onClick={currentStep === 1 ? onClose : prevStep}
                className="flex-1 px-8 py-4 text-slate-500 hover:text-slate-900 font-black transition-all rounded-2xl border-2 border-slate-200 hover:border-slate-300 bg-white flex items-center justify-center gap-2"
              >
                {currentStep === 1 ? t('patients.modal.cancel') : (
                  <>
                    <span className="material-symbols-outlined">arrow_back</span>
                    Anterior
                  </>
                )}
              </button>
              <button
                type="submit"
                form="patient-form"
                disabled={loading}
                className="flex-[2] bg-primary text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
                ) : (
                  <span className="material-symbols-outlined">{currentStep === 4 ? 'check_circle' : 'arrow_forward'}</span>
                )}
                {loading ? 'Procesando...' : (currentStep === 4 ? t('patients.modal.save') : 'Siguiente')}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default PatientModal;
