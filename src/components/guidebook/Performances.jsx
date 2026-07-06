import { useState, useRef } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { performances } from "@/lib/guidebookContent";

const FONT = { neulis: "'Plus Jakarta Sans', sans-serif", bebas: "'Bebas Neue', cursive", wondra: "'Cormorant Garamond', serif" };

// ── Animated counter hook ──────────────────────────────────────────────────
function useCountUp(target, duration = 1800) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const started = useRef(false);
  if (inView && !started.current) {
    started.current = true;
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }
  return { count, ref };
}

// ── SVG icon map ────────────────────────────────────────────────────────────
const catIcon = {
  "Seni Musik & Suara": (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
    </svg>
  ),
  "Seni Musik": (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
    </svg>
  ),
  "Seni Tari & Atraksi": (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"/><path d="M6.5 8a2 2 0 0 0-1.905 1.382L3 14l2 1 1.5-3v8h2v-5h3v5h2V12l1.5 3 2-1-1.595-4.618A2 2 0 0 0 11.5 8z"/>
    </svg>
  ),
  "Seni Theater": (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 10s3-3 6-3 6 3 6 3v4s-3 3-6 3-6-3-6-3v-4z"/><path d="M14 10s3-3 6-3v7s-3 3-6 3"/>
    </svg>
  ),
  "Seni Bahasa & Literasi": (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
    </svg>
  ),
};

const catColor = { "Seni Musik & Suara": "#FF6B00", "Seni Musik": "#FF6B00", "Seni Tari & Atraksi": "#EA580C", "Seni Theater": "#DC2626", "Seni Bahasa & Literasi": "#D97706" };
const catBg = { "Seni Musik & Suara": "#FFF0E6", "Seni Musik": "#FFF0E6", "Seni Tari & Atraksi": "#FFF3ED", "Seni Theater": "#FFF1F2", "Seni Bahasa & Literasi": "#FFFBEB" };

const FILTERS = ["Semua", "Seni Musik & Suara", "Seni Tari & Atraksi", "Seni Theater", "Seni Bahasa & Literasi"];

// ── Stat Card ───────────────────────────────────────────────────────────────
function StatCard({ target, suffix = "", label, icon }) {
  const { count, ref } = useCountUp(target);
  return (
    <div ref={ref} style={{ padding: "2rem", borderRadius: 20, background: "#F9FAFB", border: "1px solid #E5E7EB", display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ color: "#9CA3AF", marginBottom: 4 }}>{icon}</div>
      <div style={{ fontFamily: FONT.bebas, fontSize: "clamp(44px,5vw,64px)", color: "#FF6B00", lineHeight: 1 }}>
        {count.toLocaleString()}{suffix}
      </div>
      <div style={{ fontFamily: FONT.neulis, fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "#9CA3AF" }}>{label}</div>
    </div>
  );
}

