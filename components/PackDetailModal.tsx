"use client";
import { useState } from "react";
import { X, Minus, Plus, Package } from "lucide-react";
import { Pack } from "@/lib/types";
import { useCartStore } from "@/store/cartStore";
import { PackVisual, savingsPercent } from "./PackCard";
import toast from "react-hot-toast";

interface Props {
  pack: Pack | null;
  onClose: () => void;
}

export function PackDetailModal({ pack, onClose }: Props) {
  const addPack = useCartStore((s) => s.addPack);
  const [qty, setQty] = useState(1);

  if (!pack) return null;

  const pct = savingsPercent(pack);
  const maxQty = Math.max(1, pack.stock);
  const soldOut = pack.stock === 0;

  function handleClose() {
    setQty(1);
    onClose();
  }

  function handleAdd() {
    addPack(pack!, qty);
    toast.success(`Pack ${pack!.name} ajouté au panier`);
    handleClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/60" onClick={handleClose}>
      <div
        className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg max-h-[92vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white px-5 py-4 border-b flex items-center justify-between z-10">
          <h2 className="text-base font-bold text-gray-900 truncate pr-4 flex items-center gap-2">
            <Package size={18} className="text-amber-500 flex-shrink-0" /> Pack {pack.name}
          </h2>
          <button onClick={handleClose} className="p-1.5 rounded-full hover:bg-gray-100 flex-shrink-0">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-5">
          <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-gray-50 border border-gray-100">
            <PackVisual pack={pack} />
          </div>
          <p className="-mt-3 text-center text-[11px] text-gray-400">Photo non contractuelle</p>

          {pack.description && (
            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{pack.description}</p>
          )}

          {/* Contenu du pack */}
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Contenu du pack</h3>
            <ul className="divide-y border rounded-xl">
              {pack.items.map((i) => (
                <li key={i.product_id} className="flex items-center gap-3 p-3">
                  <div className="w-12 h-12 rounded-lg bg-white border flex-shrink-0 overflow-hidden flex items-center justify-center">
                    {i.product_image
                      ? <img src={i.product_image} alt="" className="max-w-full max-h-full object-contain" />
                      : <span className="text-xl">🖥️</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{i.product_name}</p>
                    <p className="text-xs text-gray-400">{i.product_price.toLocaleString("fr-FR")} FCFA l’unité</p>
                  </div>
                  <span className="text-sm font-bold text-gray-700 flex-shrink-0">× {i.quantity}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Prix */}
          <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 space-y-1">
            {pack.savings > 0 && (
              <div className="flex justify-between text-sm text-gray-500">
                <span>Prix des produits séparément</span>
                <span className="line-through">{pack.regular_price.toLocaleString("fr-FR")} FCFA</span>
              </div>
            )}
            <div className="flex justify-between items-baseline">
              <span className="font-semibold text-gray-900">Prix du pack</span>
              <span className="text-xl font-black text-amber-600">{pack.price.toLocaleString("fr-FR")} FCFA</span>
            </div>
            {pack.savings > 0 && (
              <p className="text-right text-xs font-bold text-green-600">
                Vous économisez {pack.savings.toLocaleString("fr-FR")} FCFA ({pct} %)
              </p>
            )}
          </div>

          {/* Quantité + ajout */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 border rounded-xl px-2 py-1.5">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="p-1 hover:bg-gray-100 rounded-full" aria-label="Moins">
                <Minus size={14} />
              </button>
              <span className="w-6 text-center text-sm font-bold">{qty}</span>
              <button onClick={() => setQty((q) => Math.min(maxQty, q + 1))} className="p-1 hover:bg-gray-100 rounded-full" aria-label="Plus">
                <Plus size={14} />
              </button>
            </div>
            <button
              onClick={handleAdd}
              disabled={soldOut}
              className="flex-1 py-3 bg-gray-900 text-white rounded-xl font-bold text-sm hover:bg-gray-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {soldOut ? "Épuisé" : `Ajouter au panier — ${(pack.price * qty).toLocaleString("fr-FR")} FCFA`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
