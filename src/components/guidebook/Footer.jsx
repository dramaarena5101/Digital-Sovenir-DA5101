import { motion } from "framer-motion";
import { eventInfo } from "@/lib/guidebookContent";
import Marquee from "./MagicUI/Marquee";

export function Ticker() {
  const items = [
    "DRAMA ARENA 5101", "✦ NYALAKAN API KEBERSAMAAN ✦", "FIVE A HUNDRED ONE",
    "IT'S TIME TO SHINE", "GONTOR", "KAMI KELAS 5", "DRAMA ARENA 5101",
    "WUJUDKAN IDEALISME KEHIDUPAN", "DRAMA ARENA 5101"
  ];

  return (
    <div style={{ padding: "2rem 0", background: "transparent", borderTop: "1px solid rgba(0,0,0,0.05)", borderBottom: "1px solid rgba(0,0,0,0.05)", overflow: "hidden" }}>
      <Marquee pauseOnHover className="[--duration:35s] [--gap:2.5rem]">
        {items.map((item, i) => (
          <span key={i} style={{
            fontFamily: "'Bebas Neue', cursive", fontSize: "clamp(32px, 5vw, 56px)",
            fontWeight: 700, letterSpacing: "0.08em", color: "#FF6B00",
            opacity: 0.15, transition: "opacity 0.3s", cursor: "default",
            marginRight: "3rem"
          }}
            onMouseEnter={e => e.target.style.opacity = "1"}
            onMouseLeave={e => e.target.style.opacity = "0.15"}
          >
            {item}
          </span>
        ))}
      </Marquee>
    </div>
  );
}

export function Footer() {
  return (
    <footer style={{ background: "transparent", borderTop: "1px solid rgba(0,0,0,0.05)", padding: "5rem 1.5rem 3rem" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>

        {/* Top grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "3rem", marginBottom: "4rem" }}>

          {/* Brand */}
          <div style={{ gridColumn: "span 1" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: "#fff", border: "1.5px solid #E5E7EB", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Bebas Neue', cursive", fontSize: 20, color: "#111827", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}><div style={{ width: 40, height: 40, borderRadius: 10, border: "1.5px solid #FDDCBF", background: "#FFF0E6", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0 }}>
                <img src="/logo.png" alt="DA" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => { e.target.style.display = "none"; e.target.parentElement.innerHTML = `<span style="font-family:'Bebas Neue',cursive;font-size:16px;color:#FF6B00">DA</span>`; }} />
              </div></div>
              <div>
                <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 22, letterSpacing: "0.05em", color: "#111827", lineHeight: 1 }}>DRAMA ARENA 5101</div>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "#FF6B00" }}>Digital Guidebook</div>
              </div>
            </div>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: "#6B7280", lineHeight: 1.8, maxWidth: 320 }}>
              Pagelaran Seni Siswa Kelas 5 KMI Pondok Modern Darussalam Gontor, mengangkat tema{" "}
              <em style={{ color: "#374151", fontWeight: 600 }}>"Nyalakan Api Kebersamaan, Wujudkan Idealisme Kehidupan"</em>.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.25em", textTransform: "uppercase", color: "#9CA3AF", marginBottom: 20 }}>Navigasi</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {["Home", "About", "Categories", "Performances", "Timeline", "Judges"].map(item => (
                <a key={item} href={`#${item.toLowerCase()}`} style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, fontWeight: 600, color: "#6B7280", textDecoration: "none", transition: "color 0.2s" }}
                  onMouseEnter={e => e.target.style.color = "#FF6B00"}
                  onMouseLeave={e => e.target.style.color = "#6B7280"}>
                  {item}
                </a>
              ))}
            </div>
          </div>

          {/* Info */}
          <div>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.25em", textTransform: "uppercase", color: "#9CA3AF", marginBottom: 20 }}>Informasi</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "#9CA3AF", marginBottom: 6 }}>Lokasi</div>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: "#374151", fontWeight: 500, lineHeight: 1.6 }}>{eventInfo.venue}</p>
              </div>
              <div>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "#9CA3AF", marginBottom: 6 }}>Waktu</div>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: "#374151", fontWeight: 500, lineHeight: 1.6 }}>{eventInfo.date}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{ paddingTop: "2rem", borderTop: "1px solid #E5E7EB", display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#9CA3AF", fontWeight: 600, letterSpacing: "0.05em" }}>
            © 2026 Drama Arena 5101. All rights reserved.
          </p>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#9CA3AF", fontWeight: 600, letterSpacing: "0.05em" }}>
            Powered by <span style={{ color: "#374151" }}>Panitia Drama Arena 5101</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
