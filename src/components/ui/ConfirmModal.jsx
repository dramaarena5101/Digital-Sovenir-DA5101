import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';

export default function ConfirmModal({ 
  isOpen, 
  title, 
  message, 
  onConfirm, 
  onCancel, 
  confirmText = 'Hapus',
  cancelText = 'Batal',
  isDestructive = true,
  hideCancel = false,
  children
}) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '16px'
        }}>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            style={{
              position: 'absolute', inset: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.4)',
              backdropFilter: 'blur(4px)'
            }}
          />

          {/* Modal Box */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            style={{
              backgroundColor: 'var(--surface-card)',
              borderRadius: 'var(--radius-xl)',
              boxShadow: 'var(--shadow-lg)',
              width: '100%',
              maxWidth: 400,
              position: 'relative',
              overflow: 'hidden',
              border: '1px solid var(--hairline)'
            }}
          >
            <div style={{ padding: '24px 24px 16px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 'var(--radius-full)',
                  backgroundColor: isDestructive ? 'color-mix(in srgb, var(--error) 15%, transparent)' : 'color-mix(in srgb, var(--primary) 15%, transparent)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                }}>
                  <AlertTriangle size={24} color={isDestructive ? 'var(--error)' : 'var(--primary)'} />
                </div>
                <div>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: 'var(--ink)', marginBottom: 8, lineHeight: 1.2 }}>
                    {title}
                  </h3>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--muted)', lineHeight: 1.5 }}>
                    {message}
                  </p>
                </div>
              </div>
              {children && (
                <div style={{ marginTop: 16 }}>
                  {children}
                </div>
              )}
            </div>

            <div style={{
              padding: '16px 24px',
              backgroundColor: 'var(--surface-soft)',
              display: 'flex', justifyContent: 'flex-end', gap: 12,
              borderTop: '1px solid var(--hairline)'
            }}>
              {!hideCancel && (
                <button
                  onClick={onCancel}
                  style={{
                    padding: '8px 16px', borderRadius: 'var(--radius-md)',
                    backgroundColor: 'transparent', border: '1px solid var(--hairline)',
                    color: 'var(--ink)', fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 500,
                    cursor: 'pointer'
                  }}
                >
                  {cancelText}
                </button>
              )}
              <button
                onClick={onConfirm}
                style={{
                  padding: '8px 16px', borderRadius: 'var(--radius-md)',
                  backgroundColor: isDestructive ? 'var(--error)' : 'var(--primary)',
                  border: 'none', color: '#fff',
                  fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 500,
                  cursor: 'pointer'
                }}
              >
                {confirmText}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
