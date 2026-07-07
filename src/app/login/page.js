'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useSettings } from '@/contexts/SettingsContext';
import { signInWithGoogle, signInWithEmail, signUpWithEmail } from '@/lib/auth';
import { motion } from 'framer-motion';
import { Star, Mail, Lock, User, ArrowRight, Chrome } from 'lucide-react';
import { getDirectImageUrl } from '@/lib/utils';
import Hero3DModel from '@/components/ui/Hero3DModel';
import { use3DStore } from '@/store/use3DStore';

export default function LoginPage() {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { user, isActivated } = useAuth();
  const { settings } = useSettings();
  const logoSrc = settings?.logoUrl || null;
  const setSection = use3DStore((state) => state.setCurrentSection);

  useEffect(() => {
    setSection('login');
  }, [setSection]);

  const featuresList = [
    { text: 'Video Penampilan', show: settings?.showVideo !== false },
    { text: 'Galeri Foto', show: settings?.showGallery !== false },
    { text: 'Soundtrack', show: settings?.showSoundtrack !== false },
    { text: 'Digital Reward', show: settings?.showRewards !== false },
  ];
  const visibleFeatures = featuresList.filter(f => f.show);

  // If already logged in, redirect
  useEffect(() => {
    if (user) {
      if (isActivated) {
        router.push('/dashboard');
      } else {
        router.push('/activate');
      }
    }
  }, [user, isActivated, router]);

  if (user) return null;

  const handleGoogle = async () => {
    setError('');
    setLoading(true);
    try {
      await signInWithGoogle();
      router.push('/activate');
    } catch (err) {
      setError('Gagal login dengan Google. Silakan coba lagi.');
      console.error(err);
    }
    setLoading(false);
  };

  const handleEmail = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'register') {
        if (!name.trim()) {
          setError('Nama wajib diisi.');
          setLoading(false);
          return;
        }
        await signUpWithEmail(email, password, name);
      } else {
        await signInWithEmail(email, password);
      }
      router.push('/activate');
    } catch (err) {
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('Email atau password salah.');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('Email sudah terdaftar. Silakan login.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password minimal 6 karakter.');
      } else {
        setError('Terjadi kesalahan. Silakan coba lagi.');
      }
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <div className="login-container" style={{ 
      minHeight: '100vh', 
      display: 'flex',
      backgroundColor: 'var(--canvas)',
    }}>
      {/* Left Panel — Branding with 3D Model */}
      <div style={{
        flex: 1,
        background: 'radial-gradient(120% 120% at 50% 40%, #17111f 0%, #0A0810 70%)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
      className="login-left-panel"
      >
        <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
          <Hero3DModel inline={true} animateOnMount={true} />
        </div>
        
        {/* Minimal branding overlay */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          style={{ position: 'absolute', bottom: 40, zIndex: 1, textAlign: 'center', width: '100%' }}
        >
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "0.5rem 1.5rem", borderRadius: 999, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.03)", backdropFilter: "blur(10px)", fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "#FF6B00" }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#FF6B00", display: "block", boxShadow: "0 0 10px #FF6B00" }} />
            Digital Souvenir Eksklusif
          </div>
        </motion.div>
      </div>

      {/* Right Panel — Form */}
      <div className="login-right-panel" style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 'var(--space-xxl)',
      }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          style={{ width: '100%', maxWidth: 400 }}
        >
          <h2 className="display-sm" style={{ marginBottom: 8 }}>
            {mode === 'login' ? 'Selamat Datang' : 'Buat Akun'}
          </h2>
          <p className="body-md" style={{ color: 'var(--muted)', marginBottom: 32 }}>
            {mode === 'login'
              ? 'Masuk untuk mengakses Digital Souvenir Anda.'
              : 'Daftar untuk memulai pengalaman Digital Souvenir.'}
          </p>

          {/* Google Sign In */}
          <button
            onClick={handleGoogle}
            disabled={loading}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 12,
              padding: '12px 20px',
              height: 48,
              backgroundColor: 'var(--canvas)',
              color: 'var(--ink)',
              border: '1px solid var(--hairline)',
              borderRadius: 'var(--radius-md)',
              fontFamily: 'var(--font-body)',
              fontSize: 14,
              fontWeight: 500,
              cursor: loading ? 'wait' : 'pointer',
              transition: 'all var(--transition-fast)',
              marginBottom: 20,
            }}
            onMouseEnter={(e) => { e.target.style.backgroundColor = 'var(--surface-soft)'; }}
            onMouseLeave={(e) => { e.target.style.backgroundColor = 'var(--canvas)'; }}
          >
            <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
            Masuk dengan Google
          </button>

          <div style={{
            display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20,
          }}>
            <div style={{ flex: 1, height: 1, backgroundColor: 'var(--hairline)' }} />
            <span className="caption" style={{ color: 'var(--muted-soft)' }}>atau</span>
            <div style={{ flex: 1, height: 1, backgroundColor: 'var(--hairline)' }} />
          </div>

          {/* Email Form */}
          <form onSubmit={handleEmail}>
            {mode === 'register' && (
              <div style={{ marginBottom: 16 }}>
                <label className="body-sm" style={{ display: 'block', marginBottom: 6, color: 'var(--body-strong)', fontWeight: 500 }}>
                  Nama Lengkap
                </label>
                <div style={{ position: 'relative' }}>
                  <User size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted-soft)' }} />
                  <input
                    type="text"
                    className="input"
                    style={{ paddingLeft: 42, height: 44 }}
                    placeholder="Masukkan nama lengkap"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </div>
            )}

            <div style={{ marginBottom: 16 }}>
              <label className="body-sm" style={{ display: 'block', marginBottom: 6, color: 'var(--body-strong)', fontWeight: 500 }}>
                Email
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted-soft)' }} />
                <input
                  type="email"
                  className="input"
                  style={{ paddingLeft: 42, height: 44 }}
                  placeholder="email@contoh.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div style={{ marginBottom: 24 }}>
              <label className="body-sm" style={{ display: 'block', marginBottom: 6, color: 'var(--body-strong)', fontWeight: 500 }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted-soft)' }} />
                <input
                  type="password"
                  className="input"
                  style={{ paddingLeft: 42, height: 44 }}
                  placeholder="Minimal 6 karakter"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  backgroundColor: 'rgba(198, 69, 69, 0.08)',
                  border: '1px solid rgba(198, 69, 69, 0.2)',
                  color: 'var(--error)',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 14,
                  marginBottom: 16,
                }}
              >
                {error}
              </motion.div>
            )}

            <button
              type="submit"
              className="btn-primary btn-lg"
              disabled={loading}
              style={{ width: '100%', justifyContent: 'center' }}
            >
              {loading ? 'Memproses...' : mode === 'login' ? 'Masuk' : 'Daftar'}
              <ArrowRight size={18} />
            </button>
          </form>

          <p className="body-sm" style={{ textAlign: 'center', marginTop: 24, color: 'var(--muted)' }}>
            {mode === 'login' ? 'Belum punya akun? ' : 'Sudah punya akun? '}
            <button
              className="btn-text"
              onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}
              style={{ fontSize: 14 }}
            >
              {mode === 'login' ? 'Daftar Sekarang' : 'Masuk'}
            </button>
          </p>
        </motion.div>
      </div>

      <style jsx>{`
        @media (max-width: 768px) {
          .login-container {
            flex-direction: column !important;
          }
          .login-left-panel {
            flex: none !important;
            height: 320px !important;
            position: relative !important;
            display: flex !important;
            width: 100% !important;
          }
          .login-left-panel > div:last-child {
            display: none !important;
          }
          .login-right-panel {
            position: relative;
            z-index: 10;
            background: #ffffff !important;
            margin: 0 !important;
            border-radius: 32px 32px 0 0 !important;
            margin-top: -32px !important;
            box-shadow: 0 -10px 40px rgba(0,0,0,0.1);
            min-height: auto !important;
            padding: 2.5rem 1.5rem !important;
            flex: 1 !important;
            justify-content: flex-start !important;
          }
        }
      `}</style>
    </div>
  );
}
