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
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 28 }} animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: "easeOut" }} style={style}>
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

  // Circular layout logic
  const radius = 140; // distance from center
  const total = logoPhilosophy.length;

  return (
    <div ref={containerRef} style={{ position: "relative", marginTop: "4rem", marginBottom: "4rem" }}>
      {/* Background soft circle */}
      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "clamp(400px, 90vw, 700px)", height: "clamp(400px, 90vw, 700px)", borderRadius: "50%", background: "radial-gradient(circle, rgba(255,107,0,0.06) 0%, transparent 70%)", zIndex: 0, pointerEvents: "none" }} />

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", position: "relative", zIndex: 1, minHeight: 600 }}>
        
        {/* The Interactive Ring */}
        <div style={{ position: "relative", width: "100%", height: 400, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "2rem" }}>
          
          {/* Icons in Circle */}
          {logoPhilosophy.map((item, i) => {
            const angle = (i * (360 / total)) - 90; // offset to start from top
            const x = radius * Math.cos((angle * Math.PI) / 180);
            const y = radius * Math.sin((angle * Math.PI) / 180);

            return (
              <motion.button
                key={i}
                onClick={() => setActiveIdx(i)}
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, type: "spring" }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                style={{
                  position: "absolute",
                  left: `calc(50% + ${x}px - 32px)`,
                  top: `calc(50% + ${y}px - 32px)`,
                  width: 64, height: 64, borderRadius: "50%",
                  background: activeIdx === i ? "#FF6B00" : "#fff",
                  border: `2px solid ${activeIdx === i ? "#FF6B00" : "#E5E7EB"}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: activeIdx === i ? "0 8px 20px rgba(255,107,0,0.3)" : "0 4px 12px rgba(0,0,0,0.05)",
                  cursor: "pointer", zIndex: 20, overflow: "hidden", padding: 8
                }}
              >
                {item.icon.startsWith("/") || item.icon.includes(".") ? (
                  <img src={item.icon} alt={item.title} style={{ width: "100%", height: "100%", objectFit: "contain", filter: activeIdx === i ? "brightness(0) invert(1)" : "none" }} />
                ) : (
                  <span style={{ fontFamily: FONT_WONDRA, fontSize: 24, fontWeight: 700, color: activeIdx === i ? "#fff" : "#FF6B00" }}>{item.icon}</span>
                )}
              </motion.button>
            );
          })}

          {/* Lines from center to icons */}
          <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", zIndex: 5, pointerEvents: "none" }}>
            {logoPhilosophy.map((_, i) => {
              const angle = (i * (360 / total)) - 90;
              const x = radius * Math.cos((angle * Math.PI) / 180);
              const y = radius * Math.sin((angle * Math.PI) / 180);
              return (
                <line 
                  key={i} 
                  x1="50%" y1="50%" x2={`calc(50% + ${x}px)`} y2={`calc(50% + ${y}px)`} 
                  stroke={activeIdx === i ? "#FF6B00" : "#F3F4F6"} 
                  strokeWidth={activeIdx === i ? 2 : 1} 
                  strokeDasharray={activeIdx === i ? "none" : "4 4"}
                />
              );
            })}
          </svg>

          {/* Central Logo Placeholder (The 3D model will sit here instead of the static image) */}
          <div style={{ width: 180, height: 180, borderRadius: "50%", background: "transparent", border: "1px dashed rgba(255,107,0,0.3)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", position: "relative", zIndex: 1 }} />
        </div>

        {/* Content Viewer (Smooth Transition) */}
        <div style={{ width: "100%", maxWidth: 650, position: "relative" }}>
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
                FILOSOFI ELEMEN
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
                viewport={{ once: true }}
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
