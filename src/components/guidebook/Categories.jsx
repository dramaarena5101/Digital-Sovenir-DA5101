import { motion, useInView, AnimatePresence } from "framer-motion";
import { useRef, useState } from "react";
import { categories } from "@/lib/guidebookContent";
import { use3DStore } from "@/store/use3DStore";

const FONT = { neulis: "'Plus Jakarta Sans', sans-serif", bebas: "'Bebas Neue', cursive" };
const CARD_W = 280;
const GAP = 20;

const catIcons = {
  "Seni Musik & Suara": (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
    </svg>
  ),
  "Seni Tari & Atraksi": (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"/><path d="M6.5 8a2 2 0 0 0-1.905 1.382L3 14l2 1 1.5-3v8h2v-5h3v5h2V12l1.5 3 2-1-1.595-4.618A2 2 0 0 0 11.5 8z"/>
    </svg>
  ),
  "Seni Theater": (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 10s3-3 6-3 6 3 6 3v4s-3 3-6 3-6-3-6-3v-4z"/><path d="M14 10s3-3 6-3v7s-3 3-6 3"/>
    </svg>
  ),
  "Seni Bahasa & Literasi": (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
    </svg>
  ),
};

const catColors = [
  { text: "#FF6B00", bg: "#FFF0E6", border: "#FDDCBF" },
  { text: "#EA580C", bg: "#FFF3ED", border: "#FED7AA" },
  { text: "#DC2626", bg: "#FFF1F2", border: "#FECDD3" },
  { text: "#D97706", bg: "#FFFBEB", border: "#FDE68A" },
];

function NavBtn({ onClick, disabled, children }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{ width: 40, height: 40, borderRadius: "50%", border: "1.5px solid #E5E7EB", background: disabled ? "#F9FAFB" : "#fff", cursor: disabled ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: disabled ? "#D1D5DB" : "#111827", transition: "all 0.2s", flexShrink: 0 }}
      onMouseEnter={e => { if (!disabled) { e.currentTarget.style.background = "#FF6B00"; e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderColor = "#FF6B00"; } }}
      onMouseLeave={e => { e.currentTarget.style.background = disabled ? "#F9FAFB" : "#fff"; e.currentTarget.style.color = disabled ? "#D1D5DB" : "#111827"; e.currentTarget.style.borderColor = "#E5E7EB"; }}>
      {children}
    </button>
  );
}

