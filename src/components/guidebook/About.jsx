import { motion, useInView, AnimatePresence } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { eventObjectives, logoPhilosophy, eventInfo } from "@/lib/guidebookContent";
import { use3DStore } from "@/store/use3DStore";

const FONT_NEULIS = "'Plus Jakarta Sans', sans-serif";
const FONT_WONDRA = "'Cormorant Garamond', serif";
const FONT_BEBAS = "'Bebas Neue', cursive";

const S = {
  section: { padding: "6rem 1.5rem", background: "transparent", borderTop: "1px solid rgba(0,0,0,0.05)", overflow: "hidden" },
  inner: { maxWidth: 1280, margin: "0 auto" },
  label: { display: "flex", alignItems: "center", gap: 12, marginBottom: 14 },
  labelLine: { width: 36, height: 1, background: "#FF6B00" },
  labelText: { fontFamily: FONT_NEULIS, fontSize: 11, fontWeight: 700, letterSpacing: "0.25em", textTransform: "uppercase", color: "#FF6B00" },
  heading: { fontFamily: FONT_BEBAS, letterSpacing: "0.05em", color: "#111827", lineHeight: 0.9, marginBottom: "1.5rem", fontSize: "clamp(44px, 7vw, 88px)" },
  card: { borderRadius: 24, background: "#F9FAFB", border: "1px solid #E5E7EB", padding: "2.5rem", height: "100%" },
};

function Fade({ children, delay = 0, style = {} }) {
  const ref = useRef(null);
  const inView = useInView(ref, { margin: "-10% 0px -10% 0px" });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 40 }} animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.8, delay, ease: "easeOut" }} style={style}>
      {children}
    </motion.div>
  );
}

