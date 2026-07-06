import { motion } from "framer-motion";
import { sponsors } from "@/lib/guidebookContent";
import Marquee from "./MagicUI/Marquee";

export default function Sponsors() {
  const FONT_NEULIS = "'Plus Jakarta Sans', sans-serif";
  const FONT_BEBAS = "'Bebas Neue', cursive";

  return (
    <section id="sponsors" style={{ padding: "4rem 0", background: "transparent", borderTop: "1px solid rgba(0,0,0,0.05)", overflow: "hidden" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 1.5rem", marginBottom: "2.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
          <div style={{ width: 36, height: 1, background: "#FF6B00" }} />
          <span style={{ fontFamily: FONT_NEULIS, fontSize: 11, fontWeight: 700, letterSpacing: "0.25em", textTransform: "uppercase", color: "#FF6B00" }}>Sponsorship</span>
        </div>
        <h2 style={{ fontFamily: FONT_BEBAS, letterSpacing: "0.05em", color: "#111827", lineHeight: 0.9, fontSize: "clamp(32px, 5vw, 48px)" }}>
          DIDUKUNG <span style={{ color: "#9CA3AF" }}>OLEH</span>
        </h2>
      </div>

      <div style={{ background: "transparent", padding: "3rem 0", borderTop: "1px solid rgba(0,0,0,0.05)", borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
        <Marquee pauseOnHover className="[--duration:40s] [--gap:4rem]">
          {sponsors.map((s, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 15, opacity: 0.8, transition: "opacity 0.3s" }}
              onMouseEnter={e => e.currentTarget.style.opacity = "1"}
              onMouseLeave={e => e.currentTarget.style.opacity = "0.8"}>
              <div style={{ 
                width: 140, 
                height: 70, 
                borderRadius: 12, 
                background: "#fff", 
                border: "1px solid #E5E7EB", 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center", 
                overflow: "hidden", 
                padding: "12px", 
                boxShadow: "0 4px 12px rgba(0,0,0,0.03)" 
              }}>
                <img 
                  src={s.logo} 
                  alt={s.name} 
                  style={{ 
                    maxWidth: "100%", 
                    maxHeight: "100%", 
                    objectFit: "contain", 
                    display: "block",
                    filter: "grayscale(100%) brightness(0.8)", // Initial professional look
                    transition: "all 0.3s"
                  }} 
                  onMouseEnter={e => e.currentTarget.style.filter = "grayscale(0%) brightness(1)"}
                  onMouseLeave={e => e.currentTarget.style.filter = "grayscale(100%) brightness(0.8)"}
                  loading="lazy"
                />
              </div>
              <span style={{ fontFamily: FONT_NEULIS, fontSize: 14, fontWeight: 700, color: "#374151", letterSpacing: "0.05em" }}>{s.name}</span>
            </div>
          ))}
        </Marquee>
      </div>
    </section>
  );
}
