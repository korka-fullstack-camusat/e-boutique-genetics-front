import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/ui/Toast";

export const metadata: Metadata = {
  title: "E-Boutique — Groupe Genetics",
  description: "Découvrez la boutique de Groupe Genetics",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="antialiased">
        {children}
        <ToastProvider />
      </body>
    </html>
  );
}
