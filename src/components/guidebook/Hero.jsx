import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { eventInfo } from "@/lib/guidebookContent";
import RetroGrid from "./MagicUI/RetroGrid";

export default function Hero({ handleCTA }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const logoY = useTransform(scrollYProgress, [0, 1], [0, -60]);
  const logoScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.75]);
  const logoOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  
  const textY = useTransform(scrollYProgress, [0, 0.6], [0, -80]); // Text moves up slightly as you scroll down
  const textOpacity = useTransform(scrollYProgress, [0, 0.4], [1, 0]); // Text fades out faster than 3D model

  return (
    <section ref={ref} id="home" style={{
      minHeight: "100dvh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", overflow: "hidden",
      background: "transparent", position: "relative", padding: "5rem 1.5rem 3rem"
    }}>
      <RetroGrid className="opacity-30" />

      {/* Orange accent blobs */}
      <div style={{ position: "absolute", top: "20%", right: "5%", width: 320, height: 320, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,107,0,0.08) 0%, transparent 70%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "15%", left: "3%", width: 240, height: 240, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,107,0,0.05) 0%, transparent 70%)", pointerEvents: "none" }} />

      {/* Orange corner lines */}
      <div className="hidden md:block" style={{ position: "absolute", top: 40, left: 40, width: 32, height: 32, borderTop: "2px solid rgba(255,107,0,0.25)", borderLeft: "2px solid rgba(255,107,0,0.25)" }} />
      <div className="hidden md:block" style={{ position: "absolute", top: 40, right: 40, width: 32, height: 32, borderTop: "2px solid rgba(255,107,0,0.25)", borderRight: "2px solid rgba(255,107,0,0.25)" }} />
      <div className="hidden md:block" style={{ position: "absolute", bottom: 40, left: 40, width: 32, height: 32, borderBottom: "2px solid rgba(255,107,0,0.25)", borderLeft: "2px solid rgba(255,107,0,0.25)" }} />
      <div className="hidden md:block" style={{ position: "absolute", bottom: 40, right: 40, width: 32, height: 32, borderBottom: "2px solid rgba(255,107,0,0.25)", borderRight: "2px solid rgba(255,107,0,0.25)" }} />

      <div style={{ position: "relative", zIndex: 10, textAlign: "center", width: "100%", maxWidth: 900, display: "flex", flexDirection: "column", alignItems: "center" }}>

        {/* Wrap content for scroll-out animation */}
        <motion.div style={{ opacity: textOpacity, y: textY, width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
          
          {/* Badge */}
          <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "0.4rem 1.25rem", borderRadius: 999, border: "1.5px solid #FDDCBF", background: "#FFF0E6", fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "#FF6B00", marginBottom: "2.5rem" }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#FF6B00", display: "block" }} />
              Digital Guide Book · 2026
            </div>
          </motion.div>

          {/* Spacer for 3D Model floating in background */}
          <motion.div
            style={{ y: logoY, scale: logoScale, opacity: logoOpacity, marginBottom: "2rem" }}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2, type: "spring", damping: 18 }}
          >
            <div style={{ position: "relative" }}>
              <div style={{ width: 200, height: 200, position: "relative", zIndex: 1 }} />
            </div>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.35 }}
            style={{ fontFamily: "var(--font-wondra)", letterSpacing: "0.05em", color: "#111827", lineHeight: 0.9, marginBottom: "1rem", fontSize: "clamp(60px, 12vw, 150px)" }}
          >
            DRAMA ARENA
          </motion.h1>

          {/* Orange divider */}
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }} animate={{ opacity: 1, scaleX: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            style={{ width: "60%", maxWidth: 400, height: 2, background: "linear-gradient(to right, transparent, #FF6B00, transparent)", margin: "1.25rem auto", borderRadius: 2 }}
          />

          {/* Subtitle */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            style={{ fontFamily: "'Inter', sans-serif", letterSpacing: "0.4em", color: "#FF6B00", marginBottom: "1.5rem", fontSize: "clamp(12px, 2vw, 18px)", fontWeight: 700, textTransform: "uppercase" }}
          >
            FIVE A HUNDRED ONE
          </motion.h2>

          {/* Motto */}
          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
            style={{ fontFamily: "'Inter', sans-serif", fontSize: "clamp(14px, 1.5vw, 17px)", color: "#6B7280", maxWidth: 580, lineHeight: 1.8, letterSpacing: "0.03em", marginBottom: "3rem", padding: "0 1rem" }}
          >
            {eventInfo.motto}
          </motion.p>

          {/* CTAs */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 1 }}
            style={{ display: "flex", flexWrap: "wrap", gap: 16, justifyContent: "center" }}>
            <button onClick={handleCTA} style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "0.9rem 2.25rem", borderRadius: 999, background: "#FF6B00", color: "#fff", fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", border: "none", cursor: "pointer", boxShadow: "0 8px 24px rgba(255,107,0,0.3)" }}
              onMouseEnter={e => { e.currentTarget.style.background = "#111827"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.2)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "#FF6B00"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(255,107,0,0.3)"; e.currentTarget.style.transform = "none"; }}>
              Lihat Penampilan →
            </button>
            <a href="#about" style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "0.9rem 2.25rem", borderRadius: 999, background: "transparent", color: "#374151", fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", textDecoration: "none", border: "1.5px solid #E5E7EB" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "#FF6B00"; e.currentTarget.style.color = "#FF6B00"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "#E5E7EB"; e.currentTarget.style.color = "#374151"; }}>
              Tentang Acara
            </a>
          </motion.div>
          
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}
        style={{ position: "absolute", bottom: 32, left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: "0.3em", textTransform: "uppercase", color: "#9CA3AF" }}>Scroll</span>
        <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
          style={{ width: 1, height: 40, background: "linear-gradient(to bottom, #FF6B00, transparent)", borderRadius: 1 }} />
      </motion.div>
    </section>
  );
}
