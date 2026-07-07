import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const rundown = [
  { no: 1,  item: 'Visual "Semangat Al-Akhku"',                   type: "visual" },
  { no: 2,  item: "Senandung Sholawat",                            type: "music" },
  { no: 3,  item: 'Visual "Bayangkan jika kita tidak menyerah"',  type: "visual" },
  { no: 4,  item: 'Band 5101: "Lomba Sihir!"',                    type: "music" },
  { no: 5,  item: "Visual Sapa MC",                               type: "visual" },
  { no: 6,  item: "Master of Ceremony",                           type: "language" },
  { no: 7,  item: "Tilawah Ayat Suci Al-Qur'an",                  type: "music" },
  { no: 8,  item: "Sambutan Ketua",                               type: "language" },
  { no: 9,  item: "Sambutan Bapak Pimpinan",                      type: "language" },
  { no: 10, item: "Udal Adul Well",                               type: "dance" },
  { no: 11, item: "SKA N DUT",                                    type: "dance" },
  { no: 12, item: "Visual POV 3 = Mudabbir",                      type: "visual" },
  { no: 13, item: "Drama POV 3 = Mudabbir",                       type: "theater" },
  { no: 14, item: 'Puisi "Antara Uswah dan Amanah"',              type: "theater" },
  { no: 15, item: 'Visual "Langkah Abadi"',                       type: "visual" },
  { no: 16, item: 'Band 5101: "Tangguh"',                         type: "music" },
  { no: 17, item: "Iklan Temukan Makna Bersama",                  type: "visual" },
  { no: 18, item: "Tari Ratoeh Jaroe",                            type: "dance" },
  { no: 19, item: 'Visual "Jati Diri Surgawi"',                   type: "visual" },
  { no: 20, item: 'Grand Opening: "OST DA 5101"',                 type: "music" },
  { no: 21, item: "Visual POV 1 = Bintang",                       type: "visual" },
  { no: 22, item: "Drama POV 1 = Bintang",                        type: "theater" },
  { no: 23, item: "Choir 5101",                                   type: "music" },
  { no: 24, item: 'Nasyid 5101: "Syukur Alhamdulillah"',         type: "music" },
  { no: 25, item: "Visual POV 2 = Azka",                          type: "visual" },
  { no: 26, item: "Drama POV 2 = Azka",                           type: "theater" },
  { no: 27, item: "Ya Maulay Ya Maulay",                          type: "dance" },
  { no: 28, item: "Black Mask Rhythm",                            type: "dance" },
  { no: 29, item: "Infinity Beatbox",                             type: "dance" },
  { no: 30, item: "Le Le Re Dance",                               type: "dance" },
  { no: 31, item: "Visual POV 4 = Atlan",                         type: "visual" },
  { no: 32, item: 'Band 5101: "Medley Tongkrongan"',             type: "music" },
  { no: 33, item: "Drama POV 4 = Atlan",                          type: "theater" },
  { no: 34, item: "Raqs Arabian",                                 type: "dance" },
  { no: 35, item: "Art of Balance",                               type: "dance" },
  { no: 36, item: "Hikaru Toki DA",                               type: "dance" },
  { no: 37, item: "Tong Basudara",                                type: "dance" },
  { no: 38, item: "Visual POV 5 = Pijar",                         type: "visual" },
  { no: 39, item: "Drama POV 5 = Pijar",                          type: "theater" },
  { no: 40, item: 'Grand Closing: "Api Perjuangan"',              type: "music" },
];

const TYPE = {
  music:    { color: "#FF6B00", bg: "#FFF0E6", label: "Musik" },
  dance:    { color: "#EA580C", bg: "#FFF3ED", label: "Tari" },
  theater:  { color: "#DC2626", bg: "#FFF1F2", label: "Theater" },
  language: { color: "#D97706", bg: "#FFFBEB", label: "Bahasa" },
  visual:   { color: "#9CA3AF", bg: "#F9FAFB", label: "Visual" },
};

function Row({ item, index }) {
  const ref = useRef(null);
  const inView = useInView(ref, { margin: "-10% 0px -10% 0px" });
  const t = TYPE[item.type];
  const isVisual = item.type === "visual";

  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, x: -16 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.5, delay: (index % 12) * 0.04 }}
      style={{
        display: "flex", alignItems: "center", gap: 16, padding: "1rem 1.25rem",
        borderRadius: 14, border: "1px solid",
        borderColor: isVisual ? "transparent" : "#E5E7EB",
        background: isVisual ? "transparent" : "#fff",
        transition: "box-shadow 0.2s, border-color 0.2s"
      }}
      onMouseEnter={e => { if (!isVisual) { e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.07)"; e.currentTarget.style.borderColor = "#D1D5DB"; } }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.borderColor = isVisual ? "transparent" : "#E5E7EB"; }}
    >
      {/* Number badge */}
      <div style={{
        width: 44, height: 44, borderRadius: 12, flexShrink: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: t.bg, fontFamily: "'Inter', sans-serif",
        fontSize: 13, fontWeight: 800, color: t.color, letterSpacing: "0.05em"
      }}>
        {String(item.no).padStart(2, "0")}
      </div>

      {/* Name */}
      <div style={{ flex: 1, fontFamily: "'Inter', sans-serif", fontSize: 14, fontWeight: isVisual ? 400 : 600, color: isVisual ? "#9CA3AF" : "#1F2937", fontStyle: isVisual ? "italic" : "normal", lineHeight: 1.5 }}>
        {item.item}
      </div>

      {/* Type badge */}
      <span style={{
        display: "none", padding: "4px 14px", borderRadius: 999,
        fontFamily: "'Inter', sans-serif", fontSize: 10, fontWeight: 700,
        letterSpacing: "0.15em", textTransform: "uppercase",
        background: t.bg, color: t.color, flexShrink: 0
      }} className="show-sm">
        {t.label}
      </span>
    </motion.div>
  );
}

export default function RundownSequence() {
  return (
    <section id="rundown" style={{ padding: "6rem 1.5rem", background: "#F9FAFB", borderTop: "1px solid #F3F4F6" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ margin: "-10% 0px -10% 0px" }}
          style={{ marginBottom: "4rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <div style={{ width: 36, height: 1, background: "#FF6B00" }} />
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.25em", textTransform: "uppercase", color: "#FF6B00" }}>Bab 07</span>
          </div>
          <h2 style={{ fontFamily: "'Bebas Neue', cursive", letterSpacing: "0.05em", color: "#111827", lineHeight: 0.9, fontSize: "clamp(44px, 7vw, 88px)" }}>
            SUSUNAN <span style={{ color: "#9CA3AF" }}>ACARA</span>
          </h2>
        </motion.div>

        {/* Legend */}
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ margin: "-10% 0px -10% 0px" }}
          style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: "2rem" }}>
          {Object.entries(TYPE).map(([k, v]) => (
            <div key={k} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 16px", borderRadius: 999, background: v.bg, fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 700, color: v.color }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: v.color }} />
              {v.label}
            </div>
          ))}
        </motion.div>

        {/* List */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {rundown.map((item, i) => <Row key={i} item={item} index={i} />)}
        </div>
      </div>
    </section>
  );
}
