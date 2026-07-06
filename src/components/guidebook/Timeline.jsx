import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { timeline } from "@/lib/guidebookContent";

function TimelineItem({ item, index }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const isLeft = index % 2 === 0;
  const isSpecial = item.event.includes("Time to Shine");

  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay: index * 0.08 }}
      style={{ display: "flex", alignItems: "center", position: "relative", gap: 0 }}
    >
      {/* Left card */}
      <div style={{ flex: 1, display: "flex", justifyContent: "flex-end", paddingRight: 40 }}>
        {isLeft && (
          <div style={{
            padding: "1.5rem 2rem", borderRadius: 18, border: "1.5px solid",
            borderColor: isSpecial ? "#FDDCBF" : "#E5E7EB",
            background: isSpecial ? "#FFF0E6" : "#fff",
            boxShadow: "0 2px 12px rgba(0,0,0,0.05)", maxWidth: 340, width: "100%",
            transition: "box-shadow 0.3s"
          }}>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: isSpecial ? "#FF6B00" : "#9CA3AF", marginBottom: 8 }}>{item.date}</div>
            <div style={{ fontFamily: "'Syne', sans-serif", fontSize: "clamp(16px,2vw,22px)", fontWeight: 800, color: isSpecial ? "#FF6B00" : "#111827", lineHeight: 1.3 }}>{item.event}</div>
          </div>
        )}
      </div>

      {/* Center dot */}
      <div style={{ position: "relative", zIndex: 10, flexShrink: 0 }}>
        <div style={{
          width: 18, height: 18, borderRadius: "50%", border: "2.5px solid",
          borderColor: isSpecial ? "#FF6B00" : "#D1D5DB",
          background: isSpecial ? "#FF6B00" : "#fff",
          boxShadow: isSpecial ? "0 0 16px rgba(255,107,0,0.4)" : "none"
        }} />
      </div>

      {/* Right card */}
      <div style={{ flex: 1, paddingLeft: 40 }}>
        {!isLeft && (
          <div style={{
            padding: "1.5rem 2rem", borderRadius: 18, border: "1.5px solid",
            borderColor: isSpecial ? "#FDDCBF" : "#E5E7EB",
            background: isSpecial ? "#FFF0E6" : "#fff",
            boxShadow: "0 2px 12px rgba(0,0,0,0.05)", maxWidth: 340, width: "100%"
          }}>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: isSpecial ? "#FF6B00" : "#9CA3AF", marginBottom: 8 }}>{item.date}</div>
            <div style={{ fontFamily: "'Syne', sans-serif", fontSize: "clamp(16px,2vw,22px)", fontWeight: 800, color: isSpecial ? "#FF6B00" : "#111827", lineHeight: 1.3 }}>{item.event}</div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function Timeline() {
  return (
    <section id="timeline" style={{ padding: "6rem 1.5rem", background: "transparent", borderTop: "1px solid rgba(0,0,0,0.05)" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          style={{ textAlign: "center", marginBottom: "5rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginBottom: 16 }}>
            <div style={{ width: 36, height: 1, background: "#FF6B00" }} />
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.25em", textTransform: "uppercase", color: "#FF6B00" }}>Bab 05</span>
            <div style={{ width: 36, height: 1, background: "#FF6B00" }} />
          </div>
          <h2 style={{ fontFamily: "'Bebas Neue', cursive", letterSpacing: "0.05em", color: "#111827", lineHeight: 0.9, fontSize: "clamp(44px, 7vw, 88px)" }}>
            KEJADIAN <span style={{ color: "#9CA3AF" }}>PENTING</span>
          </h2>
        </motion.div>

        {/* Timeline */}
        <div style={{ position: "relative" }}>
          {/* Vertical line */}
          <div style={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: 1, background: "linear-gradient(to bottom, transparent, #E5E7EB 10%, #E5E7EB 90%, transparent)", transform: "translateX(-50%)" }} />
          <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
            {timeline.map((item, i) => <TimelineItem key={i} item={item} index={i} />)}
          </div>
        </div>

        {/* Footer badge */}
        <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
          style={{ display: "flex", justifyContent: "center", marginTop: "5rem" }}>
          <div style={{ padding: "1rem 3rem", borderRadius: 999, background: "#111827", color: "#fff", fontFamily: "'Bebas Neue', cursive", fontSize: 20, letterSpacing: "0.2em", boxShadow: "0 8px 24px rgba(17,24,39,0.2)" }}>
            ✦ DRAMA ARENA 5101 ✦
          </div>
        </motion.div>
      </div>
    </section>
  );
}
