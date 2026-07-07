'use client';

import { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle } from 'lucide-react';

const DialogContext = createContext({});

export function DialogProvider({ children }) {
  const [dialog, setDialog] = useState({ isOpen: false, title: '', message: '', isDanger: false, type: 'alert', onConfirm: null });
  const [toasts, setToasts] = useState([]);

  // type: 'alert' | 'confirm'
  const showDialog = useCallback((options) => {
    setDialog({ isOpen: true, type: 'alert', isDanger: false, onConfirm: null, ...options });
  }, []);

  const hideDialog = useCallback(() => {
    setDialog(prev => ({ ...prev, isOpen: false }));
  }, []);

  const showToast = useCallback((message, type = 'success') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  const confirmAction = () => {
    if (dialog.onConfirm) dialog.onConfirm();
    hideDialog();
  };

  return (
    <DialogContext.Provider value={{ showDialog, hideDialog, showToast }}>
      {children}

      {/* Dialog Overlay */}
      <AnimatePresence>
        {dialog.isOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
            onClick={hideDialog}>
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 10 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              style={{ backgroundColor: 'var(--canvas)', borderRadius: 'var(--radius-xl)', padding: 'var(--space-xl)', width: '100%', maxWidth: 400, textAlign: 'center', border: '1px solid var(--surface-card)' }}>
              <div style={{ marginBottom: 20 }}>
                {dialog.type === 'alert' && (
                  <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 48, height: 48, borderRadius: '50%', backgroundColor: dialog.isDanger ? 'rgba(255,59,48,0.1)' : 'rgba(0,122,255,0.1)', color: dialog.isDanger ? 'var(--error)' : 'var(--primary)', marginBottom: 16 }}>
                    <AlertCircle size={24} />
                  </div>
                )}
                <h3 className="title-lg">{dialog.title}</h3>
                <p className="body-md" style={{ color: 'var(--muted)', marginTop: 8 }}>{dialog.message}</p>
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                {dialog.type === 'confirm' && (
                  <button type="button" className="btn-secondary" onClick={hideDialog} style={{ flex: 1, justifyContent: 'center' }}>
                    Batal
                  </button>
                )}
                <button type="button" className="btn-primary" onClick={confirmAction} style={{ flex: 1, justifyContent: 'center', backgroundColor: dialog.isDanger ? 'var(--error)' : 'var(--primary)' }}>
                  {dialog.type === 'confirm' ? (dialog.isDanger ? 'Ya, Hapus' : 'Ya, Lanjutkan') : 'Mengerti'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast Container */}
      <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 8, pointerEvents: 'none' }}>
        <AnimatePresence>
          {toasts.map(toast => (
            <motion.div key={toast.id} initial={{ opacity: 0, y: 20, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
              style={{ backgroundColor: toast.type === 'success' ? '#34C759' : 'var(--error)', color: 'white', padding: '10px 16px', borderRadius: 100, display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.15)', pointerEvents: 'auto' }}>
              {toast.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
              <span style={{ fontSize: 13, fontWeight: 500 }}>{toast.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </DialogContext.Provider>
  );
}

export function useDialog() {
  return useContext(DialogContext);
}
