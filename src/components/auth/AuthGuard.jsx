'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AuthGuard({ children, requireActivation = false, requireAdmin = false }) {
  const { user, loading, isActivated, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
        return;
      }
      if (requireAdmin && !isAdmin) {
        router.push('/dashboard');
        return;
      }
      if (requireActivation && !isActivated) {
        router.push('/activate');
        return;
      }
    }
  }, [user, loading, isActivated, isAdmin, requireActivation, requireAdmin, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--canvas)' }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 rounded-full animate-spin" 
               style={{ borderColor: 'var(--hairline)', borderTopColor: 'var(--primary)' }} />
          <p style={{ color: 'var(--muted)', fontFamily: 'var(--font-body)' }}>Memuat...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;
  if (requireAdmin && !isAdmin) return null;
  if (requireActivation && !isActivated) return null;

  return children;
}
