import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import CustomDatePicker from './CustomDatePicker';
import CustomSelect from './CustomSelect';

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
    requiere_acompanante: false,
    nombre_representante: '',
    cedula_representante: '',
    parentesco_representante: ''
  });
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState({});

  const genderOptions = useMemo(() => [
    { id: 'M', nombre: t('patients.modal.genders.male') },
    { id: 'F', nombre: t('patients.modal.genders.female') },
    { id: 'O', nombre: t('patients.modal.genders.other') }
  ], [t]);

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
        requiere_acompanante: patient.requiere_acompanante || false,
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
        requiere_acompanante: false,
        nombre_representante: '',
        cedula_representante: '',
        parentesco_representante: ''
      });
    }
    setCurrentStep(1);
    setErrors({});
  }, [patient, isOpen]);

  const age = useMemo(() => {
    if (!formData.fecha_nacimiento) return null;
    const birthDate = new Date(formData.fecha_nacimiento);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }, [formData.fecha_nacimiento]);

  const isMinor = age !== null && age < 18;
  const needsResponsible = isMinor || formData.requiere_acompanante;

  const validateStep = (step) => {
    const newErrors = {};
    if (step === 1) {
      if (!formData.nombre.trim()) newErrors.nombre = true;
      if (!formData.apellido.trim()) newErrors.apellido = true;
      if (!/^[0-9]{6,15}$/.test(formData.documento_id)) newErrors.documento_id = t('patients.modal.validation.id');
      if (!formData.fecha_nacimiento) newErrors.fecha_nacimiento = true;
    }
    if (step === 2) {
      if (!/^\+?[0-9]{7,15}$/.test(formData.telefono)) newErrors.telefono = t('patients.modal.validation.phone');
    }
    if (step === 4 && needsResponsible) {
      if (!formData.nombre_representante.trim() || !formData.cedula_representante.trim()) {
        newErrors.responsible = t('patients.modal.validation.resp_required');
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === 'documento_id' || name === 'cedula_representante') {
      if (value !== '' && !/^[0-9]+$/.test(value)) return;
    }
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep(currentStep)) return;
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

  const steps = [
    { id: 1, label: t('patients.modal.steps.identity'), icon: 'person' },
    { id: 2, label: t('patients.modal.steps.contact'), icon: 'call' },
    { id: 3, label: t('patients.modal.steps.clinical'), icon: 'medical_services' },
    { id: 4, label: t('patients.modal.steps.responsible'), icon: 'family_history' }
  ];

  const inputClasses = (name) => `w-full px-5 py-3.5 bg-white border-2 ${errors[name] ? 'border-red-400 ring-4 ring-red-400/5' : 'border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/5'} rounded-2xl text-sm font-bold transition-all placeholder:text-slate-300 outline-none text-slate-900`;
  const labelClasses = "text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 mb-1 block";

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
          <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="relative w-full max-w-2xl bg-white rounded-[2rem] lg:rounded-[2.5rem] shadow-2xl shadow-slate-900/20 overflow-hidden flex flex-col max-h-[95vh]">
            
            <header className="p-6 lg:p-10 pb-0 shrink-0">
              <div className="flex justify-between items-start mb-6">
                <div className="text-left">
                  <h2 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight mb-1">
                    {patient ? t('patients.modal.title_edit') : t('patients.modal.title_create')}
                  </h2>
                  <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest opacity-60">
                    Paso {currentStep} de 4 — {steps.find(s => s.id === currentStep)?.label}
                  </p>
                </div>
                <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:text-red-500 transition-colors">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              <div className="flex gap-2 mb-8">
                {steps.map(step => (
                  <div key={step.id} className={`h-2 flex-1 rounded-full transition-all duration-500 ${step.id <= currentStep ? 'bg-primary' : 'bg-slate-100'}`} />
                ))}
              </div>
            </header>

            <div className="flex-1 overflow-y-auto p-6 lg:p-10 pt-0 no-scrollbar overflow-x-visible">
              <form id="patient-form" onSubmit={handleSubmit} className="space-y-8">
                <AnimatePresence mode="wait">
                  {currentStep === 1 && (
                    <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6 text-left">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-1 sm:col-span-1">
                          <label className={labelClasses}>{t('patients.modal.first_name')}</label>
                          <input required name="nombre" value={formData.nombre} onChange={handleChange} className={inputClasses('nombre')} placeholder="Ej. Juan Andrés" />
                        </div>
                        <div className="space-y-1 sm:col-span-1">
                          <label className={labelClasses}>{t('patients.modal.last_name')}</label>
                          <input required name="apellido" value={formData.apellido} onChange={handleChange} className={inputClasses('apellido')} placeholder="Ej. Pérez García" />
                        </div>
                        <div className="space-y-1">
                          <label className={labelClasses}>{t('patients.modal.document_id')}</label>
                          <input required name="documento_id" value={formData.documento_id} onChange={handleChange} className={inputClasses('documento_id')} placeholder="Solo números (ej. 12345678)" />
                          {errors.documento_id && <p className="text-[10px] text-red-500 font-bold mt-1 ml-1">{errors.documento_id}</p>}
                        </div>
                        <CustomDatePicker label={t('patients.modal.birth_date')} value={formData.fecha_nacimiento} onChange={(val) => { setFormData(prev => ({ ...prev, fecha_nacimiento: val })); if (errors.fecha_nacimiento) setErrors(prev => ({ ...prev, fecha_nacimiento: null })); }} placeholder="DD/MM/AAAA" />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <CustomSelect label={t('patients.modal.gender')} options={genderOptions} value={formData.genero} onChange={(val) => setFormData(prev => ({ ...prev, genero: val }))} placeholder="Seleccionar Género..." icon="wc" />
                        {!isMinor && (
                          <div className="flex flex-col justify-center gap-3 pt-4">
                            <label className={labelClasses}>{t('patients.modal.needs_companion')}</label>
                            <div className="flex items-center gap-3">
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" name="requiere_acompanante" checked={formData.requiere_acompanante} onChange={handleChange} className="sr-only peer" />
                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                              </label>
                              <span className="text-xs font-bold text-slate-500">{formData.requiere_acompanante ? 'Sí, requiere' : 'No requiere'}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}

                  {currentStep === 2 && (
                    <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6 text-left">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-1">
                          <label className={labelClasses}>{t('patients.modal.phone')}</label>
                          <input name="telefono" value={formData.telefono} onChange={handleChange} className={inputClasses('telefono')} placeholder="Ej. +584121234567" />
                          {errors.telefono && <p className="text-[10px] text-red-500 font-bold mt-1 ml-1">{errors.telefono}</p>}
                        </div>
                        <div className="space-y-1">
                          <label className={labelClasses}>{t('patients.modal.phone_sec')}</label>
                          <input name="telefono_secundario" value={formData.telefono_secundario} onChange={handleChange} className={inputClasses('telefono_secundario')} placeholder="Número de emergencia" />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className={labelClasses}>{t('patients.modal.email')}</label>
                        <input type="email" name="email" value={formData.email} onChange={handleChange} className={inputClasses('email')} placeholder="paciente@correo.com" />
                      </div>
                      <div className="space-y-1">
                        <label className={labelClasses}>{t('patients.modal.address')}</label>
                        <textarea name="direccion" value={formData.direccion} onChange={handleChange} rows="2" className={`${inputClasses('direccion')} resize-none`} placeholder="Av. Principal, Edif. Molaris, Apto 4B" />
                      </div>
                      <div className="space-y-1">
                        <label className={labelClasses}>{t('patients.modal.occupation')}</label>
                        <input name="ocupacion" value={formData.ocupacion} onChange={handleChange} className={inputClasses('ocupacion')} placeholder="Ej. Ingeniero de Software" />
                      </div>
                    </motion.div>
                  )}

                  {currentStep === 3 && (
                    <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6 text-left">
                      <div className="space-y-1">
                        <label className={labelClasses}>{t('patients.modal.allergies')}</label>
                        <textarea name="alergias" value={formData.alergias} onChange={handleChange} rows="3" className={`${inputClasses('alergias')} resize-none`} placeholder="Ej. Alérgico a la Penicilina y al Látex." />
                      </div>
                      <div className="space-y-1">
                        <label className={labelClasses}>{t('patients.modal.illnesses')}</label>
                        <textarea name="enfermedades_sistemicas" value={formData.enfermedades_sistemicas} onChange={handleChange} rows="3" className={`${inputClasses('enfermedades_sistemicas')} resize-none`} placeholder="Ej. Hipertensión controlada, Diabetes tipo 2." />
                      </div>
                    </motion.div>
                  )}

                  {currentStep === 4 && (
                    <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6 text-left">
                      {!needsResponsible ? (
                        <div className="p-10 text-center bg-slate-50 rounded-[2.5rem] border border-slate-100 border-dashed">
                          <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                            <span className="material-symbols-outlined text-4xl text-slate-200">family_history</span>
                          </div>
                          <p className="text-slate-400 font-bold text-sm">Sección opcional</p>
                          <p className="text-slate-300 font-medium text-xs mt-2 italic">Este paciente no requiere representante legal según su edad o condición.</p>
                        </div>
                      ) : (
                        <>
                          {errors.responsible && <p className="p-4 bg-red-50 text-red-500 text-[10px] font-black rounded-2xl text-center uppercase tracking-widest border border-red-100 mb-6">{errors.responsible}</p>}
                          <div className="space-y-1">
                            <label className={labelClasses}>{t('patients.modal.resp_name')}</label>
                            <input name="nombre_representante" value={formData.nombre_representante} onChange={handleChange} className={inputClasses('nombre_representante')} placeholder="Nombre completo del padre, madre o tutor" required={needsResponsible} />
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="space-y-1">
                              <label className={labelClasses}>{t('patients.modal.resp_id')}</label>
                              <input name="cedula_representante" value={formData.cedula_representante} onChange={handleChange} className={inputClasses('cedula_representante')} placeholder="Documento ID del responsable" required={needsResponsible} />
                            </div>
                            <div className="space-y-1">
                              <label className={labelClasses}>{t('patients.modal.resp_rel')}</label>
                              <input name="parentesco_representante" value={formData.parentesco_representante} onChange={handleChange} className={inputClasses('parentesco_representante')} placeholder="Ej. Padre, Madre, Abuelo" required={needsResponsible} />
                            </div>
                          </div>
                        </>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </form>
            </div>

            <footer className="p-6 lg:p-10 bg-slate-50 shrink-0 flex flex-col sm:flex-row gap-4 border-t border-slate-100">
              <button type="button" onClick={currentStep === 1 ? onClose : () => setCurrentStep(prev => prev - 1)}
                className="flex-1 px-8 py-4 text-slate-500 hover:text-slate-900 font-black transition-all rounded-2xl border-2 border-slate-200 hover:border-slate-300 bg-white flex items-center justify-center gap-2 text-xs uppercase tracking-widest">
                {currentStep === 1 ? t('patients.modal.cancel') : t('common.actions.back')}
              </button>
              <button type="submit" form="patient-form" disabled={loading}
                className="flex-[2] bg-primary text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2 text-xs uppercase tracking-widest">
                {loading ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" /> : 
                  <span className="material-symbols-outlined text-lg">{currentStep === 4 ? 'check_circle' : 'arrow_forward'}</span>}
                {loading ? t('patients.modal.loading') : (currentStep === 4 ? t('patients.modal.save') : t('common.actions.next'))}
              </button>
            </footer>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default PatientModal;
