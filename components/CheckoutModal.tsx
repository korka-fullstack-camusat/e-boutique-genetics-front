"use client";
import { useState } from "react";
import { X, ChevronLeft, ChevronRight, Smartphone, CheckCircle } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { ordersApi } from "@/lib/api";
import toast from "react-hot-toast";

const WAVE_PAYMENT_LINK = "https://pay.wave.com/m/M_sn_mOWbrjN-8zHL";

type PayMethod = "wave_complet" | "wave_acompte";

const ACOMPTE_PRESETS = [
  { label: "30 %", pct: 0.3 },
  { label: "50 %", pct: 0.5 },
  { label: "70 %", pct: 0.7 },
];

const STEPS = ["Paiement", "Infos"];

export function CheckoutModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { items, total, clearCart } = useCartStore();

  const [step,          setStep]          = useState<1 | 2>(1);
  const [paymentSubStep, setPaymentSubStep] = useState<"choice" | "details">("choice");
  const [payMethod,     setPayMethod]     = useState<PayMethod>("wave_complet");
  const [acomptePct,    setAcomptePct]    = useState(0.5);
  const [customAcompte, setCustomAcompte] = useState("");
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [form,          setForm]          = useState({ name: "", email: "", phone: "", address: "" });
  const [loading,       setLoading]       = useState(false);

  if (!open) return null;

  const grandTotal  = total();
  const acompteAmt  = payMethod === "wave_acompte"
    ? (customAcompte ? parseFloat(customAcompte) || 0 : Math.round(grandTotal * acomptePct))
    : null;
  const minAcompte  = Math.round(grandTotal * 0.3);

  function paymentLabel() {
    if (payMethod === "wave_complet") return "Wave — Paiement complet";
    return `Wave — Acompte ${acompteAmt?.toLocaleString("fr-FR")} FCFA`;
  }

  function handleClose() {
    setStep(1); setPaymentSubStep("choice"); setPayMethod("wave_complet");
    setAcomptePct(0.5); setCustomAcompte(""); setPaymentConfirmed(false);
    setForm({ name: "", email: "", phone: "", address: "" });
    onClose();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (payMethod === "wave_acompte" && acompteAmt && acompteAmt < minAcompte) {
      toast.error(`Acompte minimum : ${minAcompte.toLocaleString("fr-FR")} FCFA`); return;
    }
    setLoading(true);
    try {
      await ordersApi.create({
        customer_name:    form.name,
        customer_email:   form.email,
        customer_phone:   form.phone   || null,
        customer_address: form.address || null,
        payment_method:   paymentLabel(),
        delivery_method:  null,
        delivery_fee:     0,
        acompte_amount:   acompteAmt,
        total_amount:     grandTotal,
        items: items.map((i) => ({
          product_id: i.product.id, product_name: i.product.name,
          quantity: i.quantity, price: i.product.price,
          size: i.size ?? null, color: i.color ?? null,
        })),
      });
      toast.success("Commande confirmée !");
      clearCart(); handleClose();
    } catch {
      toast.error("Erreur lors de la commande.");
    } finally { setLoading(false); }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/60">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md max-h-[92vh] overflow-y-auto shadow-2xl">

        {/* ── Header ──────────────────────────────────────────────────── */}
        <div className="sticky top-0 bg-white px-5 pt-5 pb-4 border-b z-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900">Finaliser la commande</h2>
            <button onClick={handleClose} className="p-1.5 rounded-full hover:bg-gray-100">
              <X size={17} />
            </button>
          </div>
          {/* Steps */}
          <div className="flex items-center">
            {STEPS.map((label, i) => {
              const s = (i + 1) as 1 | 2;
              const done   = step > s;
              const active = step === s;
              return (
                <div key={s} className="flex items-center flex-1 last:flex-none">
                  <div className="flex items-center gap-1.5">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-colors ${
                      done ? "bg-amber-500 text-white" : active ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-400"
                    }`}>
                      {done ? <CheckCircle size={13} /> : s}
                    </div>
                    <span className={`text-xs font-medium hidden sm:block ${active ? "text-gray-900" : "text-gray-400"}`}>
                      {label}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={`flex-1 h-px mx-2 ${step > s ? "bg-amber-500" : "bg-gray-200"}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="p-5">

          {/* ── ÉTAPE 1 : Paiement ──────────────────────────────────────── */}
          {step === 1 && (
            <div className="space-y-2.5">
              {paymentSubStep === "choice" ? (
                <>
                  <p className="text-sm font-semibold text-gray-700 mb-3">Comment souhaitez-vous payer ?</p>

                  {/* Paiement complet */}
                  <button
                    onClick={() => { setPayMethod("wave_complet"); setPaymentSubStep("details"); setPaymentConfirmed(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl border-2 border-gray-100 hover:border-blue-400 text-left transition-all"
                  >
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-blue-50">
                      <Smartphone size={17} className="text-blue-600" />
                    </div>
                    <span className="flex-1 text-sm font-semibold">Paiement complet</span>
                    <span className="text-sm font-bold text-blue-600">{grandTotal.toLocaleString("fr-FR")} F</span>
                  </button>

                  {/* Paiement Acompte */}
                  <button
                    onClick={() => { setPayMethod("wave_acompte"); setPaymentSubStep("details"); setPaymentConfirmed(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl border-2 border-gray-100 hover:border-purple-400 text-left transition-all"
                  >
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-purple-50">
                      <Smartphone size={17} className="text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Paiement Acompte</p>
                      <p className="text-xs text-gray-400">Min. 30% maintenant, reste à la livraison</p>
                    </div>
                  </button>
                </>
              ) : (
                <>
                  {/* Retour vers le choix du mode de paiement */}
                  <button
                    type="button"
                    onClick={() => { setPaymentSubStep("choice"); setPaymentConfirmed(false); }}
                    className="flex items-center gap-1 text-sm font-semibold text-gray-500 hover:text-gray-800 transition-colors mb-1"
                  >
                    <ChevronLeft size={15} /> Retour
                  </button>

                  <p className="text-sm font-semibold text-gray-700 mb-1">
                    {payMethod === "wave_complet" ? "Paiement complet" : "Paiement avec acompte"}
                  </p>

                  {/* Sélecteur acompte */}
                  {payMethod === "wave_acompte" && (
                    <div className="bg-purple-50 rounded-2xl p-4 space-y-3">
                      <div className="flex gap-2">
                        {ACOMPTE_PRESETS.map((p) => {
                          const amt    = Math.round(grandTotal * p.pct);
                          const active = acomptePct === p.pct && !customAcompte;
                          return (
                            <button
                              key={p.pct}
                              onClick={() => { setAcomptePct(p.pct); setCustomAcompte(""); setPaymentConfirmed(false); }}
                              className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-colors ${
                                active ? "bg-purple-600 text-white" : "bg-white text-purple-700 border border-purple-200"
                              }`}
                            >
                              {p.label}
                              <span className={`block text-xs font-normal mt-0.5 ${active ? "text-white/80" : "text-purple-400"}`}>
                                {amt.toLocaleString("fr-FR")} F
                              </span>
                            </button>
                          );
                        })}
                      </div>
                      <input
                        type="number"
                        value={customAcompte}
                        onChange={(e) => { setCustomAcompte(e.target.value); setPaymentConfirmed(false); }}
                        placeholder={`Autre montant (min. ${minAcompte.toLocaleString("fr-FR")} F)`}
                        className="w-full px-3 py-2.5 border border-purple-200 rounded-xl text-sm focus:outline-none focus:border-purple-500 bg-white"
                      />
                      <div className="flex justify-between text-sm font-semibold">
                        <span className="text-purple-700">Acompte</span>
                        <span className="text-purple-700">{(acompteAmt ?? 0).toLocaleString("fr-FR")} FCFA</span>
                      </div>
                      <div className="flex justify-between text-sm text-gray-500">
                        <span>Reste à la livraison</span>
                        <span>{(grandTotal - (acompteAmt ?? 0)).toLocaleString("fr-FR")} FCFA</span>
                      </div>
                    </div>
                  )}

                  {/* Wave : lien de paiement avec montant pré-rempli */}
                  <div className="bg-blue-50 rounded-2xl p-4 text-center space-y-2.5">
                    <p className="text-xs text-blue-500">
                      Montant à payer : <span className="font-bold">
                        {Math.round(payMethod === "wave_complet" ? grandTotal : acompteAmt ?? 0).toLocaleString("fr-FR")} FCFA
                      </span>
                    </p>
                    <a
                      href={`${WAVE_PAYMENT_LINK}?amount=${Math.round(payMethod === "wave_complet" ? grandTotal : acompteAmt ?? 0)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full py-3 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-colors"
                    >
                      <Smartphone size={16} /> Payer avec Wave
                    </a>
                    <p className="text-xs text-blue-400">Vous serez redirigé vers l&apos;application Wave</p>
                  </div>

                  {/* Confirmation du paiement avant de poursuivre */}
                  <label className="flex items-start gap-2.5 px-1 pt-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={paymentConfirmed}
                      onChange={(e) => setPaymentConfirmed(e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded border-gray-300 text-amber-500 focus:ring-amber-500"
                    />
                    <span className="text-xs text-gray-600">
                      J&apos;ai effectué le paiement Wave de{" "}
                      <span className="font-bold">
                        {Math.round(payMethod === "wave_complet" ? grandTotal : acompteAmt ?? 0).toLocaleString("fr-FR")} FCFA
                      </span>
                    </span>
                  </label>

                  <button
                    onClick={() => setStep(2)}
                    disabled={!paymentConfirmed}
                    className={`w-full flex items-center justify-center gap-2 mt-2 py-3.5 rounded-2xl font-bold text-sm transition-colors ${
                      paymentConfirmed
                        ? "bg-amber-500 text-gray-900 hover:bg-amber-400"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    Suivant <ChevronRight size={16} />
                  </button>
                </>
              )}
            </div>
          )}

          {/* ── ÉTAPE 2 : Informations ──────────────────────────────────── */}
          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Mini récap */}
              <div className="bg-gray-50 rounded-2xl p-4 space-y-1.5">
                {items.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-gray-600">{item.product.name} × {item.quantity}</span>
                    <span className="font-semibold">{(item.product.price * item.quantity).toLocaleString("fr-FR")} F</span>
                  </div>
                ))}
                <div className="flex justify-between font-black pt-2 border-t border-gray-200">
                  <span>Total</span>
                  <span className="text-amber-600">{grandTotal.toLocaleString("fr-FR")} FCFA</span>
                </div>
                {acompteAmt && (
                  <div className="flex justify-between text-sm text-green-600 font-semibold">
                    <span>Acompte Wave</span>
                    <span>-{acompteAmt.toLocaleString("fr-FR")} FCFA</span>
                  </div>
                )}
              </div>

              {/* Champs */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { key: "name",    label: "Nom *",       type: "text",  placeholder: "Votre nom",          required: true  },
                  { key: "email",   label: "Email *",     type: "email", placeholder: "email@exemple.com",  required: true  },
                  { key: "phone",   label: "Téléphone *", type: "tel",   placeholder: "+221 77 000 00 00",   required: true  },
                  { key: "address", label: "Adresse",     type: "text",  placeholder: "Dakar, Plateau...",   required: false },
                ].map(({ key, label, type, placeholder, required }) => (
                  <div key={key}>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">{label}</label>
                    <input
                      type={type} required={required}
                      value={form[key as keyof typeof form]}
                      onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                      placeholder={placeholder}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-amber-500 transition-colors"
                    />
                  </div>
                ))}
              </div>

              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => setStep(1)}
                  className="flex items-center gap-1 px-4 py-3 border border-gray-200 rounded-2xl text-sm font-semibold hover:border-gray-400 transition-colors">
                  <ChevronLeft size={15} />
                </button>
                <button type="submit" disabled={loading}
                  className="flex-1 py-3 bg-gray-900 text-white rounded-2xl font-bold text-sm hover:bg-gray-700 transition-colors disabled:opacity-60">
                  {loading ? "Envoi..." : "Confirmer la commande →"}
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
