import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { SettingsProvider } from "@/contexts/SettingsContext";
import { DialogProvider } from "@/contexts/DialogContext";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getDirectImageUrl } from "@/lib/utils";

export async function generateMetadata() {
  let settings = {};
  try {
    const docSnap = await getDoc(doc(db, "settings", "general"));
    if (docSnap.exists()) {
      settings = docSnap.data();
    }
  } catch (e) {
    console.error("Error fetching settings for metadata:", e);
  }

  const title = "Drama Arena 5101 — Digital Souvenir";
  const description = "Koleksi Digital Eksklusif Pentas Seni Drama Arena 5101. Video penampilan, galeri foto, komik digital, soundtrack, dan konten bonus eksklusif.";
  const iconUrl = settings.faviconUrl ? getDirectImageUrl(settings.faviconUrl) : "/favicon.ico";
  const ogImageUrl = settings.logoUrl 
    ? getDirectImageUrl(settings.logoUrl) 
    : (settings.heroImageUrl ? getDirectImageUrl(settings.heroImageUrl) : null);

  return {
    title,
    description,
    keywords: "Drama Arena 5101, Pentas Seni, Digital Souvenir, Koleksi Digital, Darussalam",
    icons: {
      icon: iconUrl,
      shortcut: iconUrl,
      apple: iconUrl,
    },
    openGraph: {
      title,
      description,
      type: "website",
      images: ogImageUrl ? [{ url: ogImageUrl }] : [],
    },
  };
}

export default function RootLayout({ children }) {
  return (
    <html lang="id" className={`${inter.variable} h-full antialiased`}>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col" style={{ fontFamily: 'var(--font-body)' }}>
        <SettingsProvider>
          <AuthProvider>
            <DialogProvider>
              {children}
            </DialogProvider>
          </AuthProvider>
        </SettingsProvider>
      </body>
    </html>
  );
}
