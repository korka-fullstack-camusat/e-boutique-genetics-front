import Image from "next/image";
import { Wrench } from "lucide-react";

/** Écran affiché à la place des pages publiques quand le mode maintenance est actif. */
export function MaintenanceScreen({ message }: { message: string }) {
  return (
    <main className="min-h-screen bg-gray-900 flex items-center justify-center px-6 py-16">
      <div className="max-w-lg text-center">
        <div className="w-20 h-20 rounded-full bg-white mx-auto mb-6 overflow-hidden border-4 border-amber-500/40">
          <Image src="/logo.jpeg" alt="Groupe Genetics" width={80} height={80} className="object-contain w-full h-full" priority />
        </div>
        <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-400 bg-amber-400/10 px-3 py-1.5 rounded-full">
          <Wrench size={14} /> Maintenance en cours
        </span>
        <h1 className="mt-5 text-2xl sm:text-3xl font-black text-white leading-snug">
          E-Boutique <span className="text-amber-400">Groupe Genetics</span>
        </h1>
        <p className="mt-4 text-white/70 text-base leading-relaxed whitespace-pre-line">{message}</p>
        <p className="mt-8 text-sm text-white/40">
          Une question ? Écrivez-nous à{" "}
          <a href="mailto:market@groupegenetics.com" className="text-amber-400 hover:underline">market@groupegenetics.com</a>
        </p>
      </div>
    </main>
  );
}
