import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { SettingsProvider } from "@/contexts/SettingsContext";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata = {
  title: "Drama Arena 5101 — Digital Souvenir",
  description: "Koleksi Digital Eksklusif Pentas Seni Drama Arena 5101. Video penampilan, galeri foto, komik digital, soundtrack, dan konten bonus eksklusif.",
  keywords: "Drama Arena 5101, Pentas Seni, Digital Souvenir, Koleksi Digital, Darussalam",
  openGraph: {
    title: "Drama Arena 5101 — Digital Souvenir",
    description: "Koleksi Digital Eksklusif Pentas Seni Drama Arena 5101",
    type: "website",
  },
};

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
            {children}
          </AuthProvider>
        </SettingsProvider>
      </body>
    </html>
  );
}
