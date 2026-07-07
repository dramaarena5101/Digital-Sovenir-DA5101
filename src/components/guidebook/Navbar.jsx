import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Categories", href: "#categories" },
  { label: "Performances", href: "#performances" },
  { label: "Timeline", href: "#timeline" },
  { label: "Judges", href: "#judges" },
];

export default function Navbar({ onReplayIntro }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll when menu open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <>
      <style>{`
        .nav-desktop { display: none; }
        .nav-hamburger { display: flex; }
        @media (min-width: 1024px) {
          .nav-desktop { display: flex; }
          .nav-hamburger { display: none; }
        }
        .nav-link {
          padding: 0.5rem 1.1rem;
          border-radius: 999px;
          font-family: 'Plus Jakarta Sans', 'Inter', sans-serif;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: #6B7280;
          text-decoration: none;
          transition: all 0.2s;
          white-space: nowrap;
        }
        .nav-link:hover { background: #fff; color: #111827; box-shadow: 0 1px 4px rgba(0,0,0,0.08); }
      `}</style>

      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        style={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 200,
          transition: "all 0.4s ease",
          background: scrolled ? "rgba(255,255,255,0.93)" : "transparent",
          backdropFilter: scrolled ? "blur(20px)" : "none",
          borderBottom: scrolled ? "1px solid #E5E7EB" : "none",
          boxShadow: scrolled ? "0 1px 16px rgba(0,0,0,0.06)" : "none",
          padding: scrolled ? "0.75rem 0" : "1.25rem 0",
        }}
      >
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          
          {/* Brand */}
          <a href="#home" onClick={(e) => { e.preventDefault(); if(onReplayIntro) onReplayIntro(); else window.scrollTo({ top: 0, behavior: 'smooth' }); }} style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", flexShrink: 0 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, border: "1.5px solid #FDDCBF", background: "#FFF0E6", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0 }}>
              <img src="/logo.png" alt="DA" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => { e.target.style.display = "none"; e.target.parentElement.innerHTML = `<span style="font-family:'Bebas Neue',cursive;font-size:16px;color:#FF6B00">DA</span>`; }} />
            </div>
            <div style={{ flexShrink: 0 }}>
              <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 18, letterSpacing: "0.05em", color: "#111827", lineHeight: 1 }}>DRAMA ARENA</div>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 8, fontWeight: 700, letterSpacing: "0.2em", color: "#FF6B00", textTransform: "uppercase" }}>5101 EDITION</div>
            </div>
          </a>

          {/* Desktop Nav */}
          <div className="nav-desktop" style={{ alignItems: "center", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", background: "#F9FAFB", border: "1px solid #E5E7EB", borderRadius: 999, padding: "0.3rem", marginRight: "0.75rem" }}>
              {navItems.map(item => (
                <a key={item.label} href={item.href} className="nav-link">{item.label}</a>
              ))}
            </div>

            <a href={user ? "/dashboard" : "/login"} style={{ padding: "0.65rem 1.2rem", borderRadius: 999, background: "transparent", color: "#4B5563", border: "1.5px solid #E5E7EB", fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", textDecoration: "none", whiteSpace: "nowrap", transition: "all 0.2s", marginRight: "0.25rem" }}
              onMouseEnter={e => { e.currentTarget.style.background = "#F3F4F6"; e.currentTarget.style.color = "#111827"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#4B5563"; }}>
              {user ? "Dashboard" : "Login"}
            </a>

            <a href="#performances" style={{ padding: "0.65rem 1.5rem", borderRadius: 999, background: "#FF6B00", color: "#fff", fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", textDecoration: "none", boxShadow: "0 4px 14px rgba(255,107,0,0.3)", whiteSpace: "nowrap", transition: "all 0.2s" }}
              onMouseEnter={e => { e.currentTarget.style.background = "#111827"; e.currentTarget.style.boxShadow = "0 4px 14px rgba(0,0,0,0.2)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "#FF6B00"; e.currentTarget.style.boxShadow = "0 4px 14px rgba(255,107,0,0.3)"; }}>
              Digital Guide →
            </a>
          </div>

          {/* Mobile Hamburger */}
          <button className="nav-hamburger"
            onClick={() => setMobileOpen(!mobileOpen)}
            style={{ width: 40, height: 40, borderRadius: 10, border: "1.5px solid #E5E7EB", background: "#fff", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 5, cursor: "pointer", flexShrink: 0 }}
          >
            <span style={{ width: 18, height: 2, background: "#111827", borderRadius: 2, display: "block", transition: "all 0.3s", transform: mobileOpen ? "rotate(45deg) translateY(7px)" : "none" }} />
            <span style={{ width: 18, height: 2, background: "#111827", borderRadius: 2, display: "block", transition: "all 0.3s", opacity: mobileOpen ? 0 : 1 }} />
            <span style={{ width: 18, height: 2, background: "#111827", borderRadius: 2, display: "block", transition: "all 0.3s", transform: mobileOpen ? "rotate(-45deg) translateY(-7px)" : "none" }} />
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              style={{ background: "#fff", borderTop: "1px solid #F3F4F6", overflow: "hidden" }}
            >
              <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: 4 }}>
                {navItems.map(item => (
                  <a key={item.label} href={item.href}
                    onClick={() => setMobileOpen(false)}
                    style={{ padding: "0.875rem 1rem", borderRadius: 12, fontFamily: "'Bebas Neue', cursive", fontSize: 26, letterSpacing: "0.08em", color: "#374151", textDecoration: "none", transition: "all 0.2s", borderBottom: "1px solid #F9FAFB" }}
                    onMouseEnter={e => { e.currentTarget.style.color = "#FF6B00"; e.currentTarget.style.paddingLeft = "1.5rem"; }}
                    onMouseLeave={e => { e.currentTarget.style.color = "#374151"; e.currentTarget.style.paddingLeft = "1rem"; }}>
                    {item.label}
                  </a>
                ))}
                
                <a href={user ? "/dashboard" : "/login"} onClick={() => setMobileOpen(false)}
                  style={{ marginTop: "1rem", padding: "1rem", borderRadius: 14, background: "#F9FAFB", color: "#111827", fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 13, letterSpacing: "0.1em", textTransform: "uppercase", textAlign: "center", textDecoration: "none", border: "1.5px solid #E5E7EB" }}>
                  {user ? "Dashboard" : "Login"}
                </a>

                <a href="#performances" onClick={() => setMobileOpen(false)}
                  style={{ marginTop: "0.5rem", padding: "1rem", borderRadius: 14, background: "#FF6B00", color: "#fff", fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 13, letterSpacing: "0.1em", textTransform: "uppercase", textAlign: "center", textDecoration: "none", boxShadow: "0 4px 16px rgba(255,107,0,0.3)" }}>
                  Buka Digital Guide
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </>
  );
}
