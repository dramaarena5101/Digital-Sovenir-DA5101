import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { judges } from "@/lib/guidebookContent";

export default function Judges() {
  const FONT = { neulis: "'Plus Jakarta Sans', sans-serif", bebas: "'Bebas Neue', cursive" };

  return (
    <section id="judges" style={{ padding: "6rem 1.5rem", background: "transparent", borderTop: "1px solid rgba(0,0,0,0.05)" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ margin: "-10% 0px -10% 0px" }}
          style={{ marginBottom: "4rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <div style={{ width: 36, height: 1, background: "#FF6B00" }} />
            <span style={{ fontFamily: FONT.neulis, fontSize: 11, fontWeight: 700, letterSpacing: "0.25em", textTransform: "uppercase", color: "#FF6B00" }}>Bab 06</span>
          </div>
          <h2 style={{ fontFamily: FONT.bebas, letterSpacing: "0.05em", color: "#111827", lineHeight: 0.9, fontSize: "clamp(44px, 7vw, 88px)" }}>
            PANGGUNG <span style={{ color: "#9CA3AF" }}>KEHORMATAN & JURI</span>
          </h2>
        </motion.div>

        {/* Categories Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 24 }}>
          
          {/* Pimpinan PMDG */}
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ margin: "-10% 0px -10% 0px" }}
            style={{ padding: "2rem", borderRadius: 24, background: "#FFF7ED", border: "1.5px solid #FFEDD5" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
              <div style={{ width: 14, height: 14, borderRadius: "50%", background: "#FF6B00" }} />
              <h3 style={{ fontFamily: FONT.neulis, fontSize: 16, fontWeight: 800, color: "#9A3412", textTransform: "uppercase", letterSpacing: "0.05em" }}>Pimpinan PMDG</h3>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {judges.pimpinan.map((name, i) => (
                <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start", fontFamily: FONT.neulis, fontSize: 14, fontWeight: 600, color: "#431407", lineHeight: 1.5 }}>
                  <span style={{ color: "#FF6B00", fontWeight: 800 }}>{i + 1}.</span>
                  {name}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Ketua Lembaga */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ margin: "-10% 0px -10% 0px" }} transition={{ delay: 0.1 }}
            style={{ padding: "2rem", borderRadius: 24, background: "#F8FAFC", border: "1.5px solid #E2E8F0" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
              <div style={{ width: 14, height: 14, borderRadius: "50%", background: "#94A3B8" }} />
              <h3 style={{ fontFamily: FONT.neulis, fontSize: 16, fontWeight: 800, color: "#334155", textTransform: "uppercase", letterSpacing: "0.05em" }}>Ketua-Ketua Lembaga</h3>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {judges.lembaga.map((name, i) => (
                <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start", fontFamily: FONT.neulis, fontSize: 14, fontWeight: 600, color: "#1E293B", lineHeight: 1.5 }}>
                  <span style={{ color: "#64748B", fontWeight: 800 }}>{i + 1}.</span>
                  {name}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Tim Dewan Juri */}
          <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ margin: "-10% 0px -10% 0px" }} transition={{ delay: 0.2 }}
            style={{ padding: "2rem", borderRadius: 24, background: "#F0F9FF", border: "1.5px solid #E0F2FE", gridColumn: "span 1" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
              <div style={{ width: 14, height: 14, borderRadius: "50%", background: "#0EA5E9" }} />
              <h3 style={{ fontFamily: FONT.neulis, fontSize: 16, fontWeight: 800, color: "#075985", textTransform: "uppercase", letterSpacing: "0.05em" }}>Tim Dewan Juri</h3>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "10px 24px" }}>
              {judges.dewanJuri.map((j, i) => (
                <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", fontFamily: FONT.neulis, fontSize: 13, fontWeight: 600, color: "#0C4A6E", lineHeight: 1.4 }}>
                  <span style={{ color: "#0EA5E9", fontWeight: 800, minWidth: 20 }}>{i + 1}.</span>
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <span>{j.name}</span>
                    <span style={{ fontSize: 10, color: "#0EA5E9", textTransform: "uppercase", letterSpacing: "0.05em", marginTop: 2 }}>{j.role}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
