"use client";
import { useState } from "react";
import { X, Handshake, CheckCircle, Loader2 } from "lucide-react";
import { partnersApi } from "@/lib/api";
import toast from "react-hot-toast";

interface Props {
  open: boolean;
  onClose: () => void;
}

export const PARTNER_SPECIALTIES = [
  "Vidéosurveillance",
  "Contrôle d'accès / Anti-intrusion",
  "Câblage informatique / Réseau",
  "Wi-Fi / Connectivité",
  "Énergie / Onduleurs / Solaire",
  "Informatique / Serveurs",
  "Téléphonie / Visioconférence",
  "Domotique",
  "Autre",
];

const EXPERIENCE = ["Moins d'1 an", "1 à 3 ans", "3 à 5 ans", "5 à 10 ans", "Plus de 10 ans"];
const TEAM_SIZES = ["Je travaille seul", "2 à 5 personnes", "6 à 10 personnes", "Plus de 10 personnes"];

const EMPTY = {
  full_name: "", company: "", phone: "", email: "", city: "", zones: "",
  specialties: [] as string[], experience_years: "", team_size: "", certifications: "", message: "",
};

const INPUT = "w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-gray-900 transition-colors";

function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-xs font-semibold text-gray-600 mb-1">
      {children} {required ? <span className="text-red-400">*</span> : <span className="text-gray-400">(optionnel)</span>}
    </label>
  );
}

export function PartnerModal({ open, onClose }: Props) {
  const [form, setForm] = useState(EMPTY);
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  if (!open) return null;

  function handleClose() {
    onClose();
    setTimeout(() => { setForm(EMPTY); setConsent(false); setSent(false); }, 300);
  }

  function set<K extends keyof typeof EMPTY>(field: K, value: (typeof EMPTY)[K]) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function toggleSpecialty(s: string) {
    set("specialties", form.specialties.includes(s)
      ? form.specialties.filter((x) => x !== s)
      : [...form.specialties, s]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.full_name.trim() || !form.phone.trim() || !form.email.trim() || !form.city.trim() || !form.experience_years) {
      toast.error("Veuillez remplir tous les champs obligatoires.");
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) {
      toast.error("Adresse email invalide.");
      return;
    }
    if (form.specialties.length === 0) {
      toast.error("Choisissez au moins une spécialité.");
      return;
    }
    if (!consent) {
      toast.error("Merci d'accepter d'être recontacté.");
      return;
    }
    setLoading(true);
    try {
      await partnersApi.apply({
        full_name:        form.full_name.trim(),
        company:          form.company.trim() || null,
        phone:            form.phone.trim(),
        email:            form.email.trim(),
        city:             form.city.trim(),
        zones:            form.zones.trim() || null,
        specialties:      form.specialties,
        experience_years: form.experience_years,
        team_size:        form.team_size || null,
        certifications:   form.certifications.trim() || null,
        message:          form.message.trim() || null,
      });
      setSent(true);
    } catch {
      toast.error("Erreur lors de l'envoi. Réessayez.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/60">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg shadow-2xl animate-in flex flex-col max-h-[92vh]">

        <div className="px-6 py-4 border-b flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <Handshake size={18} className="text-amber-500" />
            <h2 className="text-lg font-bold text-gray-900">Devenir partenaire installateur</h2>
          </div>
          <button onClick={handleClose} className="p-1.5 rounded-full hover:bg-gray-100 transition-colors" aria-label="Fermer">
            <X size={18} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-6">
          {sent ? (
            <div className="text-center py-8">
              <CheckCircle size={48} className="text-green-500 mx-auto mb-4" strokeWidth={1.5} />
              <h3 className="text-lg font-bold text-gray-900 mb-2">Candidature envoyée !</h3>
              <p className="text-sm text-gray-500 max-w-xs mx-auto">
                Merci {form.full_name.split(" ")[0]}. Notre équipe étudie votre profil et vous recontactera rapidement.
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
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-sm text-gray-500">
                Vous êtes installateur ? Rejoignez le réseau Groupe Genetics : tarifs partenaires, accompagnement
                technique et chantiers près de chez vous.
              </p>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label required>Nom complet</Label>
                  <input className={INPUT} value={form.full_name} onChange={(e) => set("full_name", e.target.value)} placeholder="Prénom et nom" autoComplete="name" />
                </div>
                <div>
                  <Label>Entreprise</Label>
                  <input className={INPUT} value={form.company} onChange={(e) => set("company", e.target.value)} placeholder="Nom de votre société" autoComplete="organization" />
                </div>
                <div>
                  <Label required>Téléphone</Label>
                  <input type="tel" className={INPUT} value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="77 000 00 00" autoComplete="tel" />
                </div>
                <div>
                  <Label required>Email</Label>
                  <input type="email" className={INPUT} value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="vous@exemple.com" autoComplete="email" />
                </div>
                <div>
                  <Label required>Ville</Label>
                  <input className={INPUT} value={form.city} onChange={(e) => set("city", e.target.value)} placeholder="Ex. Dakar" autoComplete="address-level2" />
                </div>
                <div>
                  <Label>Zones d’intervention</Label>
                  <input className={INPUT} value={form.zones} onChange={(e) => set("zones", e.target.value)} placeholder="Ex. Dakar, Thiès, Mbour" />
                </div>
              </div>

              <div>
                <Label required>Spécialités</Label>
                <div className="flex flex-wrap gap-2">
                  {PARTNER_SPECIALTIES.map((s) => {
                    const on = form.specialties.includes(s);
                    return (
                      <button
                        type="button"
                        key={s}
                        onClick={() => toggleSpecialty(s)}
                        aria-pressed={on}
                        className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                          on ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                        }`}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label required>Années d’expérience</Label>
                  <select className={`${INPUT} bg-white cursor-pointer`} value={form.experience_years} onChange={(e) => set("experience_years", e.target.value)}>
                    <option value="">— Sélectionner —</option>
                    {EXPERIENCE.map((x) => <option key={x} value={x}>{x}</option>)}
                  </select>
                </div>
                <div>
                  <Label>Taille de l’équipe</Label>
                  <select className={`${INPUT} bg-white cursor-pointer`} value={form.team_size} onChange={(e) => set("team_size", e.target.value)}>
                    <option value="">— Sélectionner —</option>
                    {TEAM_SIZES.map((x) => <option key={x} value={x}>{x}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <Label>Certifications / marques maîtrisées</Label>
                <input className={INPUT} value={form.certifications} onChange={(e) => set("certifications", e.target.value)} placeholder="Ex. Hikvision, Ubiquiti, Fortinet…" />
              </div>

              <div>
                <Label>Message</Label>
                <textarea className={`${INPUT} resize-none`} rows={3} value={form.message} onChange={(e) => set("message", e.target.value)} placeholder="Parlez-nous de vos réalisations, de vos attentes…" />
              </div>

              <label className="flex items-start gap-2 text-xs text-gray-500 cursor-pointer">
                <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5 accent-gray-900" />
                J’accepte que Groupe Genetics conserve ces informations pour étudier ma candidature et me recontacter.
              </label>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gray-900 hover:bg-gray-800 disabled:opacity-60 text-white font-bold rounded-full text-sm transition-colors flex items-center justify-center gap-2"
              >
                {loading ? <><Loader2 size={16} className="animate-spin" /> Envoi en cours...</> : "Envoyer ma candidature"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
