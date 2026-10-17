import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/ui/Toast";
import { AudioPlayer } from "@/components/AudioPlayer";

export const metadata: Metadata = {
  metadataBase: new URL("https://genetics-market.com"),
  title: "E-Boutique — Groupe Genetics",
  description: "Découvrez la boutique de Groupe Genetics",
  openGraph: {
    title: "E-Boutique — Groupe Genetics",
    description: "Découvrez la boutique de Groupe Genetics",
    url: "https://genetics-market.com",
    siteName: "E-Boutique — Groupe Genetics",
    // Image carrée : affichée en vignette à côté du lien (WhatsApp, Messenger, LinkedIn…)
    images: [{
      url: "/og-image.jpg",
      width: 1200,
      height: 1200,
      type: "image/jpeg",
      alt: "Logo Genetics — Transform your business by the digital",
    }],
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "E-Boutique — Groupe Genetics",
    description: "Découvrez la boutique de Groupe Genetics",
    images: ["/og-image.jpg"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="antialiased">
        {children}
        <AudioPlayer />
        <ToastProvider />
      </body>
    </html>
  );
}