// ── Interactive Philosophy Component ──
// ── Interactive Philosophy Component ──
function InteractivePhilosophy() {
  const [activeIdx, setActiveIdx] = useState(0);
  const containerRef = useRef(null);

  // Hook into 3D Store
  const setSection = use3DStore((state) => state.setCurrentSection);
  const setPhilosophyIdx = use3DStore((state) => state.setActivePhilosophyIndex);

  // When this component is in view, we tell the 3D model we are in Philosophy mode
  const inView = useInView(containerRef, { margin: "-30% 0px -30% 0px" });

  useEffect(() => {
    if (inView) {
      setSection('philosophy');
      setPhilosophyIdx(activeIdx);
    } else {
      setPhilosophyIdx(null);
    }
  }, [inView, activeIdx, setSection, setPhilosophyIdx]);

  // Static positions for the hotspots relative to the center 3D model
  const hotspots = [
    { top: "25%", left: "30%", line: { w: 80, h: 2, top: "50%", left: "100%" } }, // Corner
    { top: "70%", left: "48%", line: { w: 2, h: 80, bottom: "100%", left: "50%" } }, // Diamond
    { top: "35%", left: "75%", line: { w: 80, h: 2, top: "50%", right: "100%" } }, // Frame
    { top: "85%", left: "70%", line: { w: 2, h: 80, bottom: "100%", left: "50%" } }  // D & A
  ];

  return (
    <div ref={containerRef} style={{ position: "relative", marginTop: "2rem", marginBottom: "4rem" }}>
      {/* Interactive area matching the 3D model size */}
      <div style={{ position: "relative", width: "100%", height: 500, display: "flex", alignItems: "center", justifyContent: "center" }}>
        
        {/* Hotspots */}
        {logoPhilosophy.map((item, i) => {
          const pos = hotspots[i] || { top: "50%", left: "50%" };
          const isActive = activeIdx === i;

          return (
            <div key={i} style={{ position: "absolute", top: pos.top, left: pos.left, transform: "translate(-50%, -50%)", zIndex: 20 }}>
              
              {/* Connecting Line (Optional, CSS based) */}
              {isActive && pos.line && (
                <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} 
                  style={{ 
                    position: "absolute", background: "#FF6B00", zIndex: -1,
                    width: pos.line.w, height: pos.line.h, 
                    top: pos.line.top, bottom: pos.line.bottom, left: pos.line.left, right: pos.line.right 
                  }} 
                />
              )}

              <motion.button
                onClick={() => setActiveIdx(i)}
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ margin: "-10% 0px -10% 0px" }}
                transition={{ delay: i * 0.1, type: "spring" }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                style={{
                  width: 56, height: 56, borderRadius: "50%",
                  background: isActive ? "#FF6B00" : "rgba(255,255,255,0.8)",
                  backdropFilter: "blur(4px)",
                  border: `2px solid ${isActive ? "#FF6B00" : "#E5E7EB"}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: isActive ? "0 8px 20px rgba(255,107,0,0.3)" : "0 4px 12px rgba(0,0,0,0.05)",
                  cursor: "pointer", overflow: "hidden", padding: 8
                }}
              >
                {item.icon.startsWith("/") || item.icon.includes(".") ? (
                  <img src={item.icon} alt={item.title} style={{ width: "100%", height: "100%", objectFit: "contain", filter: isActive ? "brightness(0) invert(1)" : "none" }} />
                ) : (
                  <span style={{ fontFamily: FONT_WONDRA, fontSize: 20, fontWeight: 700, color: isActive ? "#fff" : "#FF6B00" }}>{item.icon}</span>
                )}
              </motion.button>
              
              {/* Pulse effect when active */}
              {isActive && (
                <motion.div
                  initial={{ scale: 1, opacity: 0.5 }}
                  animate={{ scale: 2, opacity: 0 }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "easeOut" }}
                  style={{
                    position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
                    borderRadius: "50%", border: "2px solid #FF6B00", zIndex: -1
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Content Viewer (Smooth Transition) */}
      <div style={{ width: "100%", maxWidth: 650, position: "relative", margin: "0 auto" }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeIdx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            style={{ textAlign: "center", background: "rgba(255, 255, 255, 0.8)", padding: "2.5rem", borderRadius: 24, border: "1px solid #F3F4F6", boxShadow: "0 10px 30px rgba(0,0,0,0.03)" }}
          >
            <div style={{ display: "inline-flex", padding: "8px 20px", borderRadius: 99, background: "#FFF0E6", color: "#FF6B00", fontFamily: FONT_NEULIS, fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 16 }}>
              Filosofi Elemen
            </div>
            <h4 style={{ fontFamily: FONT_BEBAS, fontSize: "clamp(32px, 5vw, 48px)", color: "#111827", marginBottom: 16, letterSpacing: "0.05em", lineHeight: 1 }}>
              {logoPhilosophy[activeIdx].title}
            </h4>
            <p style={{ fontFamily: FONT_NEULIS, fontSize: 16, color: "#4B5563", lineHeight: 1.8, margin: 0 }}>
              {logoPhilosophy[activeIdx].desc}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}


export default function About() {
  return (
    <section id="about" style={S.section}>
      <div style={S.inner}>

        {/* ── Header ── */}
        <Fade style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: 24, marginBottom: "4rem" }}>
          <div>
            <div style={S.label}><div style={S.labelLine} /><span style={S.labelText}>Bab 01</span></div>
            <h2 style={S.heading}>TENTANG ACARA <span style={{ color: "#9CA3AF" }}>DRAMA ARENA</span></h2>
          </div>
          <p style={{ fontFamily: FONT_NEULIS, fontSize: 16, color: "#6B7280", maxWidth: 400, lineHeight: 1.8 }}>
            Memahami lebih dalam tentang filosofi, tujuan, dan detail pelaksanaan pagelaran seni terbesar tahun ini.
          </p>
        </Fade>

        {/* ── Row 1: Nama Acara + Moto ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24, marginBottom: 24 }}>
          <Fade delay={0.1}>
            <div style={S.card}>
              <div style={{ fontFamily: FONT_NEULIS, fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "#9CA3AF", marginBottom: 16 }}>Nama Acara</div>
              <div style={{ fontFamily: FONT_WONDRA, fontSize: 36, fontWeight: 700, color: "#111827", marginBottom: 16, lineHeight: 1.15 }}>{eventInfo.name}</div>
              <p style={{ fontFamily: FONT_NEULIS, fontSize: 15, color: "#6B7280", lineHeight: 1.75 }}>
                Pagelaran Seni siswa kelas 5 KMI Pondok Modern Darussalam Gontor periode {eventInfo.period}.
              </p>
            </div>
          </Fade>
          <Fade delay={0.15}>
            <div style={{ ...S.card, background: "#FFF0E6", border: "1px solid #FDDCBF", position: "relative", overflow: "visible" }}>
              {/* Jargon Image */}
              <motion.img
                src="/jargon.png"
                alt="Jargon DA"
                initial={{ opacity: 0, scale: 0.5, rotate: 15, x: 20 }}
                whileInView={{ opacity: 1, scale: 1, rotate: -8, x: 0 }}
                viewport={{ margin: "-10% 0px -10% 0px" }}
                transition={{ type: "spring", damping: 15, stiffness: 100, delay: 0.3 }}
                style={{ position: "absolute", top: -35, right: -25, width: "clamp(100px, 20vw, 140px)", height: "auto", zIndex: 20, filter: "drop-shadow(0 8px 16px rgba(255,107,0,0.25))", transformOrigin: "bottom right" }}
                onError={e => e.target.style.display = 'none'}
              />

              <div style={{ position: "absolute", top: -40, right: -40, width: 180, height: 180, borderRadius: "50%", background: "rgba(255,107,0,0.1)", filter: "blur(40px)" }} />
              <div style={{ fontFamily: FONT_NEULIS, fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "#FF6B00", marginBottom: 16, position: "relative" }}>Moto Acara</div>
              <div style={{ position: "relative", zIndex: 1 }}>
                <p style={{ fontFamily: FONT_WONDRA, fontSize: "clamp(20px, 2.5vw, 30px)", fontWeight: 600, fontStyle: "italic", color: "#374151", lineHeight: 1.4, marginBottom: 6 }}>"{eventInfo.motto.split(',')[0]},</p>
                <p style={{ fontFamily: FONT_WONDRA, fontSize: "clamp(20px, 2.5vw, 30px)", fontWeight: 700, fontStyle: "italic", color: "#FF6B00", lineHeight: 1.4 }}>{eventInfo.motto.split(',')[1]}."</p>
              </div>
            </div>
          </Fade>
        </div>

        {/* ── Row 2: Waktu & Tempat ── */}
        <Fade delay={0.2} style={{ marginBottom: 24 }}>
          <div style={{ ...S.card, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 0, left: 0, width: 4, height: "100%", background: "#FF6B00", borderRadius: "24px 0 0 24px" }} />
            <div style={{ fontFamily: FONT_NEULIS, fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "#9CA3AF", marginBottom: 28, paddingLeft: 16 }}>Waktu & Tempat</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 28, paddingLeft: 16 }}>
              {[
                ["📅", "Hari/Tanggal", eventInfo.date.split('/')[0].trim()],
                ["⏱", "Waktu", eventInfo.time],
                ["📍", "Tempat", eventInfo.venue],
                ["👤", "Pembimbing", eventInfo.picInCharge],
              ].map(([icon, label, val]) => (
                <div key={label} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: "#fff", border: "1px solid #E5E7EB", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>{icon}</div>
                  <div>
                    <div style={{ fontFamily: FONT_NEULIS, fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "#9CA3AF", marginBottom: 4 }}>{label}</div>
                    <div style={{ fontFamily: FONT_NEULIS, fontSize: 14, fontWeight: 700, color: "#1F2937", lineHeight: 1.4 }}>{val}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Fade>

        {/* ── Row 3: Tujuan ── */}
        <Fade delay={0.25} style={{ marginBottom: "6rem" }}>
          <div style={{ ...S.card, background: "#FFF0E6", border: "1px solid #FDDCBF" }}>
            <div style={{ fontFamily: FONT_NEULIS, fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "#FF6B00", marginBottom: 24 }}>Tujuan Acara</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "12px 48px" }}>
              {eventObjectives.map((obj, i) => (
                <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#FF6B00", flexShrink: 0, marginTop: 7 }} />
                  <p style={{ fontFamily: FONT_NEULIS, fontSize: 14, color: "#374151", lineHeight: 1.7, fontWeight: 500 }}>{obj}</p>
                </div>
              ))}
            </div>
          </div>
        </Fade>

        {/* ── Bab 02: Filosofi Logo ── */}
        <Fade>
          <div style={{ ...S.label, marginBottom: 12 }}><div style={S.labelLine} /><span style={S.labelText}>Bab 02</span></div>
          <h3 style={{ ...S.heading, marginBottom: "0.75rem" }}>FILOSOFI <span style={{ color: "#9CA3AF" }}>LOGO</span></h3>
          <p style={{ fontFamily: FONT_NEULIS, fontSize: 15, color: "#6B7280", lineHeight: 1.7, maxWidth: 600, marginBottom: "1rem" }}>
            Setiap elemen pada logo DA 5101 mengandung makna mendalam yang mencerminkan semangat, identitas, dan cita-cita seluruh siswa kelas 5 KMI.
          </p>
        </Fade>

        <Fade delay={0.1}>
          <InteractivePhilosophy />
        </Fade>

      </div>
    </section>
  );
}
