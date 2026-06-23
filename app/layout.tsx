import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/ui/Toast";
import { AudioPlayer } from "@/components/AudioPlayer";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.genetics-market.com"),
  title: "E-Boutique — Groupe Genetics",
  description: "Découvrez la boutique de Groupe Genetics",
  icons: {
    icon: [{ url: "/logo.jpeg", type: "image/jpeg" }],
    apple: [{ url: "/logo.jpeg", type: "image/jpeg" }],
  },
  openGraph: {
    title: "E-Boutique — Groupe Genetics",
    description: "Découvrez la boutique de Groupe Genetics",
    url: "https://www.genetics-market.com",
    siteName: "E-Boutique — Groupe Genetics",
    images: [{ url: "/logo.jpeg", width: 1080, height: 1080 }],
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "E-Boutique — Groupe Genetics",
    description: "Découvrez la boutique de Groupe Genetics",
    images: ["/logo.jpeg"],
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
