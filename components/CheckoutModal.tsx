"use client";
import { useState } from "react";
import { X, ChevronLeft, Truck, Store, User, Banknote, Smartphone, ChevronRight, CheckCircle } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { ordersApi } from "@/lib/api";
import toast from "react-hot-toast";

// ── Config ────────────────────────────────────────────────────────────────────
const WAVE_PHONE     = process.env.NEXT_PUBLIC_WAVE_PHONE || "+221 XX XXX XX XX";
const DELIVERY_FEE   = 2000; // FCFA — frais livraison domicile

const DELIVERY_OPTIONS = [
  {
    id: "domicile",
    icon: <Truck size={20} />,
    label: "Livraison à domicile",
    desc: "Livraison dans les 24-48h",
    fee: DELIVERY_FEE,
    feeLabel: `+${DELIVERY_FEE.toLocaleString("fr-FR")} FCFA`,
  },
  {
    id: "retrait",
    icon: <Store size={20} />,
    label: "Retrait en boutique",
    desc: "Récupérez votre commande directement",
    fee: 0,
    feeLabel: "Gratuit",
  },
  {
    id: "personnel",
    icon: <User size={20} />,
    label: "Je gère ma livraison",
    desc: "Vous organisez votre propre livreur",
    fee: 0,
    feeLabel: "Gratuit",
  },
] as const;

type DeliveryId = typeof DELIVERY_OPTIONS[number]["id"];

const ACOMPTE_PRESETS = [
  { label: "30 %", pct: 0.3 },
  { label: "50 %", pct: 0.5 },
  { label: "70 %", pct: 0.7 },
];

interface Props { open: boolean; onClose: () => void; }

