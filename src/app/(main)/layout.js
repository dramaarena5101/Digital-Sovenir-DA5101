'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { signOut } from '@/lib/auth';
import AuthGuard from '@/components/auth/AuthGuard';
import { NAV_ITEMS, getDirectImageUrl } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star, Home, Video, Camera, BookOpen, Music,
  Gift, Award, User, LogOut, Menu, X, ChevronRight, Search
} from 'lucide-react';
import { useSettings } from '@/contexts/SettingsContext';

const iconMap = { Home, Video, Camera, BookOpen, Music, Gift, Award, User };

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, userData } = useAuth();
  const { settings } = useSettings();

  const visibleNavItems = NAV_ITEMS.filter(item => {
    if (item.href === '/videos' && settings?.showVideo === false) return false;
    if (item.href === '/gallery' && settings?.showGallery === false) return false;
    if (item.href === '/comic' && settings?.showComic === false) return false;
    if (item.href === '/soundtrack' && settings?.showSoundtrack === false) return false;
    if (item.href === '/bonus' && settings?.showBonus === false) return false;
    if (item.href === '/rewards' && settings?.showRewards === false) return false;
    return true;
  });

  const handleLogout = async () => {
    await signOut();
    router.push('/');
  };

  const isActive = (href) => pathname === href;
  
  const theme = settings?.theme || 'default';
  const isTopNavTheme = theme === 'claude' || theme === 'pinterest' || theme === 'guidebook';

  const userInitials = userData?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || '?';
  const userName = userData?.name || user?.displayName || 'User';

  const logoSrc = settings?.logoUrl || null;
  
  const LogoBlock = () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      {logoSrc ? (
        <img src={getDirectImageUrl(logoSrc)} alt="Logo" style={{ height: 36, objectFit: 'contain' }} />
      ) : (
        <>
          <div style={{
            width: 36, height: 36, borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--primary)', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
          }}>
            <Star size={18} color="var(--on-primary)" fill="var(--on-primary)" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 17, color: 'var(--ink)' }}>Drama Arena</span>
          </div>
        </>
      )}
    </div>
  );

  const LogoBlockDark = () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      {logoSrc ? (
        <img src={getDirectImageUrl(logoSrc)} alt="Logo" style={{ height: 36, objectFit: 'contain' }} />
      ) : (
        <>
          <div style={{
            width: 36, height: 36, borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--primary)', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
          }}>
            <Star size={18} color="var(--on-primary)" fill="var(--on-primary)" />
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 17, color: 'var(--on-dark)', letterSpacing: '-0.3px' }}>Drama Arena</div>
            <div style={{ fontSize: 11, color: 'var(--on-dark-soft)', letterSpacing: 1 }}>DIGITAL SOUVENIR</div>
          </div>
        </>
      )}
    </div>
  );

  if (isTopNavTheme) {
    return (
      <AuthGuard requireActivation>
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--canvas)' }}>
          {/* Top Navbar */}
          <header style={{
            height: 64, backgroundColor: 'var(--canvas)', borderBottom: '1px solid var(--hairline)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px',
            position: 'sticky', top: 0, zIndex: 40
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
              <LogoBlock />
              
              <nav className="desktop-nav" style={{ display: 'flex', gap: 8 }}>
                {visibleNavItems.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <button
                      key={item.href}
                      onClick={() => router.push(item.href)}
                      className="tab"
                      style={{
                        backgroundColor: active ? (theme === 'pinterest' ? 'var(--ink)' : 'var(--surface-card)') : 'transparent',
                        color: active ? (theme === 'pinterest' ? 'var(--on-dark)' : 'var(--ink)') : 'var(--muted)',
                      }}
                    >
                      {item.label}
                    </button>
                  );
                })}
                {userData?.role === 'admin' && (
                  <button
                    onClick={() => router.push('/admin')}
                    className="tab"
                    style={{
                      backgroundColor: 'transparent',
                      color: 'var(--primary)',
                      fontWeight: 500,
                      display: 'flex', alignItems: 'center', gap: 6,
                    }}
                  >
                    <Star size={16} />
                    Admin Panel
                  </button>
                )}
              </nav>
            </div>
            
            <div className="desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 'var(--radius-full)', backgroundColor: 'var(--primary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--on-primary)', fontSize: 13, fontWeight: 600
                }}>
                  {userInitials}
                </div>
                <span className="body-sm" style={{ fontWeight: 500 }}>{userName}</span>
              </div>
              <button onClick={handleLogout} className="btn-secondary" style={{ height: 36, padding: '0 12px' }}>
                <LogOut size={16} /> Keluar
              </button>
            </div>

            <button
              onClick={() => setSidebarOpen(true)}
              className="mobile-nav-btn"
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink)' }}
            >
              <Menu size={24} />
            </button>
          </header>

          <main style={{ flex: 1, padding: 'var(--space-xl)' }}>
            {children}
          </main>

          {/* Mobile Overlay */}
          <AnimatePresence>
            {sidebarOpen && (
              <>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  onClick={() => setSidebarOpen(false)}
                  style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 55 }} />
                <motion.div initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
                  style={{ position: 'fixed', top: 0, left: 0, bottom: 0, width: 260, backgroundColor: 'var(--canvas)', zIndex: 60, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid var(--hairline)', display: 'flex', justifyContent: 'space-between' }}>
                    <LogoBlock />
                    <button onClick={() => setSidebarOpen(false)} style={{ background: 'none', border: 'none' }}><X size={20} /></button>
                  </div>
                  <nav style={{ flex: 1, padding: '16px 12px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {visibleNavItems.map((item) => (
                        <button key={item.href} onClick={() => { router.push(item.href); setSidebarOpen(false); }}
                          style={{
                            padding: '12px 14px', borderRadius: 'var(--radius-md)', border: 'none', width: '100%', textAlign: 'left',
                            backgroundColor: isActive(item.href) ? 'var(--surface-soft)' : 'transparent',
                            color: isActive(item.href) ? 'var(--ink)' : 'var(--muted)',
                            fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: isActive(item.href) ? 500 : 400,
                          }}>
                          {item.label}
                        </button>
                      ))}
                      {userData?.role === 'admin' && (
                        <>
                          <div style={{ height: 1, backgroundColor: 'var(--hairline)', margin: '8px 0' }} />
                          <button onClick={() => { router.push('/admin'); setSidebarOpen(false); }}
                            style={{
                              padding: '12px 14px', borderRadius: 'var(--radius-md)', border: 'none', width: '100%', textAlign: 'left',
                              backgroundColor: 'color-mix(in srgb, var(--primary) 10%, transparent)',
                              color: 'var(--primary)',
                              fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 500,
                              display: 'flex', alignItems: 'center', gap: 10,
                            }}>
                            <Star size={18} />
                            Admin Panel
                          </button>
                        </>
                      )}
                    </div>
                  </nav>
                </motion.div>
              </>
            )}
          </AnimatePresence>
          <style jsx global>{`
            .desktop-nav { display: flex !important; }
            .mobile-nav-btn { display: none !important; }
            @media (max-width: 768px) {
              .desktop-nav { display: none !important; }
              .mobile-nav-btn { display: block !important; }
            }
          `}</style>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard requireActivation>
      <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--canvas)' }}>
        {/* ====== SIDEBAR (Desktop) ====== */}
        <aside
          style={{
            width: 260,
            backgroundColor: 'var(--surface-dark)',
            display: 'flex',
            flexDirection: 'column',
            position: 'fixed',
            top: 0,
            left: 0,
            bottom: 0,
            zIndex: 40,
          }}
          className="sidebar-desktop"
        >
          {/* Logo */}
          <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <LogoBlockDark />
          </div>

          {/* Navigation */}
          <nav style={{ flex: 1, padding: '16px 12px', overflowY: 'auto' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {visibleNavItems.map((item) => {
                const Icon = iconMap[item.icon] || Home;
                const active = isActive(item.href);
                return (
                  <button
                    key={item.href}
                    onClick={() => { router.push(item.href); setSidebarOpen(false); }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 'var(--radius-md)', border: 'none',
                      backgroundColor: active ? 'var(--surface-dark-elevated)' : 'transparent',
                      color: active ? 'var(--on-dark)' : 'var(--on-dark-soft)',
                      fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: active ? 500 : 400,
                      cursor: 'pointer', width: '100%', textAlign: 'left',
                    }}
                  >
                    <Icon size={18} />
                    {item.label}
                  </button>
                );
              })}
              
              {/* Admin Panel Link */}
              {userData?.role === 'admin' && (
                <>
                  <div style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.06)', margin: '8px 0' }} />
                  <button
                    onClick={() => { router.push('/admin'); setSidebarOpen(false); }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 'var(--radius-md)', border: 'none',
                      backgroundColor: 'color-mix(in srgb, var(--primary) 15%, transparent)',
                      color: 'var(--primary)',
                      fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 500,
                      cursor: 'pointer', width: '100%', textAlign: 'left',
                    }}
                  >
                    <Star size={18} />
                    Admin Panel
                  </button>
                </>
              )}
            </div>
          </nav>

          {/* User Footer */}
          <div style={{ padding: '16px 12px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px',
              backgroundColor: 'var(--surface-dark-elevated)', borderRadius: 'var(--radius-md)',
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: 'var(--radius-full)', backgroundColor: 'var(--primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--on-primary)', fontSize: 13, fontWeight: 600, flexShrink: 0,
              }}>
                {userInitials}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--on-dark)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{userName}</div>
                <div style={{ fontSize: 11, color: 'var(--on-dark-soft)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</div>
              </div>
              <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: 'var(--on-dark-soft)', cursor: 'pointer' }}><LogOut size={16} /></button>
            </div>
          </div>
        </aside>

        {/* ====== MOBILE NAVBAR ====== */}
        <div
          className="mobile-navbar"
          style={{
            display: 'none', position: 'fixed', top: 0, left: 0, right: 0, height: 56,
            backgroundColor: 'var(--canvas)', borderBottom: '1px solid var(--hairline)',
            zIndex: 50, alignItems: 'center', justifyContent: 'space-between', padding: '0 16px',
          }}
        >
          <LogoBlock />
          <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink)' }}>
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Sidebar Overlay */}
        <AnimatePresence>
          {sidebarOpen && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setSidebarOpen(false)} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 55 }} />
              <motion.div initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
                style={{ position: 'fixed', top: 0, left: 0, bottom: 0, width: 260, backgroundColor: 'var(--surface-dark)', zIndex: 60, display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between' }}>
                  <LogoBlockDark />
                  <button onClick={() => setSidebarOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--on-dark-soft)' }}><X size={20} /></button>
                </div>
                <nav style={{ flex: 1, padding: '16px 12px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {visibleNavItems.map((item) => {
                      const Icon = iconMap[item.icon] || Home;
                      const active = isActive(item.href);
                      return (
                        <button key={item.href} onClick={() => { router.push(item.href); setSidebarOpen(false); }}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 'var(--radius-md)', border: 'none', width: '100%', textAlign: 'left',
                            backgroundColor: active ? 'var(--surface-dark-elevated)' : 'transparent',
                            color: active ? 'var(--on-dark)' : 'var(--on-dark-soft)', fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: active ? 500 : 400,
                          }}>
                          <Icon size={18} />{item.label}
                        </button>
                      );
                    })}
                  </div>
                </nav>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* ====== MAIN CONTENT ====== */}
        <main style={{ flex: 1, minHeight: '100vh' }} className="main-content">
          <div style={{ padding: 'var(--space-xl)' }}>
            {children}
          </div>
        </main>

        <style jsx global>{`
          .main-content { margin-left: 260px !important; }
          @media (max-width: 768px) {
            .sidebar-desktop { display: none !important; }
            .mobile-navbar { display: flex !important; }
            .main-content { margin-left: 0 !important; padding-top: 56px !important; }
          }
        `}</style>
      </div>
    </AuthGuard>
  );
}
