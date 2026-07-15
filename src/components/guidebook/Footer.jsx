import { motion } from "framer-motion";
import { eventInfo } from "@/lib/guidebookContent";
import Marquee from "./MagicUI/Marquee";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, Environment } from "@react-three/drei";
import * as THREE from 'three';
import { useRef, useMemo } from "react";

function FooterStageModel() {
  const { scene } = useGLTF("/models/theatre_stage.glb");
  const ref = useRef();

  const normalizedScene = useMemo(() => {
    const cloned = scene.clone();
    let box = new THREE.Box3().setFromObject(cloned);
    let size = box.getSize(new THREE.Vector3()).length();

    // --- SETUP UKURAN MODEL 3D ---
    // Ubah angka '48' di bawah ini untuk mengatur seberapa besar model 3D-nya.
    // Semakin besar angkanya, semakin besar model tersebut. (Sebelumnya: 30)
    const targetSize = 40;
    const scaleFactor = targetSize / size;
    cloned.scale.set(scaleFactor, scaleFactor, scaleFactor);

    box = new THREE.Box3().setFromObject(cloned);
    const center = box.getCenter(new THREE.Vector3());

    // --- SETUP POSISI DASAR (OFFSET X, Y, Z) ---
    // cloned.position.x = geser ke kanan/kiri (angka positif ke kanan, negatif ke kiri)
    // cloned.position.y = geser naik/turun dasar model
    cloned.position.x = -center.x + 15; // Shift to right so it balances text
    cloned.position.y = -center.y - 15;
    cloned.position.z = -center.z;

    return cloned;
  }, [scene]);

  useFrame((state) => {
    if (ref.current) {
      // Rotasi utama menghadap depan (disesuaikan berdasarkan orientasi asli file) + sedikit ayunan
      ref.current.rotation.y = -Math.PI / 2 + Math.sin(state.clock.elapsedTime * 0.2) * 0.05;

      // --- SETUP TINGGI MODEL (POSISI AKHIR SAAT MUNCUL) ---
      // Nilai targetY menentukan seberapa tinggi model akan naik dari bawah.
      // Untuk membuat kubah berada di perbatasan footer dan sponsor, naikkan nilai ini.
      // Semakin besar positif (+), model akan semakin naik.
      // Sebelumnya: 0. Sekarang: 15 (bisa diubah sesuai keinginan misal 10, 20, 25).
      const targetY = 15;
      ref.current.position.y += (targetY - ref.current.position.y) * 0.05;
    }
  });

  return (
    // position={[0, -30, 0]} adalah posisi Y awal sebelum model melayang naik (animasi)
    <group ref={ref} position={[0, -30, 0]}>
      <primitive object={normalizedScene} />
    </group>
  );
}

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
    <footer style={{ position: "relative", background: "var(--surface-dark, #0f172a)", color: "#fff", borderTop: "1px solid rgba(255,255,255,0.05)", padding: "5rem 1.5rem 3rem" }}>

      {/* 3D Background - Overshooting the top to bleed into previous section */}
      {/* --- SETUP AREA OVERLAP (MENEMBUS KE SECTION SPONSOR) --- */}
      {/* Ubah nilai "top" di bawah ini (-350) untuk mengatur seberapa jauh kanvas 3D menembus ke atas. */}
      {/* Jika kubah kurang naik/terpotong di atas, buat angkanya lebih negatif (misal -400). */}
      {/* (Sebelumnya: -250) */}
      <div style={{ position: "absolute", top: -350, left: 0, right: 0, bottom: 0, zIndex: 0, opacity: 0.9, pointerEvents: "none" }}>
        <Canvas camera={{ position: [0, 15, 55], fov: 45 }}>
          <ambientLight intensity={0.6} />
          <directionalLight position={[15, 25, 10]} intensity={1.5} />
          <pointLight position={[-2, -2, 2]} color="#ffa500" intensity={60} distance={15} />
          <FooterStageModel />
          <Environment preset="city" />
        </Canvas>

        {/* Gradient mask to blend with footer edges */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 150, background: "linear-gradient(to top, var(--surface-dark, #0f172a), transparent)" }} />
        <div style={{ position: "absolute", top: 350, left: 0, right: 0, height: 150, background: "linear-gradient(to bottom, var(--surface-dark, #0f172a), transparent)" }} />
        <div style={{ position: "absolute", top: 0, left: 0, bottom: 0, width: '40%', background: "linear-gradient(to right, var(--surface-dark, #0f172a), transparent)" }} />
      </div>

      <div style={{ position: "relative", zIndex: 10, maxWidth: 1280, margin: "0 auto" }}>

        {/* Top grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "3rem", marginBottom: "4rem" }}>

          {/* Brand */}
          <div style={{ gridColumn: "span 1" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: "#fff", border: "1.5px solid #E5E7EB", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Bebas Neue', cursive", fontSize: 20, color: "#111827", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}><div style={{ width: 40, height: 40, borderRadius: 10, border: "1.5px solid #FDDCBF", background: "#FFF0E6", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0 }}>
                <img src="/logo.png" alt="DA" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => { e.target.style.display = "none"; e.target.parentElement.innerHTML = `<span style="font-family:'Bebas Neue',cursive;font-size:16px;color:#FF6B00">DA</span>`; }} />
              </div></div>
              <div>
                <div style={{ fontFamily: "var(--font-wondra)", fontSize: 26, fontWeight: 700, letterSpacing: "0.02em", color: "#fff", lineHeight: 1 }}>DRAMA ARENA 5101</div>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "#FF6B00", marginTop: 4 }}>Digital Guidebook</div>
              </div>
            </div>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: "#9CA3AF", lineHeight: 1.8, maxWidth: 320 }}>
              Pagelaran Seni Siswa Kelas 5 KMI Pondok Modern Darussalam Gontor, mengangkat tema{" "}
              <em style={{ color: "#E5E7EB", fontWeight: 600 }}>"Nyalakan Api Kebersamaan, Wujudkan Idealisme Kehidupan"</em>.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.25em", textTransform: "uppercase", color: "#9CA3AF", marginBottom: 20 }}>Navigasi</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {["Home", "About", "Categories", "Performances", "Timeline", "Judges"].map(item => (
                <a key={item} href={`#${item.toLowerCase()}`} style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, fontWeight: 600, color: "#9CA3AF", textDecoration: "none", transition: "color 0.2s" }}
                  onMouseEnter={e => e.target.style.color = "#FF6B00"}
                  onMouseLeave={e => e.target.style.color = "#9CA3AF"}>
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
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: "#D1D5DB", fontWeight: 500, lineHeight: 1.6 }}>{eventInfo.venue}</p>
              </div>
              <div>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "#9CA3AF", marginBottom: 6 }}>Waktu</div>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: "#D1D5DB", fontWeight: 500, lineHeight: 1.6 }}>{eventInfo.date}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{ paddingTop: "2rem", borderTop: "1px solid rgba(255,255,255,0.1)", display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#6B7280", fontWeight: 600, letterSpacing: "0.05em" }}>
            © 2026 Drama Arena 5101. All rights reserved.
          </p>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#6B7280", fontWeight: 600, letterSpacing: "0.05em" }}>
            Powered by <span style={{ color: "#9CA3AF" }}>Panitia Drama Arena 5101</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
