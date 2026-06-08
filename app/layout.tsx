import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/ui/Toast";
import { AudioPlayer } from "@/components/AudioPlayer";

export const metadata: Metadata = {
  title: "E-Boutique — Groupe Genetics",
  description: "Découvrez la boutique de Groupe Genetics",
  icons: {
    icon: "/logo.jpeg",
    apple: "/logo.jpeg",
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
