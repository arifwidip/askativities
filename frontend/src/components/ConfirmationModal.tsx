import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { AlertTriangle, Info, CheckCircle2, HelpCircle } from 'lucide-react';

export const ConfirmationModal: React.FC = () => {
  const { confirmState, handleConfirm, handleCancel } = useApp();

  if (!confirmState) return null;

  const { title, message, confirmText = 'Ya', cancelText = 'Batal', type = 'info' } = confirmState.options;

  // Icon configuration based on type
  const getIcon = () => {
    switch (type) {
      case 'danger':
        return (
          <div className="bg-rose-50 text-rose-500 p-4 rounded-3xl mb-4">
            <AlertTriangle size={32} />
          </div>
        );
      case 'warn':
        return (
          <div className="bg-amber-50 text-amber-500 p-4 rounded-3xl mb-4">
            <AlertTriangle size={32} />
          </div>
        );
      case 'success':
        return (
          <div className="bg-emerald-50 text-emerald-500 p-4 rounded-3xl mb-4">
            <CheckCircle2 size={32} />
          </div>
        );
      case 'info':
      default:
        return (
          <div className="bg-primary-50 text-primary-500 p-4 rounded-3xl mb-4">
            <HelpCircle size={32} />
          </div>
        );
    }
  };

  // Button style configuration based on type
  const getConfirmBtnStyle = () => {
    switch (type) {
      case 'danger':
        return 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-500/20';
      case 'warn':
        return 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20';
      case 'success':
        return 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20';
      case 'info':
      default:
        return 'bg-primary-600 hover:bg-primary-700 text-white shadow-primary-500/20';
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
        {/* Backdrop Blur Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleCancel}
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-[4px]"
        />

        {/* Modal Window Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 8 }}
          animate={{ 
            opacity: 1, 
            scale: 1, 
            y: 0,
            transition: { type: 'spring', stiffness: 380, damping: 26 }
          }}
          exit={{ 
            opacity: 0, 
            scale: 0.92, 
            y: 8,
            transition: { duration: 0.15, ease: 'easeOut' }
          }}
          className="bg-white w-full max-w-[320px] rounded-[32px] p-6 shadow-2xl border border-slate-100 flex flex-col items-center text-center relative z-10"
        >
          {getIcon()}
          
          <h3 className="font-extrabold text-lg text-slate-800 tracking-tight leading-snug">
            {title}
          </h3>
          
          <p className="text-slate-500 text-xs mt-2.5 mb-6 leading-relaxed px-1">
            {message}
          </p>

          <div className="flex flex-col gap-2 w-full">
            <button
              onClick={handleConfirm}
              className={`w-full py-3 rounded-2xl font-bold text-sm transition-all duration-100 active-press ${getConfirmBtnStyle()}`}
            >
              {confirmText}
            </button>
            {cancelText && (
              <button
                onClick={handleCancel}
                className="w-full py-3 rounded-2xl font-bold text-sm text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors active-press"
              >
                {cancelText}
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
