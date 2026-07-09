import { useState, useRef, useEffect } from "react";
import { useInView } from "framer-motion";
import LoadingScreen from "@/components/guidebook/LoadingScreen";
import Navbar from "@/components/guidebook/Navbar";
import Hero from "@/components/guidebook/Hero";
import About from "@/components/guidebook/About";
import Categories from "@/components/guidebook/Categories";
import Performances from "@/components/guidebook/Performances";
import RundownSequence from "@/components/guidebook/RundownSequence";
import Timeline from "@/components/guidebook/Timeline";
import Judges from "@/components/guidebook/Judges";
import Sponsors from "@/components/guidebook/Sponsors";
import { Ticker, Footer } from "@/components/guidebook/Footer";
import Hero3DModel from "@/components/ui/Hero3DModel";
import { use3DStore } from "@/store/use3DStore";
import StorytellingIntro from "@/components/guidebook/StorytellingIntro";

function SectionWatcher({ name, children }) {
  const ref = useRef(null);
  const inView = useInView(ref, { margin: "-40% 0px -40% 0px" });
  const setSection = use3DStore((state) => state.setCurrentSection);

  useEffect(() => {
    if (inView && name !== 'philosophy') {
      setSection(name);
    }
  }, [inView, name, setSection]);

  return <div ref={ref}>{children}</div>;
}

export default function GuidebookTheme({
  user, isActivated, settings, logoSrc, visibleFeatures, handleCTA, router
}) {
  const [loaded, setLoaded] = useState(false);
  const introCompleted = use3DStore((state) => state.introCompleted);
  const setIntroCompleted = use3DStore((state) => state.setIntroCompleted);
  const [showIntro, setShowIntro] = useState(!introCompleted);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isCompleted = sessionStorage.getItem('da5101_intro_completed') === 'true';
      if (isCompleted && !introCompleted) {
        setIntroCompleted(true);
        setShowIntro(false);
      }
    }
  }, [introCompleted, setIntroCompleted]);

  const handleIntroComplete = () => {
    setIntroCompleted(true);
    setShowIntro(false);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('da5101_intro_completed', 'true');
    }
  };

  const handleReplayIntro = () => {
    setIntroCompleted(false);
    setShowIntro(true);
  };

  if (showIntro) {
    return <StorytellingIntro onComplete={handleIntroComplete} />;
  }

  return (
    <div style={{ minHeight: "100vh", background: "transparent", color: "#111827", fontFamily: "'Plus Jakarta Sans', sans-serif", position: "relative" }}>
      {/* 3D Background */}
      {loaded && <Hero3DModel animateOnMount={true} />}
      
      <LoadingScreen onDone={() => setLoaded(true)} />
      {loaded && (
        <div style={{ position: "relative", zIndex: 10 }}>
          <Navbar onReplayIntro={handleReplayIntro} />
          
          <SectionWatcher name="hero"><Hero handleCTA={handleCTA} /></SectionWatcher>
          <Ticker />
          
          <SectionWatcher name="about"><About /></SectionWatcher>
          
          <SectionWatcher name="categories"><Categories /></SectionWatcher>
          <SectionWatcher name="performances"><Performances /></SectionWatcher>
          <Ticker />
          
          <SectionWatcher name="judges">
             <RundownSequence />
             <Timeline />
             <Judges />
          </SectionWatcher>
          
          <SectionWatcher name="sponsors"><Sponsors /></SectionWatcher>
          
          <SectionWatcher name="footer"><Footer /></SectionWatcher>
        </div>
      )}
    </div>
  );
}
