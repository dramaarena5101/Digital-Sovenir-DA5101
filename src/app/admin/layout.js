'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { signOut } from '@/lib/auth';
import AuthGuard from '@/components/auth/AuthGuard';
import { ADMIN_NAV_ITEMS, getDirectImageUrl } from '@/lib/utils';
import { useSettings } from '@/contexts/SettingsContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star, LayoutDashboard, Video, Camera, Music, FileText,
  Award, Key, BarChart3, LogOut, Menu, X, ArrowLeft, Settings
} from 'lucide-react';

const iconMap = { LayoutDashboard, Video, Camera, Music, FileText, Award, Key, BarChart3, Settings };

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, userData } = useAuth();
  const { settings } = useSettings();
  const logoSrc = settings?.logoUrl || null;

  const handleLogout = async () => {
    await signOut();
    router.push('/');
  };

  const isActive = (href) => pathname === href;

  return (
    <AuthGuard requireAdmin>
      <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--canvas)' }}>
        {/* Sidebar */}
        <aside
          className="admin-sidebar"
          style={{
            width: 250,
            backgroundColor: 'var(--surface-dark)',
            display: 'flex',
            flexDirection: 'column',
            position: 'fixed',
            top: 0, left: 0, bottom: 0,
            zIndex: 40,
          }}
        >
          {/* Logo */}
          <div style={{ padding: '20px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {logoSrc ? (
                <img src={getDirectImageUrl(logoSrc)} alt="Logo" style={{ height: 28, objectFit: 'contain' }} />
              ) : (
                <div style={{
                  width: 28, height: 28, borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--primary)', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                }}>
                  <Star size={14} color="var(--on-primary)" fill="var(--on-primary)" />
                </div>
              )}
              <div>
                <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--on-dark)' }}>DA 5101</div>
                <div style={{ fontSize: 10, color: 'var(--on-dark-soft)', letterSpacing: 1, textTransform: 'uppercase' }}>Admin Panel</div>
              </div>
            </div>
          </div>

          {/* Nav */}
          <nav style={{ flex: 1, padding: '12px 8px', overflowY: 'auto' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {ADMIN_NAV_ITEMS.map((item) => {
                const Icon = iconMap[item.icon] || LayoutDashboard;
                const active = isActive(item.href);
                return (
                  <button
                    key={item.href}
                    onClick={() => { router.push(item.href); setSidebarOpen(false); }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '9px 12px', borderRadius: 'var(--radius-md)',
                      border: 'none',
                      backgroundColor: active ? 'var(--surface-dark-elevated)' : 'transparent',
                      color: active ? 'var(--on-dark)' : 'var(--on-dark-soft)',
                      fontFamily: 'var(--font-body)', fontSize: 13,
                      fontWeight: active ? 500 : 400,
                      cursor: 'pointer', width: '100%', textAlign: 'left',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <Icon size={16} />
                    {item.label}
                  </button>
                );
              })}
            </div>

            {/* Back to user view */}
            <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <button
                onClick={() => router.push('/dashboard')}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '9px 12px', borderRadius: 'var(--radius-md)',
                  border: 'none', backgroundColor: 'transparent',
                  color: 'var(--on-dark-soft)', fontFamily: 'var(--font-body)',
                  fontSize: 13, cursor: 'pointer', width: '100%', textAlign: 'left',
                }}
              >
                <ArrowLeft size={16} />
                Kembali ke User View
              </button>
            </div>
          </nav>

          {/* Footer */}
          <div style={{ padding: '12px 8px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <button
              onClick={handleLogout}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 12px', borderRadius: 'var(--radius-md)',
                border: 'none', backgroundColor: 'transparent',
                color: 'var(--on-dark-soft)', fontFamily: 'var(--font-body)',
                fontSize: 13, cursor: 'pointer', width: '100%', textAlign: 'left',
              }}
            >
              <LogOut size={16} />
              Keluar
            </button>
          </div>
        </aside>

        {/* Mobile Nav */}
        <div className="admin-mobile-nav" style={{
          display: 'none', position: 'fixed', top: 0, left: 0, right: 0,
          height: 52, backgroundColor: 'rgba(250,249,245,0.95)',
          backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--hairline)',
          zIndex: 50, alignItems: 'center', justifyContent: 'space-between', padding: '0 16px',
        }}>
          {logoSrc ? (
            <img src={getDirectImageUrl(logoSrc)} alt="Logo" style={{ height: 24, objectFit: 'contain' }} />
          ) : (
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 500, color: 'var(--ink)' }}>Admin Panel</span>
          )}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink)' }}>
            {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile Overlay */}
        <AnimatePresence>
          {sidebarOpen && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setSidebarOpen(false)}
                style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 55 }} />
              <motion.aside
                initial={{ x: -260 }} animate={{ x: 0 }} exit={{ x: -260 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                style={{
                  position: 'fixed', top: 0, left: 0, bottom: 0, width: 250,
                  backgroundColor: 'var(--surface-dark)', zIndex: 60,
                  display: 'flex', flexDirection: 'column',
                }}>
                <div style={{ padding: '20px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  {logoSrc ? (
                    <img src={getDirectImageUrl(logoSrc)} alt="Logo" style={{ height: 24, objectFit: 'contain' }} />
                  ) : (
                    <span style={{ color: 'var(--on-dark)', fontWeight: 500 }}>Admin Panel</span>
                  )}
                  <button onClick={() => setSidebarOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--on-dark-soft)', cursor: 'pointer' }}>
                    <X size={18} />
                  </button>
                </div>
                <nav style={{ flex: 1, padding: '0 8px' }}>
                  {ADMIN_NAV_ITEMS.map((item) => {
                    const Icon = iconMap[item.icon] || LayoutDashboard;
                    const active = isActive(item.href);
                    return (
                      <button key={item.href} onClick={() => { router.push(item.href); setSidebarOpen(false); }}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
                          borderRadius: 'var(--radius-md)', border: 'none', width: '100%', textAlign: 'left',
                          backgroundColor: active ? 'var(--surface-dark-elevated)' : 'transparent',
                          color: active ? 'var(--on-dark)' : 'var(--on-dark-soft)',
                          fontFamily: 'var(--font-body)', fontSize: 13, cursor: 'pointer',
                        }}>
                        <Icon size={16} />{item.label}
                      </button>
                    );
                  })}
                </nav>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Main */}
        <main className="admin-main" style={{ flex: 1, marginLeft: 250, minHeight: '100vh' }}>
          <div style={{ padding: 'var(--space-xl)' }}>
            {children}
          </div>
        </main>

        <style jsx global>{`
          @media (max-width: 768px) {
            .admin-sidebar { display: none !important; }
            .admin-mobile-nav { display: flex !important; }
            .admin-main { margin-left: 0 !important; padding-top: 52px !important; }
          }
        `}</style>
      </div>
    </AuthGuard>
  );
}
