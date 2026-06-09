"use client";
import { useState } from "react";
import Link from "next/link";
import { Phone, Mail, MapPin } from "lucide-react";
import { ContactModal } from "@/components/ContactModal";

export function Footer() {
  const [contactOpen, setContactOpen] = useState(false);

  return (
    <>
      <footer className="bg-gray-900 text-white/60 mt-8">
        <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* ── Genetics ─────────────────────────────────────────────── */}
          <div>
            <a
              href="https://www.groupegenetics.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-white tracking-widest uppercase text-sm mb-3 hover:text-amber-400 transition-colors inline-block"
            >
              Genetics
            </a>
            <p className="text-sm leading-relaxed">
              Accélérer l'innovation avec des équipes techniques de classe mondiale.
              Nous vous mettons en relation avec une équipe composée d'incroyables talents.
            </p>
            <p className="text-xs text-amber-400 mt-3 italic">Transform your business by the digital</p>
            <a
              href="https://www.groupegenetics.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-3 text-xs text-white/50 hover:text-white underline underline-offset-2 transition-colors"
            >
              www.groupegenetics.com ↗
            </a>
          </div>

          {/* ── Navigation ───────────────────────────────────────────── */}
          <div>
            <p className="font-bold text-white uppercase text-sm tracking-widest mb-3">Navigation</p>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="hover:text-amber-400 transition-colors">Accueil</Link></li>
              <li><Link href="/boutique" className="hover:text-amber-400 transition-colors">Boutique</Link></li>
              <li>
                <button onClick={() => setContactOpen(true)} className="hover:text-amber-400 transition-colors">
                  Contactez-nous
                </button>
              </li>
            </ul>
          </div>

          {/* ── Services IT ──────────────────────────────────────────── */}
          <div>
            <p className="font-bold text-white uppercase text-sm tracking-widest mb-3">Services IT</p>
            <ul className="space-y-2 text-sm">
              <li>Sécurité électronique</li>
              <li>Infrastructures et services managés</li>
              <li>Cloud computing</li>
              <li>Conseils stratégiques</li>
            </ul>
          </div>

          {/* ── Contact ──────────────────────────────────────────────── */}
          <div>
            <p className="font-bold text-white uppercase text-sm tracking-widest mb-3">Contactez-nous</p>
            <div className="space-y-4 text-sm">
              <div>
                <p className="text-amber-400 font-semibold text-xs uppercase tracking-wider mb-1.5">Bureau Sénégal</p>
                <p className="flex items-start gap-2">
                  <MapPin size={14} className="mt-0.5 flex-shrink-0" /> Zac Mbao, Rond-Point SIPRES, Dakar, Sénégal
                </p>
                <p className="flex items-center gap-2 mt-1.5">
                  <Phone size={14} className="flex-shrink-0" /> +221 78 879 00 00
                </p>
                <p className="flex items-center gap-2 mt-1">
                  <Phone size={14} className="flex-shrink-0" /> +221 78 879 09 09
                </p>
              </div>
<p className="flex items-center gap-2">
                <Mail size={14} className="flex-shrink-0" /> market@groupegenetics.com
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 py-5 text-center text-xs">
          <p className="font-bold text-white tracking-widest uppercase">E-BOUTIQUE GROUPE GENETICS</p>
          <p className="mt-1">© 2026 — Tous droits réservés</p>
        </div>
      </footer>

      <ContactModal open={contactOpen} onClose={() => setContactOpen(false)} />
    </>
  );
}
