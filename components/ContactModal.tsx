"use client";
import { useState } from "react";
import { X, Phone, Mail, MapPin, FileText, CheckCircle, Loader2 } from "lucide-react";
import { contactApi } from "@/lib/api";
import toast from "react-hot-toast";

interface Props {
  open: boolean;
  onClose: () => void;
}

const SERVICES = [
  "Vidéosurveillance",
  "Contrôle d'Accès/Anti-intrusion",
  "Câblage informatique",
  "Énergie",
  "Ordinateurs/Serveurs",
  "Connectivité/Sécurité",
  "Téléphonie/Visioconférence",
  "Accessoires et Périphériques",
  "Autre",
];

const EMPTY_FORM = { name: "", email: "", phone: "", service: "", description: "" };

export function ContactModal({ open, onClose }: Props) {
  const [tab, setTab]       = useState<"contact" | "devis">("contact");
  const [form, setForm]     = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [sent, setSent]     = useState(false);

  if (!open) return null;

  function handleClose() {
    onClose();
    // reset après fermeture
    setTimeout(() => { setTab("contact"); setForm(EMPTY_FORM); setSent(false); }, 300);
  }

  function set(field: keyof typeof EMPTY_FORM, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.email || !form.service || !form.description) {
      toast.error("Veuillez remplir tous les champs obligatoires.");
      return;
    }
    setLoading(true);
    try {
      await contactApi.devis({
        name:        form.name,
        email:       form.email,
        phone:       form.phone || undefined,
        service:     form.service,
        description: form.description,
      });
      setSent(true);
    } catch {
      toast.error("Erreur lors de l'envoi. Réessayez.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-in flex flex-col max-h-[90vh]">

        {/* ── Header ─────────────────────────────────────────────────── */}
        <div className="px-6 py-4 border-b flex items-center justify-between flex-shrink-0">
          <h2 className="text-lg font-bold text-gray-900">Groupe Genetics</h2>
          <button onClick={handleClose} className="p-1.5 rounded-full hover:bg-gray-100 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* ── Tabs ───────────────────────────────────────────────────── */}
        <div className="flex border-b flex-shrink-0">
          <button
            onClick={() => setTab("contact")}
            className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${
              tab === "contact"
                ? "text-amber-600 border-b-2 border-amber-500"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            Informations de contact
          </button>
          <button
            onClick={() => setTab("devis")}
            className={`flex-1 py-2.5 text-sm font-semibold transition-colors flex items-center justify-center gap-1.5 ${
              tab === "devis"
                ? "text-amber-600 border-b-2 border-amber-500"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            <FileText size={14} /> Demander un devis
          </button>
        </div>

        {/* ── Body (scrollable) ──────────────────────────────────────── */}
        <div className="overflow-y-auto flex-1">

          {/* ── TAB : Infos contact ───────────────────────────────── */}
          {tab === "contact" && (
            <div className="p-6 space-y-6">
              {/* Bureau Sénégal */}
              <div>
                <h3 className="text-sm font-bold text-amber-500 uppercase tracking-widest mb-3">
                  Bureau Sénégal
                </h3>
                <div className="space-y-2.5">
                  <div className="flex items-start gap-3 text-gray-700 text-sm">
                    <MapPin size={15} className="text-amber-500 flex-shrink-0 mt-0.5" />
                    <span>Zac Mbao, Rond-Point SIPRES, Dakar, Sénégal</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-700 text-sm">
                    <Phone size={15} className="text-amber-500 flex-shrink-0" />
                    <span>+221 77 879 61 46</span>
                  </div>
                </div>
              </div>

              <div className="border-t" />

              {/* Bureau Gambie */}
              <div>
                <h3 className="text-sm font-bold text-amber-500 uppercase tracking-widest mb-3">
                  Bureau Gambie
                </h3>
                <div className="space-y-2.5">
                  <div className="flex items-start gap-3 text-gray-700 text-sm">
                    <MapPin size={15} className="text-amber-500 flex-shrink-0 mt-0.5" />
                    <span>Baraka Estate, Bakoteh, Gambia</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-700 text-sm">
                    <Phone size={15} className="text-amber-500 flex-shrink-0" />
                    <span>+220 271 7816</span>
                  </div>
                </div>
              </div>

              <div className="border-t" />

              <div className="flex items-center gap-3 text-gray-700 text-sm">
                <Mail size={15} className="text-amber-500 flex-shrink-0" />
                <span>market@groupegenetics.com</span>
              </div>

              {/* CTA vers devis */}
              <button
                onClick={() => setTab("devis")}
                className="w-full flex items-center justify-center gap-2 py-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 font-semibold text-sm hover:bg-amber-100 transition-colors"
              >
                <FileText size={15} /> Demander un devis personnalisé
              </button>
            </div>
          )}

          {/* ── TAB : Formulaire devis ────────────────────────────── */}
          {tab === "devis" && (
            <div className="p-6">
              {sent ? (
                /* ── Succès ──────────────────────────────────────────── */
                <div className="text-center py-8">
                  <CheckCircle size={48} className="text-green-500 mx-auto mb-4" strokeWidth={1.5} />
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Demande envoyée !</h3>
                  <p className="text-sm text-gray-500 max-w-xs mx-auto">
                    Notre équipe analysera votre besoin et reviendra vers vous rapidement.
                    Un email de confirmation vous a été envoyé.
                  </p>
                  <button
                    onClick={handleClose}
                    className="mt-6 px-6 py-2.5 bg-amber-500 text-white rounded-full font-semibold text-sm hover:bg-amber-400 transition-colors"
                  >
                    Fermer
                  </button>
                </div>
              ) : (
                /* ── Formulaire ──────────────────────────────────────── */
                <form onSubmit={handleSubmit} className="space-y-4">
                  <p className="text-sm text-gray-500 mb-2">
                    Décrivez votre besoin — nous vous répondrons sous 24 h.
                  </p>

                  {/* Nom */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">
                      Nom complet <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => set("name", e.target.value)}
                      placeholder="Jean Dupont"
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-amber-400 transition-colors"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">
                      Email <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => set("email", e.target.value)}
                      placeholder="jean@exemple.com"
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-amber-400 transition-colors"
                    />
                  </div>

                  {/* Téléphone */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">
                      Téléphone <span className="text-gray-400">(optionnel)</span>
                    </label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => set("phone", e.target.value)}
                      placeholder="+221 77 000 00 00"
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-amber-400 transition-colors"
                    />
                  </div>

                  {/* Service */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">
                      Type de service <span className="text-red-400">*</span>
                    </label>
                    <select
                      value={form.service}
                      onChange={(e) => set("service", e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-amber-400 transition-colors bg-white cursor-pointer"
                    >
                      <option value="">— Sélectionner un service —</option>
                      {SERVICES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">
                      Description du besoin <span className="text-red-400">*</span>
                    </label>
                    <textarea
                      value={form.description}
                      onChange={(e) => set("description", e.target.value)}
                      placeholder="Décrivez votre projet, le volume, les contraintes techniques..."
                      rows={4}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-amber-400 transition-colors resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-white font-bold rounded-full text-sm transition-colors flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <><Loader2 size={16} className="animate-spin" /> Envoi en cours...</>
                    ) : (
                      "Envoyer la demande de devis"
                    )}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