export default function Categories() {
  const setHoveredCategory = use3DStore((state) => state.setHoveredCategory);
  const [idx, setIdx] = useState(0);
  const total = categories.length;
  const perPage = 1; // Show 1 category at a time on mobile, adapted
  const maxIdx = Math.max(0, total - 1);

  return (
    <section id="categories" style={{ padding: "6rem 1.5rem", background: "transparent", borderTop: "1px solid rgba(0,0,0,0.05)" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: 24, marginBottom: "3.5rem" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
              <div style={{ width: 36, height: 1, background: "#FF6B00" }} />
              <span style={{ fontFamily: FONT.neulis, fontSize: 11, fontWeight: 700, letterSpacing: "0.25em", textTransform: "uppercase", color: "#FF6B00" }}>Bab 03</span>
            </div>
            <h2 style={{ fontFamily: FONT.bebas, letterSpacing: "0.05em", color: "#111827", lineHeight: 0.9, fontSize: "clamp(44px, 7vw, 88px)" }}>
              KATEGORI <span style={{ color: "#9CA3AF" }}>SENI</span>
            </h2>
          </div>
          <p style={{ fontFamily: FONT.neulis, fontSize: 15, color: "#6B7280", maxWidth: 360, lineHeight: 1.8 }}>
            Eksplorasi 4 medium ekspresi seni dalam panggung Drama Arena 5101.
          </p>
        </motion.div>

        {/* Slider nav header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div style={{ display: "flex", gap: 8 }}>
            {categories.map((_, i) => (
              <button key={i} onClick={() => setIdx(i)} style={{
                width: i === idx ? 32 : 8, height: 8, borderRadius: 999,
                background: i === idx ? "#FF6B00" : "#E5E7EB", border: "none",
                cursor: "pointer", transition: "all 0.3s", padding: 0
              }} />
            ))}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <NavBtn onClick={() => setIdx(i => Math.max(0, i - 1))} disabled={idx === 0}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
            </NavBtn>
            <NavBtn onClick={() => setIdx(i => Math.min(maxIdx, i + 1))} disabled={idx >= maxIdx}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
            </NavBtn>
          </div>
        </div>

        {/* Slider track */}
        <div style={{ overflow: "hidden", borderRadius: 24 }}>
          <AnimatePresence mode="wait">
            {categories.map((cat, i) => {
              if (i !== idx) return null;
              const c = catColors[i % catColors.length];
              return (
                <motion.div key={cat.name}
                  onMouseEnter={() => setHoveredCategory(cat.name)}
                  onMouseLeave={() => setHoveredCategory(null)}
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={1}
                  onDragEnd={(e, info) => {
                    if (info.offset.x < -50 && idx < maxIdx) setIdx(idx + 1);
                    else if (info.offset.x > 50 && idx > 0) setIdx(idx - 1);
                  }}
                  initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  style={{ borderRadius: 24, background: "#fff", border: "1px solid #E5E7EB", overflow: "hidden", cursor: "grab" }}
                  whileTap={{ cursor: "grabbing" }}>

                  {/* Top accent bar */}
                  <div style={{ height: 4, background: `linear-gradient(to right, ${c.text}, ${c.text}88)` }} />

                  <div style={{ padding: "2.5rem", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px,1fr))", gap: 32, alignItems: "start" }}>
                    {/* Left: info */}
                    <div>
                      <div style={{ width: 64, height: 64, borderRadius: 18, background: c.bg, border: `1px solid ${c.border}`, display: "flex", alignItems: "center", justifyContent: "center", color: c.text, marginBottom: 20 }}>
                        {catIcons[cat.name] || catIcons["Seni Musik & Suara"]}
                      </div>
                      <div style={{ fontFamily: FONT.neulis, fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "#9CA3AF", marginBottom: 8 }}>
                        Kategori {String(i + 1).padStart(2, "0")} dari {total}
                      </div>
                      <h3 style={{ fontFamily: FONT.bebas, fontSize: "clamp(28px,4vw,48px)", letterSpacing: "0.05em", color: "#111827", lineHeight: 1, marginBottom: 16 }}>
                        {cat.name.toUpperCase()}
                      </h3>
                      <p style={{ fontFamily: FONT.neulis, fontSize: 14, color: "#6B7280", lineHeight: 1.75, marginBottom: 24 }}>
                        {cat.desc || `Menampilkan ${cat.items.length} penampilan unggulan dari cabang ${cat.name}.`}
                      </p>
                      <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "0.5rem 1.25rem", borderRadius: 999, background: c.bg, border: `1px solid ${c.border}`, fontFamily: FONT.neulis, fontSize: 11, fontWeight: 700, color: c.text }}>
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: c.text }} />
                        {cat.items.length} Penampilan
                      </div>
                    </div>

                    {/* Right: items */}
                    <div>
                      <div style={{ fontFamily: FONT.neulis, fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "#9CA3AF", marginBottom: 16 }}>Daftar Penampilan</div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {cat.items.map((item, j) => (
                          <motion.div key={item}
                            initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: j * 0.05, duration: 0.3 }}
                            style={{ display: "flex", alignItems: "center", gap: 12, padding: "0.75rem 1rem", borderRadius: 12, background: "#F9FAFB", border: "1px solid #F3F4F6", transition: "all 0.2s" }}
                            onMouseEnter={e => { e.currentTarget.style.background = c.bg; e.currentTarget.style.borderColor = c.border; }}
                            onMouseLeave={e => { e.currentTarget.style.background = "#F9FAFB"; e.currentTarget.style.borderColor = "#F3F4F6"; }}>
                            <span style={{ fontFamily: FONT.bebas, fontSize: 16, color: c.text, flexShrink: 0 }}>{String(j + 1).padStart(2, "0")}</span>
                            <span style={{ fontFamily: FONT.neulis, fontSize: 13, fontWeight: 600, color: "#374151" }}>{item}</span>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Bottom tabs */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 20 }}>
          {categories.map((cat, i) => {
            const c = catColors[i % catColors.length];
            return (
              <button key={cat.name} onClick={() => setIdx(i)} style={{
                padding: "0.6rem 1.25rem", borderRadius: 999, border: "1.5px solid",
                fontFamily: FONT.neulis, fontSize: 11, fontWeight: 700, cursor: "pointer", transition: "all 0.2s",
                background: idx === i ? c.bg : "#fff", color: idx === i ? c.text : "#9CA3AF",
                borderColor: idx === i ? c.border : "#E5E7EB",
              }}>
                {cat.name}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
