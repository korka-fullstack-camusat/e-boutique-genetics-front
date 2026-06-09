"use client";
import { useState } from "react";
import { X, FileText, CheckCircle, Loader2 } from "lucide-react";
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

const EMPTY = { name: "", email: "", phone: "", service: "", description: "" };

export function ContactModal({ open, onClose }: Props) {
  const [form,    setForm]    = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [sent,    setSent]    = useState(false);

  if (!open) return null;

  function handleClose() {
    onClose();
    setTimeout(() => { setForm(EMPTY); setSent(false); }, 300);
  }

  function set(field: keyof typeof EMPTY, value: string) {
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

        {/* Header */}
        <div className="px-6 py-4 border-b flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <FileText size={18} className="text-gray-900" />
            <h2 className="text-lg font-bold text-gray-900">Demander un devis</h2>
          </div>
          <button onClick={handleClose} className="p-1.5 rounded-full hover:bg-gray-100 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 p-6">
          {sent ? (
            /* Succès */
            <div className="text-center py-8">
              <CheckCircle size={48} className="text-green-500 mx-auto mb-4" strokeWidth={1.5} />
              <h3 className="text-lg font-bold text-gray-900 mb-2">Demande envoyée !</h3>
              <p className="text-sm text-gray-500 max-w-xs mx-auto">
                Notre équipe analysera votre besoin et reviendra vers vous rapidement.
                Un email de confirmation vous a été envoyé.
              </p>
              <button
                onClick={handleClose}
                className="mt-6 px-6 py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-full font-semibold text-sm transition-colors"
              >
                Fermer
              </button>
            </div>
          ) : (
            /* Formulaire */
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-sm text-gray-500">
                Décrivez votre besoin — nous vous répondrons sous 24 h.
              </p>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Nom complet <span className="text-red-400">*</span>
                </label>
                <input
                  type="text" value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                  placeholder="Entrer votre nom complet"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-gray-900 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Email <span className="text-red-400">*</span>
                </label>
                <input
                  type="email" value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                  placeholder="Entrer votre adresse email"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-gray-900 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Téléphone <span className="text-gray-400">(optionnel)</span>
                </label>
                <input
                  type="tel" value={form.phone}
                  onChange={(e) => set("phone", e.target.value)}
                  placeholder="Entrer votre numéro de téléphone"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-gray-900 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Type de service <span className="text-red-400">*</span>
                </label>
                <select
                  value={form.service}
                  onChange={(e) => set("service", e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-gray-900 transition-colors bg-white cursor-pointer"
                >
                  <option value="">— Sélectionner un service —</option>
                  {SERVICES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Description du besoin <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => set("description", e.target.value)}
                  placeholder="Entrer la description de votre besoin..."
                  rows={4}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-gray-900 transition-colors resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gray-900 hover:bg-gray-800 disabled:opacity-60 text-white font-bold rounded-full text-sm transition-colors flex items-center justify-center gap-2"
              >
                {loading
                  ? <><Loader2 size={16} className="animate-spin" /> Envoi en cours...</>
                  : "Envoyer la demande de devis"
                }
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