// ── Component ─────────────────────────────────────────────────────────────────
export function CheckoutModal({ open, onClose }: Props) {
  const { items, total, clearCart } = useCartStore();

  // ── State ──
  const [step, setStep]                   = useState<1 | 2 | 3>(1);
  const [delivery, setDelivery]           = useState<DeliveryId>("retrait");
  const [payMethod, setPayMethod]         = useState<"livraison" | "wave_complet" | "wave_acompte">("livraison");
  const [acomptePct, setAcomptePct]       = useState<number>(0.5);
  const [customAcompte, setCustomAcompte] = useState("");
  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "" });
  const [loading, setLoading]             = useState(false);

  if (!open) return null;

  // ── Calculs ──
  const subtotal      = total();
  const deliveryFee   = DELIVERY_OPTIONS.find((d) => d.id === delivery)?.fee ?? 0;
  const grandTotal    = subtotal + deliveryFee;
  const acompteAmount = payMethod === "wave_acompte"
    ? (customAcompte ? parseFloat(customAcompte) : Math.round(grandTotal * acomptePct))
    : null;
  const minAcompte    = Math.round(grandTotal * 0.3);

  function paymentLabel(): string {
    if (payMethod === "livraison")     return "Paiement à la livraison";
    if (payMethod === "wave_complet")  return "Wave - Paiement complet";
    if (payMethod === "wave_acompte")  return `Wave - Acompte ${acompteAmount?.toLocaleString("fr-FR")} FCFA`;
    return "";
  }

  function deliveryLabel(): string {
    return DELIVERY_OPTIONS.find((d) => d.id === delivery)?.label ?? "";
  }

  function handleClose() {
    setStep(1); setDelivery("retrait"); setPayMethod("livraison");
    setAcomptePct(0.5); setCustomAcompte("");
    setForm({ name: "", email: "", phone: "", address: "" });
    onClose();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (delivery === "domicile" && !form.address) {
      toast.error("Veuillez indiquer votre adresse de livraison");
      return;
    }
    if (payMethod === "wave_acompte" && acompteAmount && acompteAmount < minAcompte) {
      toast.error(`L'acompte minimum est de ${minAcompte.toLocaleString("fr-FR")} FCFA (30%)`);
      return;
    }
    setLoading(true);
    try {
      await ordersApi.create({
        customer_name:    form.name,
        customer_email:   form.email,
        customer_phone:   form.phone   || null,
        customer_address: form.address || null,
        payment_method:   paymentLabel(),
        delivery_method:  delivery,
        delivery_fee:     deliveryFee,
        acompte_amount:   acompteAmount,
        total_amount:     grandTotal,
        items: items.map((i) => ({
          product_id:   i.product.id,
          product_name: i.product.name,
          quantity:     i.quantity,
          price:        i.product.price,
          size:  i.size  ?? null,
          color: i.color ?? null,
        })),
      });
      toast.success("Commande confirmée ! Un email vous a été envoyé.");
      clearCart();
      handleClose();
    } catch {
      toast.error("Erreur lors de la commande. Réessayez.");
    } finally {
      setLoading(false);
    }
  }

  // ── Helpers ──
  const isWave = payMethod === "wave_complet" || payMethod === "wave_acompte";
  const waveAmount = payMethod === "wave_complet" ? grandTotal : (acompteAmount ?? 0);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/60">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg max-h-[92vh] overflow-y-auto shadow-2xl">

        {/* ── Header ─────────────────────────────────────────────────── */}
        <div className="sticky top-0 bg-white px-5 py-4 border-b z-10">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-gray-900">Finaliser la commande</h2>
            <button onClick={handleClose} className="p-1.5 rounded-full hover:bg-gray-100">
              <X size={18} />
            </button>
          </div>
          {/* Barre de progression */}
          <div className="flex items-center gap-1">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-1 flex-1">
                <div className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold transition-colors ${
                  step === s ? "bg-gray-900 text-white" : step > s ? "bg-amber-500 text-white" : "bg-gray-100 text-gray-400"
                }`}>
                  {step > s ? <CheckCircle size={14} /> : s}
                </div>
                <p className={`text-xs hidden sm:block ${step === s ? "text-gray-900 font-semibold" : "text-gray-400"}`}>
                  {s === 1 ? "Livraison" : s === 2 ? "Paiement" : "Informations"}
                </p>
                {s < 3 && <div className={`flex-1 h-0.5 mx-1 rounded ${step > s ? "bg-amber-500" : "bg-gray-100"}`} />}
              </div>
            ))}
          </div>
        </div>

        <div className="p-5">

          {/* ════════════════════════════════════════════════════════════
              ÉTAPE 1 — Livraison
          ════════════════════════════════════════════════════════════ */}
          {step === 1 && (
            <div className="space-y-3">
              <p className="text-sm font-bold text-gray-700 mb-4">Comment souhaitez-vous recevoir votre commande ?</p>
              {DELIVERY_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setDelivery(opt.id)}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all ${
                    delivery === opt.id
                      ? "border-gray-900 bg-gray-900 text-white"
                      : "border-gray-100 hover:border-gray-300 bg-white"
                  }`}
                >
                  <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${
                    delivery === opt.id ? "bg-white/20" : "bg-gray-100"
                  }`}>
                    <span className={delivery === opt.id ? "text-white" : "text-gray-600"}>
                      {opt.icon}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm">{opt.label}</p>
                    <p className={`text-xs mt-0.5 ${delivery === opt.id ? "text-white/70" : "text-gray-400"}`}>
                      {opt.desc}
                    </p>
                  </div>
                  <span className={`text-sm font-black flex-shrink-0 ${
                    delivery === opt.id ? "text-amber-400" : opt.fee > 0 ? "text-amber-600" : "text-green-600"
                  }`}>
                    {opt.feeLabel}
                  </span>
                </button>
              ))}

              <button
                onClick={() => setStep(2)}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-amber-500 text-gray-900 rounded-xl font-bold text-sm hover:bg-amber-400 transition-colors mt-4"
              >
                Suivant <ChevronRight size={16} />
              </button>
            </div>
          )}

          {/* ════════════════════════════════════════════════════════════
              ÉTAPE 2 — Paiement
          ════════════════════════════════════════════════════════════ */}
          {step === 2 && (
            <div className="space-y-3">
              <p className="text-sm font-bold text-gray-700 mb-4">Comment souhaitez-vous payer ?</p>

              {/* Paiement à la livraison */}
              <button
                onClick={() => setPayMethod("livraison")}
                className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all ${
                  payMethod === "livraison" ? "border-gray-900 bg-gray-900 text-white" : "border-gray-100 hover:border-gray-300"
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${payMethod === "livraison" ? "bg-white/20" : "bg-gray-100"}`}>
                  <Banknote size={20} className={payMethod === "livraison" ? "text-white" : "text-gray-600"} />
                </div>
                <div>
                  <p className="font-bold text-sm">Paiement à la livraison</p>
                  <p className={`text-xs mt-0.5 ${payMethod === "livraison" ? "text-white/70" : "text-gray-400"}`}>
                    Réglez en espèces à la réception
                  </p>
                </div>
              </button>

              {/* Wave complet */}
              <button
                onClick={() => setPayMethod("wave_complet")}
                className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all ${
                  payMethod === "wave_complet" ? "border-blue-600 bg-blue-600 text-white" : "border-gray-100 hover:border-gray-300"
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${payMethod === "wave_complet" ? "bg-white/20" : "bg-blue-50"}`}>
                  <Smartphone size={20} className={payMethod === "wave_complet" ? "text-white" : "text-blue-600"} />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-sm">Wave — Paiement complet</p>
                  <p className={`text-xs mt-0.5 ${payMethod === "wave_complet" ? "text-white/70" : "text-gray-400"}`}>
                    Payez la totalité maintenant via Wave
                  </p>
                </div>
                <span className={`text-sm font-black ${payMethod === "wave_complet" ? "text-white" : "text-blue-600"}`}>
                  {grandTotal.toLocaleString("fr-FR")} F
                </span>
              </button>

              {/* Wave acompte */}
              <button
                onClick={() => setPayMethod("wave_acompte")}
                className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all ${
                  payMethod === "wave_acompte" ? "border-purple-600 bg-purple-600 text-white" : "border-gray-100 hover:border-gray-300"
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${payMethod === "wave_acompte" ? "bg-white/20" : "bg-purple-50"}`}>
                  <Smartphone size={20} className={payMethod === "wave_acompte" ? "text-white" : "text-purple-600"} />
                </div>
                <div>
                  <p className="font-bold text-sm">Wave — Acompte</p>
                  <p className={`text-xs mt-0.5 ${payMethod === "wave_acompte" ? "text-white/70" : "text-gray-400"}`}>
                    Payez un acompte (min. 30%) + reste à la livraison
                  </p>
                </div>
              </button>

              {/* Sélecteur acompte */}
              {payMethod === "wave_acompte" && (
                <div className="bg-purple-50 rounded-2xl p-4 space-y-3">
                  <p className="text-xs font-bold text-purple-700 uppercase">Choisir le montant de l'acompte</p>
                  <div className="flex gap-2">
                    {ACOMPTE_PRESETS.map((p) => (
                      <button
                        key={p.pct}
                        onClick={() => { setAcomptePct(p.pct); setCustomAcompte(""); }}
                        className={`flex-1 py-2 rounded-xl text-sm font-bold transition-colors ${
                          acomptePct === p.pct && !customAcompte
                            ? "bg-purple-600 text-white"
                            : "bg-white text-purple-700 border border-purple-200 hover:bg-purple-100"
                        }`}
                      >
                        {p.label}
                        <br />
                        <span className="text-xs font-normal">
                          {Math.round(grandTotal * p.pct).toLocaleString("fr-FR")} F
                        </span>
                      </button>
                    ))}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-purple-700 mb-1">Ou saisir un montant personnalisé (FCFA)</label>
                    <input
                      type="number"
                      value={customAcompte}
                      onChange={(e) => setCustomAcompte(e.target.value)}
                      placeholder={`Min. ${minAcompte.toLocaleString("fr-FR")} FCFA`}
                      className="w-full px-3 py-2.5 border border-purple-200 rounded-xl text-sm focus:outline-none focus:border-purple-500 bg-white"
                    />
                  </div>
                  <div className="bg-white rounded-xl p-3 flex justify-between text-sm">
                    <span className="text-gray-500">Acompte à payer maintenant</span>
                    <span className="font-black text-purple-700">
                      {(acompteAmount ?? 0).toLocaleString("fr-FR")} FCFA
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Reste à la livraison</span>
                    <span className="font-bold text-gray-700">
                      {(grandTotal - (acompteAmount ?? 0)).toLocaleString("fr-FR")} FCFA
                    </span>
                  </div>
                </div>
              )}

              {/* Instructions Wave */}
              {isWave && (
                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 space-y-2">
                  <p className="text-xs font-bold text-blue-700 uppercase">📱 Instructions Wave</p>
                  <p className="text-sm text-blue-800">
                    Envoyez <strong>{waveAmount.toLocaleString("fr-FR")} FCFA</strong> au numéro Wave suivant :
                  </p>
                  <div className="bg-white rounded-xl px-4 py-3 text-center">
                    <p className="text-lg font-black text-blue-700 tracking-widest">{WAVE_PHONE}</p>
                    <p className="text-xs text-gray-400 mt-0.5">Numéro Wave marchand — Groupe Genetics</p>
                  </div>
                  <p className="text-xs text-blue-600">
                    Après envoi, complétez votre commande. Notre équipe vérifiera le paiement sous 24h.
                  </p>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button onClick={() => setStep(1)} className="flex items-center gap-1 px-4 py-3 border border-gray-200 rounded-xl font-semibold text-sm hover:border-gray-400 transition-colors">
                  <ChevronLeft size={15} /> Retour
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-amber-500 text-gray-900 rounded-xl font-bold text-sm hover:bg-amber-400 transition-colors"
                >
                  Suivant <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════════════════════════
              ÉTAPE 3 — Informations + Confirmation
          ════════════════════════════════════════════════════════════ */}
          {step === 3 && (
            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Récapitulatif */}
              <div className="bg-gray-50 rounded-2xl p-4 space-y-2">
                <p className="text-xs font-bold text-gray-400 uppercase mb-3">Récapitulatif</p>
                {items.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-gray-700">{item.product.name} × {item.quantity}</span>
                    <span className="font-medium">{(item.product.price * item.quantity).toLocaleString("fr-FR")} F</span>
                  </div>
                ))}
                {deliveryFee > 0 && (
                  <div className="flex justify-between text-sm text-gray-500 pt-1">
                    <span>Frais de livraison</span>
                    <span>+{deliveryFee.toLocaleString("fr-FR")} F</span>
                  </div>
                )}
                <div className="flex justify-between font-black text-base pt-2 border-t border-gray-200">
                  <span>Total</span>
                  <span className="text-amber-600">{grandTotal.toLocaleString("fr-FR")} FCFA</span>
                </div>
                {acompteAmount && (
                  <div className="flex justify-between text-sm text-green-700 font-semibold">
                    <span>Acompte Wave payé</span>
                    <span>-{acompteAmount.toLocaleString("fr-FR")} FCFA</span>
                  </div>
                )}
                {/* Mode livraison + paiement */}
                <div className="flex flex-wrap gap-1.5 pt-2">
                  <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-full font-medium">
                    📦 {deliveryLabel()}
                  </span>
                  <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-full font-medium">
                    💳 {paymentLabel()}
                  </span>
                </div>
              </div>

              {/* Formulaire */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Nom complet *</label>
                  <input required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="Votre nom"
                    className="w-full px-3 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-amber-500 transition-colors" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Email *</label>
                  <input required type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    placeholder="votre@email.com"
                    className="w-full px-3 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-amber-500 transition-colors" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Téléphone *</label>
                  <input required type="tel" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                    placeholder="+221 77 000 00 00"
                    className="w-full px-3 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-amber-500 transition-colors" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Adresse {delivery === "domicile" ? "*" : ""}
                  </label>
                  <input value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                    placeholder="Dakar, Plateau..."
                    required={delivery === "domicile"}
                    className="w-full px-3 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-amber-500 transition-colors" />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setStep(2)}
                  className="flex items-center gap-1 px-4 py-3 border border-gray-200 rounded-xl font-semibold text-sm hover:border-gray-400 transition-colors">
                  <ChevronLeft size={15} /> Retour
                </button>
                <button type="submit" disabled={loading}
                  className="flex-1 py-3 bg-gray-900 text-white rounded-xl font-bold text-sm hover:bg-gray-700 transition-colors disabled:opacity-60">
                  {loading ? "Envoi en cours..." : "✓ Confirmer la commande"}
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