// ── Performance Card ────────────────────────────────────────────────────────
function PerfCard({ perf, onClick }) {
  const color = catColor[perf.category] || "#FF6B00";
  const bg = catBg[perf.category] || "#FFF0E6";

  return (
    <div
      onClick={() => onClick(perf)}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-8px)";
        e.currentTarget.style.boxShadow = "0 20px 40px rgba(0,0,0,0.08)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "none";
      }}
      style={{
        borderRadius: 24, background: "#fff", border: "1px solid #E5E7EB", overflow: "hidden", cursor: "pointer", transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)", position: "relative", height: "100%", display: "flex", flexDirection: "column"
      }}
    >
      {/* Background Image / Overlay - Removed to save weight as requested */}

      <div style={{ padding: "2rem", position: "relative", zIndex: 1, flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Category & Badge */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: bg, color: color, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 8px 16px ${color}15` }}>
            {catIcon[perf.category] || catIcon["Seni Musik & Suara"]}
          </div>
          <div style={{ fontFamily: FONT.neulis, fontSize: 10, fontWeight: 800, color: "#9CA3AF", letterSpacing: "0.1em" }}>#{String(perf.order).padStart(2, "0")}</div>
        </div>

        {/* Info */}
        <h3 style={{ fontFamily: FONT.neulis, fontSize: 18, fontWeight: 800, color: "#111827", marginBottom: 12, lineHeight: 1.35, minHeight: "2.7em", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {perf.name}
        </h3>
        
        <p style={{ fontFamily: FONT.neulis, fontSize: 13, color: "#6B7280", lineHeight: 1.6, marginBottom: 20, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden", flex: 1 }}>
          {perf.description}
        </p>

        {/* Footer Meta */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 16, borderTop: "1.5px solid #F3F4F6", marginTop: "auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            <span style={{ fontFamily: FONT.neulis, fontSize: 11, fontWeight: 700, color: "#9CA3AF" }}>{perf.duration}</span>
          </div>
          <span style={{ fontFamily: FONT.neulis, fontSize: 10, fontWeight: 800, color: color, textTransform: "uppercase", letterSpacing: "0.05em" }}>Lihat Detail →</span>
        </div>
      </div>
    </div>
  );
}

// ── Modal ───────────────────────────────────────────────────────────────────
function Modal({ perf, onClose }) {
  const [view, setView] = useState("detail"); // "detail", "pdf", "poster"
  if (!perf) return null;
  const color = catColor[perf.category] || "#FF6B00";
  const bg = catBg[perf.category] || "#FFF0E6";

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem", background: "rgba(17,24,39,0.5)", backdropFilter: "blur(8px)" }}>
        <motion.div initial={{ scale: 0.95, opacity: 0, y: 12 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0 }}
          transition={{ type: "spring", damping: 26, stiffness: 280 }}
          onClick={e => e.stopPropagation()}
          style={{ maxWidth: 1100, width: "100%", borderRadius: 24, background: "#fff", border: "1px solid #E5E7EB", padding: "2rem", position: "relative", boxShadow: "0 24px 64px rgba(0,0,0,0.15)", maxHeight: "90vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>

          <button onClick={onClose} style={{ position: "absolute", top: 16, right: 16, width: 36, height: 36, borderRadius: "50%", border: "none", background: "#F3F4F6", cursor: "pointer", fontSize: 18, color: "#6B7280", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10 }}>✕</button>

          {/* Header */}
          <div style={{ display: "flex", gap: 14, alignItems: "center", marginBottom: 24 }}>
            <div style={{ width: 56, height: 56, borderRadius: 14, background: bg, display: "flex", alignItems: "center", justifyContent: "center", color, flexShrink: 0 }}>
              {catIcon[perf.category] || catIcon["Seni Musik & Suara"]}
            </div>
            <div>
              <div style={{ fontFamily: FONT.neulis, fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color, marginBottom: 4 }}>Penampilan {String(perf.order).padStart(2, "0")}</div>
              <h3 style={{ fontFamily: FONT.neulis, fontSize: "clamp(17px,2.5vw,22px)", fontWeight: 800, color: "#111827", lineHeight: 1.25 }}>{perf.name}</h3>
            </div>
          </div>

          {/* Controls */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 20 }}>
            <button 
              onClick={() => setView("detail")}
              style={{ padding: "8px 16px", borderRadius: 99, border: "none", background: view === "detail" ? "#111827" : "#F3F4F6", color: view === "detail" ? "#fff" : "#6B7280", fontFamily: FONT.neulis, fontSize: 11, fontWeight: 700, letterSpacing: "0.05em", cursor: "pointer", transition: "all 0.2s" }}
            >
              DETAIL TEKS
            </button>
            <button 
              onClick={() => setView("pdf")}
              style={{ padding: "8px 16px", borderRadius: 99, border: "none", background: view === "pdf" ? "#FF6B00" : "#F3F4F6", color: view === "pdf" ? "#fff" : "#6B7280", fontFamily: FONT.neulis, fontSize: 11, fontWeight: 700, letterSpacing: "0.05em", cursor: "pointer", transition: "all 0.2s" }}
            >
              GUIDEBOOK
            </button>
          </div>

          {/* Content Area */}
          <div style={{ flex: 1, overflowY: "auto", paddingRight: 8 }} className="custom-scroll">
            {view === "detail" && (
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
                
                {/* Description */}
                <p style={{ fontFamily: FONT.neulis, fontSize: 14, color: "#6B7280", lineHeight: 1.8, marginBottom: 24, padding: "1.25rem", background: "#F9FAFB", borderRadius: 16 }}>{perf.description}</p>

                {/* Stats */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 12, marginBottom: 24 }}>
                  {[["Kategori", perf.category], ["Durasi", perf.duration], ["Peserta", perf.participants === -1 ? "Seluruh Kelas 5" : `${perf.participants} Orang`]].map(([l, v]) => (
                    <div key={l} style={{ padding: "1rem", borderRadius: 14, background: "#fff", border: "1.2px solid #F3F4F6", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
                      <div style={{ fontFamily: FONT.neulis, fontSize: 9, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "#9CA3AF", marginBottom: 6 }}>{l}</div>
                      <div style={{ fontFamily: FONT.neulis, fontSize: 13, fontWeight: 700, color: "#111827" }}>{v}</div>
                    </div>
                  ))}
                </div>

                {/* Lyrics / Script */}
                {perf.lyrics && (
                  <div style={{ marginBottom: 24 }}>
                    <div style={{ fontFamily: FONT.neulis, fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "#9CA3AF", marginBottom: 12 }}>Lirik Lagu</div>
                    <div style={{ padding: "1.5rem", borderRadius: 18, background: "#FFF0E6", border: "1px solid #FDDCBF", fontFamily: FONT.wondra, fontSize: 17, fontStyle: "italic", color: "#374151", lineHeight: 1.9, whiteSpace: "pre-line" }}>
                      {perf.lyrics}
                    </div>
                  </div>
                )}
                {perf.mcScript && (
                  <div style={{ marginBottom: 24 }}>
                    <div style={{ fontFamily: FONT.neulis, fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "#9CA3AF", marginBottom: 12 }}>Teks MC / Dialog</div>
                    <div style={{ padding: "1.5rem", borderRadius: 18, background: "#F9FAFB", border: "1px solid #E5E7EB", fontFamily: FONT.neulis, fontSize: 14, color: "#374151", lineHeight: 1.85, whiteSpace: "pre-line" }}>
                      {perf.mcScript}
                    </div>
                  </div>
                )}
                {perf.songs && (
                  <div style={{ marginBottom: 24 }}>
                    <div style={{ fontFamily: FONT.neulis, fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "#9CA3AF", marginBottom: 12 }}>Daftar Lagu</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {perf.songs.map((s, i) => (
                        <div key={i} style={{ display: "flex", gap: 14, alignItems: "flex-start", padding: "1rem 1.25rem", borderRadius: 16, background: "#F9FAFB", border: "1px solid #F3F4F6" }}>
                          <span style={{ fontFamily: FONT.bebas, fontSize: 20, color: "#FF6B00", flexShrink: 0 }}>{String(i + 1).padStart(2, "0")}</span>
                          <div>
                            <div style={{ fontFamily: FONT.neulis, fontSize: 14, fontWeight: 700, color: "#111827" }}>{s.title}</div>
                            {s.desc && <div style={{ fontFamily: FONT.neulis, fontSize: 13, color: "#6B7280", marginTop: 4 }}>{s.desc}</div>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Supervisors */}
                <div style={{ marginBottom: 24 }}>
                  <div style={{ fontFamily: FONT.neulis, fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "#9CA3AF", marginBottom: 12 }}>Pembimbing</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                    {perf.supervisors.map((s, i) => (
                      <span key={i} style={{ padding: "6px 16px", borderRadius: 999, background: "#F9FAFB", border: "1px solid #E5E7EB", fontFamily: FONT.neulis, fontSize: 12, fontWeight: 600, color: "#374151" }}>{s}</span>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {view === "pdf" && (
              <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }}
                style={{ height: "100%", minHeight: 450, borderRadius: 16, overflow: "hidden", background: "#F9FAFB", border: "1px solid #E5E7EB", display: "flex", flexDirection: "column", position: "relative" }}>
                <div style={{ padding: "12px 16px", background: "#fff", borderBottom: "1px solid #E5E7EB", fontFamily: FONT.neulis, fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "#6B7280", display: "flex", justifyContent: "space-between", zIndex: 5 }}>
                   <span>PRATINJAU GUIDEBOOK</span>
                   <span style={{ color: "#FF6B00" }}>HALAMAN {perf.pdfPage || perf.order}</span>
                </div>
                <div style={{ flex: 1, position: "relative" }}>
                  <iframe 
                    src={`https://docs.google.com/viewer?url=${window.location.origin}/guidebook.pdf&embedded=true#page=${perf.pdfPage || perf.order}`} 
                    title="PDF Preview"
                    style={{ width: "100%", height: "100%", border: "none" }}
                  />
                  {/* Overlay to hint interaction or protect scroll */}
                  <div style={{ position: "absolute", bottom: 80, left: 0, right: 0, padding: "10px", background: "rgba(255,255,255,0.9)", textAlign: "center", fontSize: 10, fontFamily: FONT.neulis, fontWeight: 700, color: "#6B7280", borderTop: "1px solid #E5E7EB", borderBottom: "1px solid #E5E7EB", zIndex: 2 }}>
                    Gunakan tombol di bawah untuk melihat versi lengkap / fullscreen
                  </div>
                </div>
                <div style={{ padding: "1rem", background: "#fff", borderTop: "1px solid #E5E7EB", display: "flex", justifyContent: "center" }}>
                  <button 
                    onClick={() => window.open(`/guidebook.pdf#page=${perf.pdfPage || perf.order}`, '_blank')}
                    style={{ padding: "12px 24px", borderRadius: 12, background: "#111827", color: "#fff", border: "none", cursor: "pointer", fontFamily: FONT.neulis, fontSize: 12, fontWeight: 700, letterSpacing: "0.05em", display: "flex", alignItems: "center", gap: 10, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                    BUKA FULLSCREEN / DOWNLOAD
                  </button>
                </div>
              </motion.div>
            )}

          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ── Main Component ──────────────────────────────────────────────────────────
export default function Performances() {
  const [filter, setFilter] = useState("Semua");
  const [selected, setSelected] = useState(null);

  const filtered = filter === "Semua"
    ? performances
    : performances.filter(p => p.category === filter || (filter === "Seni Musik & Suara" && p.category === "Seni Musik"));

  const statIcons = [
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>,
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 6h16M4 10h16M4 14h10"/></svg>,
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  ];

  return (
    <section id="performances" style={{ padding: "6rem 1.5rem", background: "transparent", borderTop: "1px solid rgba(0,0,0,0.05)" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: 24, marginBottom: "3.5rem" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
              <div style={{ width: 36, height: 1, background: "#FF6B00" }} />
              <span style={{ fontFamily: FONT.neulis, fontSize: 11, fontWeight: 700, letterSpacing: "0.25em", textTransform: "uppercase", color: "#FF6B00" }}>Bab 04</span>
            </div>
            <h2 style={{ fontFamily: FONT.bebas, letterSpacing: "0.05em", color: "#111827", lineHeight: 0.9, fontSize: "clamp(44px, 7vw, 88px)" }}>
              DAFTAR <span style={{ color: "#9CA3AF" }}>PENAMPILAN</span>
            </h2>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <p style={{ fontFamily: FONT.neulis, fontSize: 15, color: "#6B7280", maxWidth: 400, lineHeight: 1.8, margin: 0 }}>
              Berikut adalah daftar lengkap penampilan memukau Drama Arena 5101. Klik pada kartu untuk melihat skrip, lirik, dan desain aslinya.
            </p>
            <motion.button 
              whileHover={{ scale: 1.05, backgroundColor: "#FF6B00", boxShadow: "0 8px 24px rgba(255,107,0,0.3)" }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.open('/guidebook.pdf', '_blank')}
              style={{ width: "fit-content", padding: "10px 24px", borderRadius: 999, background: "#111827", color: "#fff", border: "none", cursor: "pointer", fontFamily: FONT.neulis, fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", display: "flex", alignItems: "center", gap: 8, transition: "all 0.2s" }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
              LIHAT FULL GUIDEBOOK
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.05, border: "1px solid #FF6B00", color: "#FF6B00" }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.open('/Buku Naskah Drama Arena 5101.pdf', '_blank')}
              style={{ width: "fit-content", padding: "10px 24px", borderRadius: 999, background: "#fff", border: "1px solid #E5E7EB", color: "#6B7280", cursor: "pointer", fontFamily: FONT.neulis, fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", display: "flex", alignItems: "center", gap: 8, transition: "all 0.2s" }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
              BUKU NASKAH DA 5101
            </motion.button>
          </div>
        </motion.div>

        {/* Animated Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 16, marginBottom: "3.5rem" }}>
          <StatCard target={28} label="Total Penampilan" icon={statIcons[0]} />
          <StatCard target={4} label="Kategori Seni" icon={statIcons[1]} />
          <StatCard target={440} label="Siswa Kelas 5" icon={statIcons[2]} />
          <StatCard target={700} suffix="+" label="Penonton" icon={statIcons[3]} />
        </div>

        {/* Filter tabs */}
        <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: "2rem" }}>
          {FILTERS.map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: "0.55rem 1.25rem", borderRadius: 999, border: "1.5px solid",
              fontFamily: FONT.neulis, fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer", transition: "all 0.2s",
              background: filter === f ? "#111827" : "#fff", color: filter === f ? "#fff" : "#6B7280", borderColor: filter === f ? "#111827" : "#E5E7EB",
            }}>
              {f}
            </button>
          ))}
        </motion.div>

        {/* Grid Layout (Replaced Slider) */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 24 }}>
          {filtered.map((perf) => (
            <PerfCard key={perf.id} perf={perf} onClick={setSelected} />
          ))}
        </div>

        {/* Hint */}
        <p style={{ fontFamily: FONT.neulis, fontSize: 12, color: "#9CA3AF", textAlign: "center", marginTop: 40 }}>
          Klik kartu untuk melihat detail, lirik, skrip, dan pratinjau desain PDF.
        </p>
      </div>

      <Modal perf={selected} onClose={() => setSelected(null)} />
    </section>
  );
}
