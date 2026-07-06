'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { activateCode } from '@/lib/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Key, CheckCircle, AlertCircle, ArrowRight, Sparkles, LogOut } from 'lucide-react';
import { signOut } from '@/lib/auth';
import confetti from 'canvas-confetti';
import { use3DStore } from '@/store/use3DStore';
import Hero3DModel from '@/components/ui/Hero3DModel';

export default function ActivatePage() {
  const [code, setCode] = useState(['DA', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const inputRefs = [useRef(null), useRef(null), useRef(null)];
  const router = useRouter();
  const { user, isActivated, refreshUserData } = useAuth();


  useEffect(() => {
    if (!user && typeof window !== 'undefined') {
      router.push('/login');
    } else if (isActivated && !success) {
      router.push('/dashboard');
    }
  }, [user, isActivated, success, router]);

  if (!user) return null;
  if (isActivated && !success) return null;

  const handleCodeChange = (index, value) => {
    const newCode = [...code];
    // Clean input: uppercase, only allowed chars
    const cleaned = value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4);
    newCode[index] = cleaned;
    setCode(newCode);
    setError('');

    // Auto-focus next input when current is complete
    if (cleaned.length === 4 && index < 2) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && code[index] === '' && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').toUpperCase().replace(/[^A-Z0-9-]/g, '');
    // Parse DA-XXXX-XXXX format
    const parts = pasted.replace('DA-', '').split('-');
    if (parts.length >= 2) {
      const newCode = ['DA', parts[0]?.slice(0, 4) || '', parts[1]?.slice(0, 4) || ''];
      setCode(newCode);
    }
  };

  const fireConfetti = () => {
    const count = 200;
    const defaults = { origin: { y: 0.7 }, zIndex: 9999 };

    function fire(particleRatio, opts) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
      });
    }

    fire(0.25, { spread: 26, startVelocity: 55, colors: ['#cc785c', '#e8a55a'] });
    fire(0.2, { spread: 60, colors: ['#5db8a6', '#cc785c'] });
    fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8, colors: ['#e8a55a', '#5db872'] });
    fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2, colors: ['#cc785c'] });
    fire(0.1, { spread: 120, startVelocity: 45, colors: ['#5db8a6', '#e8a55a'] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fullCode = `${code[0]}-${code[1]}-${code[2]}`.trim();
    
    if (!code[1] || !code[2] || code[1].length !== 4 || code[2].length !== 4) {
      setError('Masukkan kode aktivasi lengkap (DA-XXXX-XXXX).');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const result = await activateCode(user.uid, fullCode);
      if (result.success) {
        setSuccess(true);
        fireConfetti();
        use3DStore.getState().triggerActivation();
        await refreshUserData();
        setTimeout(() => {
          router.push('/dashboard');
        }, 3000);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Terjadi kesalahan. Silakan coba lagi.');
      console.error(err);
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await signOut();
    router.push('/');
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'transparent',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'var(--space-lg)',
      position: 'relative'
    }}>
      <Hero3DModel />
      
      {/* UI Wrapper to stay above 3D */}
      <div style={{ position: 'relative', zIndex: 10, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: 48, textAlign: 'center' }}
      >
        <div style={{
          width: 56, height: 56, borderRadius: 'var(--radius-lg)',
          backgroundColor: 'var(--primary)', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 16px',
        }}>
          <Star size={28} color="var(--on-primary)" fill="var(--on-primary)" />
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, color: 'var(--ink)', letterSpacing: '-0.3px' }}>
          Drama Arena <span style={{ color: 'var(--primary)' }}>5101</span>
        </h1>
      </motion.div>

      <AnimatePresence mode="wait">
        {success ? (
          /* Success State */
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            style={{
              textAlign: 'center',
              maxWidth: 440,
            }}
          >
            <div style={{
              width: 80, height: 80, borderRadius: 'var(--radius-full)',
              backgroundColor: 'rgba(93, 184, 114, 0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 24px',
            }}>
              <CheckCircle size={40} color="var(--success)" />
            </div>
            <h2 className="display-md" style={{ marginBottom: 12 }}>
              Aktivasi <span style={{ color: 'var(--success)' }}>Berhasil!</span>
            </h2>
            <p className="body-md" style={{ color: 'var(--muted)', marginBottom: 32 }}>
              Selamat! Seluruh koleksi Digital Souvenir telah terbuka untuk Anda. Selamat menikmati kenang-kenangan Pentas Seni.
            </p>
            <button className="btn-primary btn-lg" onClick={() => router.push('/dashboard')}>
              <Sparkles size={18} />
              Buka Koleksi Saya
              <ArrowRight size={18} />
            </button>
          </motion.div>
        ) : (
          /* Activation Form */
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{
              width: '100%',
              maxWidth: 480,
            }}
          >
            <div className="card" style={{ padding: 'var(--space-xl)' }}>
              <div style={{ textAlign: 'center', marginBottom: 32 }}>
                <div style={{
                  width: 56, height: 56, borderRadius: 'var(--radius-full)',
                  backgroundColor: 'rgba(204, 120, 92, 0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 16px',
                }}>
                  <Key size={24} color="var(--primary)" />
                </div>
                <h2 className="title-lg" style={{ marginBottom: 8 }}>
                  Aktivasi Digital Souvenir
                </h2>
                <p className="body-sm" style={{ color: 'var(--muted)' }}>
                  Masukkan Activation Code dari komik Anda
                </p>
              </div>

              {/* User info */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 16px',
                backgroundColor: 'var(--surface-soft)',
                borderRadius: 'var(--radius-md)',
                marginBottom: 24,
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 'var(--radius-full)',
                  backgroundColor: 'var(--primary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--on-primary)', fontSize: 14, fontWeight: 600,
                }}>
                  {user?.displayName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || '?'}
                </div>
                <div style={{ flex: 1 }}>
                  <div className="body-sm" style={{ fontWeight: 500, color: 'var(--ink)' }}>
                    {user?.displayName || 'User'}
                  </div>
                  <div className="caption" style={{ color: 'var(--muted-soft)' }}>
                    {user?.email}
                  </div>
                </div>
                <button onClick={handleLogout} className="btn-icon" title="Logout" style={{ width: 32, height: 32 }}>
                  <LogOut size={16} />
                </button>
              </div>

              {/* Code Input */}
              <form onSubmit={handleSubmit}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', marginBottom: 24 }}>
                  {/* DA prefix */}
                  <div style={{
                    width: 56, height: 52,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    backgroundColor: 'var(--surface-cream-strong)',
                    borderRadius: 'var(--radius-md)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: 16, fontWeight: 600,
                    color: 'var(--ink)',
                  }}>
                    DA
                  </div>
                  <span style={{ color: 'var(--muted-soft)', fontSize: 20 }}>-</span>
                  
                  {/* First 4 chars */}
                  <input
                    ref={inputRefs[1]}
                    type="text"
                    className="input"
                    style={{
                      width: 100, height: 52, textAlign: 'center',
                      fontFamily: 'var(--font-mono)', fontSize: 18,
                      fontWeight: 600, letterSpacing: 2,
                      textTransform: 'uppercase',
                    }}
                    maxLength={4}
                    value={code[1]}
                    onChange={(e) => handleCodeChange(1, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(1, e)}
                    onPaste={handlePaste}
                    placeholder="XXXX"
                  />
                  <span style={{ color: 'var(--muted-soft)', fontSize: 20 }}>-</span>
                  
                  {/* Second 4 chars */}
                  <input
                    ref={inputRefs[2]}
                    type="text"
                    className="input"
                    style={{
                      width: 100, height: 52, textAlign: 'center',
                      fontFamily: 'var(--font-mono)', fontSize: 18,
                      fontWeight: 600, letterSpacing: 2,
                      textTransform: 'uppercase',
                    }}
                    maxLength={4}
                    value={code[2]}
                    onChange={(e) => handleCodeChange(2, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(2, e)}
                    onPaste={handlePaste}
                    placeholder="XXXX"
                  />
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      backgroundColor: 'rgba(198, 69, 69, 0.08)',
                      border: '1px solid rgba(198, 69, 69, 0.2)',
                      color: 'var(--error)',
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-md)',
                      fontSize: 14,
                      marginBottom: 16,
                    }}
                  >
                    <AlertCircle size={16} />
                    {error}
                  </motion.div>
                )}

                <button
                  type="submit"
                  className="btn-primary btn-lg"
                  disabled={loading}
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  {loading ? 'Memverifikasi...' : 'Aktivasi Sekarang'}
                  <ArrowRight size={18} />
                </button>
              </form>

              <p className="caption" style={{ textAlign: 'center', marginTop: 16, color: 'var(--muted-soft)' }}>
                Kode terdapat pada komik Pentas Seni yang Anda beli.
                <br />
                Format: DA-XXXX-XXXX
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </div>
  );
}
