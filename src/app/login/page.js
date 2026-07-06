'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useSettings } from '@/contexts/SettingsContext';
import { signInWithGoogle, signInWithEmail, signUpWithEmail } from '@/lib/auth';
import { motion } from 'framer-motion';
import { Star, Mail, Lock, User, ArrowRight, Chrome } from 'lucide-react';
import { getDirectImageUrl } from '@/lib/utils';

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
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex',
      backgroundColor: 'var(--canvas)',
    }}>
      {/* Left Panel — Branding */}
      <div style={{
        flex: 1,
        backgroundColor: 'var(--surface-dark)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 'var(--space-xxl)',
        position: 'relative',
        overflow: 'hidden',
      }}
      className="login-left-panel"
      >
        {/* Decorative elements */}
        <div style={{
          position: 'absolute', top: -100, right: -100,
          width: 300, height: 300,
          background: 'radial-gradient(circle, rgba(204,120,92,0.15) 0%, transparent 70%)',
          borderRadius: '50%',
        }} />
        <div style={{
          position: 'absolute', bottom: -80, left: -80,
          width: 250, height: 250,
          background: 'radial-gradient(circle, rgba(93,184,166,0.1) 0%, transparent 70%)',
          borderRadius: '50%',
        }} />

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 400 }}
        >
          {logoSrc ? (
            <img src={getDirectImageUrl(logoSrc)} alt="Logo" style={{ height: 100, objectFit: 'contain', margin: '0 auto 24px', display: 'block' }} />
          ) : (
            <>
              <div style={{
                width: 64, height: 64, borderRadius: 'var(--radius-lg)',
                backgroundColor: 'var(--primary)', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 24px',
              }}>
                <Star size={32} color="var(--on-primary)" fill="var(--on-primary)" />
              </div>
              <h1 style={{
                fontFamily: 'var(--font-display)', fontSize: 42, fontWeight: 400,
                color: 'var(--on-dark)', letterSpacing: '-1px', lineHeight: 1.1,
                marginBottom: 16,
              }}>
                Drama Arena
                <br />
                <span style={{ color: 'var(--primary)' }}>5101</span>
              </h1>
            </>
          )}
          <p style={{ color: 'var(--on-dark-soft)', fontSize: 16, lineHeight: 1.6 }}>
            Digital Souvenir Eksklusif
            <br />
            Pentas Seni
          </p>

          {/* Mini feature list */}
          <div style={{ marginTop: 40, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {visibleFeatures.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  backgroundColor: 'var(--surface-dark-elevated)',
                  borderRadius: 'var(--radius-md)',
                  padding: '10px 16px',
                }}
              >
                <span style={{ fontSize: 16 }}>{item.text.split(' ')[0]}</span>
                <span style={{ color: 'var(--on-dark-soft)', fontSize: 14 }}>{item.text.split(' ').slice(1).join(' ')}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right Panel — Form */}
      <div style={{
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
          .login-left-panel {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
