import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { performances } from "../data/content";

const rundown = [
  { no: 1, item: 'Visual "Semangat Al-Akhku"', type: "visual" },
  { no: 2, item: "Senandung Sholawat", type: "music" },
  { no: 3, item: 'Visual "Bayangkan jika kita tidak menyerah"', type: "visual" },
  { no: 4, item: 'Band 5101: "Lomba Sihir!"', type: "music" },
  { no: 5, item: "Visual Sapa MC", type: "visual" },
  { no: 6, item: "Master of Ceremony", type: "language" },
  { no: 7, item: "Tilawah Ayat Suci Al-Qur'an", type: "music" },
  { no: 8, item: "Sambutan Ketua", type: "language" },
  { no: 9, item: "Sambutan Bapak Pimpinan", type: "language" },
  { no: 10, item: "Udal Adul Well", type: "dance" },
  { no: 11, item: "SKA N DUT", type: "dance" },
  { no: 12, item: "Visual POV 3 = Mudabbir", type: "visual" },
  { no: 13, item: "Drama POV 3 = Mudabbir", type: "theater" },
  { no: 14, item: 'Puisi "Antara Uswah dan Amanah"', type: "theater" },
  { no: 15, item: 'Visual "Langkah Abadi"', type: "visual" },
  { no: 16, item: 'Band 5101: "Tangguh"', type: "music" },
  { no: 17, item: "Iklan Temukan Makna Bersama", type: "visual" },
  { no: 18, item: "Tari Ratoeh Jaroe", type: "dance" },
  { no: 19, item: 'Visual "Jati Diri Surgawi"', type: "visual" },
  { no: 20, item: 'Grand Opening: "OST DA 5101"', type: "music" },
  { no: 21, item: "Visual POV 1 = Bintang", type: "visual" },
  { no: 22, item: "Drama POV 1 = Bintang", type: "theater" },
  { no: 23, item: "Choir 5101", type: "music" },
  { no: 24, item: 'Nasyid 5101: "Syukur Alhamdulillah"', type: "music" },
  { no: 25, item: "Visual POV 2 = Azka", type: "visual" },
  { no: 26, item: "Drama POV 2 = Azka", type: "theater" },
  { no: 27, item: "Ya Maulay Ya Maulay", type: "dance" },
  { no: 28, item: "Black Mask Rhythm", type: "dance" },
  { no: 29, item: "Infinity Beatbox", type: "dance" },
  { no: 30, item: "Le Le Re Dance", type: "dance" },
  { no: 31, item: "Visual POV 4 = Atlan", type: "visual" },
  { no: 32, item: 'Band 5101: "Medley Tongkrongan"', type: "music" },
  { no: 33, item: "Drama POV 4 = Atlan", type: "theater" },
  { no: 34, item: "Raqs Arabian", type: "dance" },
  { no: 35, item: "Art of Balance", type: "dance" },
  { no: 36, item: "Hikaru Toki DA", type: "dance" },
  { no: 37, item: "Tong Basudara", type: "dance" },
  { no: 38, item: "Visual POV 5 = Pijar", type: "visual" },
  { no: 39, item: "Drama POV 5 = Pijar", type: "theater" },
  { no: 40, item: 'Grand Closing: "Api Perjuangan"', type: "music" },
];

const typeColors = {
  music: "#FF6B00",
  dance: "#e85d04",
  theater: "#cc4400",
  language: "#FF8C35",
  visual: "#555",
};

const typeLabels = {
  music: "Musik",
  dance: "Tari",
  theater: "Theater",
  language: "Bahasa",
  visual: "Visual",
};

export default function RundownSequence() {
  return (
    <section id="rundown" className="py-24 px-4" style={{ background: "#0A0A0A" }}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-center gap-4 mb-16"
        >
          <div className="w-10 h-10 flex items-center justify-center rounded text-sm font-bold" style={{ background: "#FF6B00", color: "#fff", fontFamily: "'Bebas Neue', cursive", fontSize: "16px" }}>06</div>
          <div>
            <div className="text-xs tracking-[0.3em] uppercase mb-1" style={{ color: "#FF6B00", fontFamily: "'Inter', sans-serif" }}>Section</div>
            <h2 className="text-4xl md:text-5xl font-bold" style={{ fontFamily: "'Bebas Neue', cursive", letterSpacing: "0.05em" }}>Susunan Acara</h2>
          </div>
          <div className="flex-1 h-px ml-4 hidden md:block" style={{ background: "linear-gradient(90deg, #FF6B00, transparent)" }} />
        </motion.div>

        {/* Legend */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="flex flex-wrap gap-3 mb-8"
        >
          {Object.entries(typeLabels).map(([k, v]) => (
            <div key={k} className="flex items-center gap-1.5 text-xs" style={{ fontFamily: "'Inter', sans-serif", color: "#888" }}>
              <span className="w-2 h-2 rounded-full" style={{ background: typeColors[k] }} />
              {v}
            </div>
          ))}
        </motion.div>

        {/* Rundown list */}
        <div className="space-y-2">
          {rundown.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.4, delay: (i % 10) * 0.03 }}
              className="flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200"
              style={{
                background: item.type === "visual" ? "transparent" : "#111",
                border: item.type === "visual" ? "1px solid #161616" : "1px solid #1f1f1f",
                opacity: item.type === "visual" ? 0.6 : 1,
              }}
              onMouseEnter={e => {
                if (item.type !== "visual") e.currentTarget.style.borderColor = typeColors[item.type];
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = item.type === "visual" ? "#161616" : "#1f1f1f";
              }}
            >
              <span
                className="w-7 h-7 flex-shrink-0 rounded-full flex items-center justify-center text-xs font-bold"
                style={{ background: `${typeColors[item.type]}20`, color: typeColors[item.type], fontFamily: "'Inter', sans-serif" }}
              >
                {String(item.no).padStart(2, "0")}
              </span>
              <span className="flex-1 text-sm" style={{ fontFamily: "'Inter', sans-serif", color: "#E8E8E8" }}>
                {item.item}
              </span>
              <span
                className="text-xs px-2 py-0.5 rounded-full hidden sm:block"
                style={{ background: `${typeColors[item.type]}15`, color: typeColors[item.type], fontFamily: "'Inter', sans-serif" }}
              >
                {typeLabels[item.type]}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
