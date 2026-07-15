import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function LoadingScreen({ onDone }) {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState(0); // 0=counting, 1=logo reveal, 2=exit

  useEffect(() => {
    // Count up to 100
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 101) {
          clearInterval(interval);
          setTimeout(() => setPhase(1), 200);
          return 101;
        }
        return p + Math.random() * 6 + 2;
      });
    }, 60);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (phase === 1) {
      setTimeout(() => {
        setPhase(2);
        setTimeout(onDone, 800);
      }, 1400);
    }
  }, [phase, onDone]);

  return (
    <AnimatePresence>
      {phase < 2 && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: "easeInOut" }}
          style={{
            position: "fixed", inset: 0, zIndex: 9999,
            background: "#fff", display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", overflow: "hidden"
          }}
        >
          {/* Background orange accent circles */}
          <div style={{ position: "absolute", top: -120, right: -120, width: 400, height: 400, borderRadius: "50%", background: "rgba(255,107,0,0.06)" }} />
          <div style={{ position: "absolute", bottom: -80, left: -80, width: 300, height: 300, borderRadius: "50%", background: "rgba(255,107,0,0.04)" }} />

          <AnimatePresence mode="wait">
            {phase === 0 && (
              <motion.div key="counter"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4 }}
                style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 32 }}
              >
                {/* Animated ring */}
                <div style={{ position: "relative", width: 100, height: 100 }}>
                  <svg width="100" height="100" style={{ transform: "rotate(-90deg)" }}>
                    <circle cx="50" cy="50" r="44" fill="none" stroke="#F3F4F6" strokeWidth="4" />
                    <motion.circle
                      cx="50" cy="50" r="44" fill="none" stroke="#FF6B00" strokeWidth="4"
                      strokeLinecap="round"
                      strokeDasharray={276.46}
                      animate={{ strokeDashoffset: 276.46 * (1 - Math.min(progress, 101) / 101) }}
                      transition={{ duration: 0.1 }}
                    />
                  </svg>
                  <div style={{
                    position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
                    fontFamily: "'Bebas Neue', cursive", fontSize: 36, color: "#111827", gap: 6, fontWeight: 700
                  }}>
                    <span style={{ color: "#FF6B00" }}>5</span>
                    <span>{Math.min(Math.round(progress), 101)}</span>
                  </div>
                </div>

                <div style={{ textAlign: "center" }}>
                  <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "clamp(32px,6vw,56px)", letterSpacing: "0.1em", color: "#111827", lineHeight: 1 }}>
                    DRAMA ARENA
                  </div>
                  <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "clamp(16px,3vw,24px)", letterSpacing: "0.35em", color: "#FF6B00", marginTop: 4 }}>
                    FIVE A HUNDRED ONE
                  </div>
                </div>

                {/* Progress bar */}
                <div style={{ width: 200, height: 2, background: "#F3F4F6", borderRadius: 999, overflow: "hidden" }}>
                  <motion.div
                    animate={{ width: `${Math.min(progress, 101) / 101 * 100}%` }}
                    transition={{ duration: 0.15 }}
                    style={{ height: "100%", background: "#FF6B00", borderRadius: 999 }}
                  />
                </div>

                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.3em", textTransform: "uppercase", color: "#9CA3AF" }}>
                  Loading...
                </div>
              </motion.div>
            )}

            {phase === 1 && (
              <motion.div key="logo"
                initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.15 }}
                transition={{ duration: 0.5, type: "spring", damping: 18 }}
                style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  style={{ width: 140, height: 140, borderRadius: 28, overflow: "hidden", border: "2px solid #FDDCBF", background: "#FFF0E6", boxShadow: "0 20px 60px rgba(255,107,0,0.2)" }}
                >
                  <img src="/logo.png" alt="Drama Arena 5101" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </motion.div>

                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} style={{ textAlign: "center" }}>
                  <div style={{ fontFamily: "var(--font-wondra)", fontSize: "clamp(40px,7vw,70px)", fontWeight: 700, letterSpacing: "0.02em", color: "#111827", lineHeight: 1 }}>DRAMA ARENA</div>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "clamp(12px,2vw,16px)", fontWeight: 600, letterSpacing: "0.2em", color: "#FF6B00", marginTop: 8 }}>5101 · IT'S TIME TO SHINE</div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
