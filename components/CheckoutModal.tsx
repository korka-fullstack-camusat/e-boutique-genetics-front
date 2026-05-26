"use client";
import { useState } from "react";
import { X } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { ordersApi } from "@/lib/api";
import toast from "react-hot-toast";


interface Props {
  open: boolean;
  onClose: () => void;
}

export function CheckoutModal({ open, onClose }: Props) {
  const { items, total, clearCart } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "", email: "", phone: "", address: "", payment: "Paiement à la livraison",
  });

  if (!open) return null;

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await ordersApi.create({
        customer_name: form.name,
        customer_email: form.email,
        customer_phone: form.phone || null,
        customer_address: form.address || null,
        payment_method: form.payment,
        total_amount: total(),
        items: items.map((i) => ({
          product_id: i.product.id,
          product_name: i.product.name,
          quantity: i.quantity,
          price: i.product.price,
          size: i.size ?? null,
          color: i.color ?? null,
        })),
      });
      toast.success("Commande confirmée ! Un email vous a été envoyé.");
      clearCart();
      onClose();
      setForm({ name: "", email: "", phone: "", address: "", payment: "Paiement à la livraison" });
    } catch {
      toast.error("Erreur lors de la commande. Réessayez.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/60">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg max-h-[92vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="sticky top-0 bg-white px-5 py-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-bold">Finaliser la commande</h2>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-gray-100">
            <X size={18} />
          </button>
        </div>

        <div className="p-5">
          {/* Summary */}
          <div className="bg-gray-50 rounded-xl p-4 mb-5">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Récapitulatif</p>
            <div className="space-y-2">
              {items.map((item, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-gray-700">
                    {item.product.name} × {item.quantity}
                    {item.size && <span className="text-gray-400"> ({item.size})</span>}
                    {item.color && <span className="text-gray-400"> / {item.color}</span>}
                  </span>
                  <span className="font-medium">{(item.product.price * item.quantity).toLocaleString("fr-FR")} F</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between font-bold text-base mt-3 pt-3 border-t">
              <span>Total</span>
              <span className="text-amber-600">{total().toLocaleString("fr-FR")} FCFA</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Nom complet *</label>
                <input
                  required value={form.name} onChange={(e) => set("name", e.target.value)}
                  placeholder="Votre nom"
                  className="w-full px-3 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Email *</label>
                <input
                  required type="email" value={form.email} onChange={(e) => set("email", e.target.value)}
                  placeholder="votre@email.com"
                  className="w-full px-3 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Téléphone</label>
                <input
                  type="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)}
                  placeholder="+221 77 000 00 00"
                  className="w-full px-3 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Adresse</label>
                <input
                  value={form.address} onChange={(e) => set("address", e.target.value)}
                  placeholder="Dakar, Plateau..."
                  className="w-full px-3 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-2">Mode de paiement</label>
              <div className="flex items-center gap-3 p-3 rounded-xl border-2 border-amber-500 bg-amber-50">
                <span className="text-xl">💵</span>
                <div>
                  <p className="text-sm font-bold text-amber-800">À la livraison</p>
                  <p className="text-xs text-amber-600">Paiement en espèces à la réception</p>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={onClose} className="flex-1 py-3 border border-gray-200 rounded-xl font-semibold text-sm hover:border-gray-400 transition-colors">
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 bg-gray-900 text-white rounded-xl font-bold text-sm hover:bg-gray-700 transition-colors disabled:opacity-60"
              >
                {loading ? "Envoi..." : "Confirmer →"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
