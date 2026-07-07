'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useSettings } from '@/contexts/SettingsContext';
import { signInWithGoogle, signInWithEmail, signUpWithEmail } from '@/lib/auth';
import { motion } from 'framer-motion';
import { Star, Mail, Lock, User, ArrowRight, Chrome, ArrowLeft, ChevronUp } from 'lucide-react';
import Link from 'next/link';
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
  const [sheetOpen, setSheetOpen] = useState(false);
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
      overflow: 'hidden',
      '--sheet-y': sheetOpen ? '0%' : 'calc(100% - 130px)',
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
        {/* Intro Page Noise Overlay */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none', opacity: 0.05, mixBlendMode: 'overlay',
          backgroundImage: 'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'120\' height=\'120\'><filter id=\'n\'><feTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'2\' stitchTiles=\'stitch\'/></filter><rect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/></svg>")'
        }} />
        
        <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
          <Hero3DModel inline={true} animateOnMount={true} touchAction="none" pointerEvents="auto" />
        </div>
        
        {/* Minimal branding overlay */}
        <div className="branding-overlay" style={{ position: 'absolute', zIndex: 1, textAlign: 'center', width: '100%' }}>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "0.5rem 1.5rem", borderRadius: 999, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.03)", backdropFilter: "blur(10px)", fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "#FF6B00" }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#FF6B00", display: "block", boxShadow: "0 0 10px #FF6B00" }} />
              Digital Souvenir Eksklusif
            </div>
          </motion.div>
        </div>
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
        <div 
          className="mobile-handle" 
          onClick={() => setSheetOpen(!sheetOpen)} 
          style={{
             display: 'none', flexDirection: 'column', alignItems: 'center', width: '100%',
             position: 'absolute', top: 0, left: 0, padding: '16px 0', cursor: 'pointer', zIndex: 20
          }}
        >
           <div style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: 'var(--muted)', opacity: 0.2, marginBottom: 6 }} />
           {!sheetOpen && (
             <motion.div 
               animate={{ opacity: [0.5, 1, 0.5] }} 
               transition={{ repeat: Infinity, duration: 2 }}
               style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--muted)', fontSize: 12 }}
             >
               Ketuk untuk login
             </motion.div>
           )}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          style={{ width: '100%', maxWidth: 400, position: 'relative', marginTop: 24 }}
        >
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--muted)', fontSize: 13, fontWeight: 600, textDecoration: 'none', marginBottom: 32, transition: 'color 0.2s', textTransform: 'uppercase', letterSpacing: '0.05em' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--primary)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--muted)'}
          >
            <ArrowLeft size={16} />
            Kembali ke Beranda
          </Link>

          <h2 className="display-sm" style={{ marginBottom: 8, fontFamily: 'var(--font-bebas)', letterSpacing: '0.05em', fontSize: '2.5rem' }}>
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
        .branding-overlay {
          bottom: 40px;
        }
        @media (max-width: 768px) {
          .login-container {
            flex-direction: column !important;
            position: relative;
          }
          .mobile-handle {
            display: flex !important;
          }
          .login-left-panel {
            flex: none !important;
            height: 100vh !important;
            position: absolute !important;
            inset: 0 !important;
            display: flex !important;
            width: 100% !important;
            padding-bottom: 20vh !important;
          }
          .branding-overlay {
            bottom: 170px !important;
            z-index: 5 !important;
          }
          .login-right-panel {
            position: absolute !important;
            bottom: 0 !important;
            left: 0 !important;
            right: 0 !important;
            z-index: 10;
            background: #ffffff !important;
            margin: 0 !important;
            border-radius: 32px 32px 0 0 !important;
            box-shadow: 0 -10px 40px rgba(0,0,0,0.1);
            min-height: auto !important;
            padding: 2.5rem 1.5rem !important;
            padding-top: 4rem !important;
            flex: none !important;
            justify-content: flex-start !important;
            transition: transform 0.5s cubic-bezier(0.32, 0.72, 0, 1) !important;
            transform: translateY(var(--sheet-y)) !important;
          }
        }
      `}</style>
    </div>
  );
}
