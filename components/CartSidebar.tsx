"use client";
import { X, Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useCartStore } from "@/store/cartStore";

interface Props {
  open: boolean;
  onClose: () => void;
  onCheckout: () => void;
}

export function CartSidebar({ open, onClose, onCheckout }: Props) {
  const { items, removeItem, updateQty, total, count } = useCartStore();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] flex flex-col shadow-2xl animate-in">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b flex-shrink-0">
          <div className="flex items-center gap-2">
            <ShoppingBag size={20} />
            <h2 className="text-lg font-bold">Mon Panier</h2>
            {count() > 0 && (
              <span className="bg-amber-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {count()}
              </span>
            )}
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-gray-100 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 py-12">
              <ShoppingBag size={48} strokeWidth={1} />
              <p className="mt-3 font-medium">Votre panier est vide</p>
              <p className="text-sm mt-1">Ajoutez des articles pour commencer</p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item, idx) => (
                <div key={idx} className="flex gap-3 py-3 border-b last:border-b-0">
                  <div className="w-16 h-20 rounded-lg overflow-hidden bg-gray-50 flex-shrink-0">
                    {item.product.images?.[0] ? (
                      <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl bg-gray-100">🖥️</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{item.product.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {[item.size && `T: ${item.size}`, item.color && `C: ${item.color}`].filter(Boolean).join(" | ") || ""}
                    </p>
                    <p className="text-sm font-bold text-amber-600 mt-1">
                      {(item.product.price * item.quantity).toLocaleString("fr-FR")} FCFA
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => updateQty(idx, item.quantity - 1)}
                        className="w-6 h-6 rounded-full border border-gray-200 flex items-center justify-center hover:border-gray-900 hover:bg-gray-900 hover:text-white transition-colors"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="text-sm font-semibold w-6 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQty(idx, item.quantity + 1)}
                        className="w-6 h-6 rounded-full border border-gray-200 flex items-center justify-center hover:border-gray-900 hover:bg-gray-900 hover:text-white transition-colors"
                      >
                        <Plus size={12} />
                      </button>
                      <button
                        onClick={() => removeItem(idx)}
                        className="ml-auto p-1 text-red-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="px-5 py-4 border-t bg-white flex-shrink-0">
            <div className="flex justify-between items-center mb-4">
              <span className="font-semibold text-gray-700">Total</span>
              <span className="text-xl font-bold text-amber-600">
                {total().toLocaleString("fr-FR")} FCFA
              </span>
            </div>
            <button
              onClick={onCheckout}
              className="w-full py-3.5 bg-gray-900 text-white rounded-xl font-bold text-sm hover:bg-gray-700 transition-colors"
            >
              Commander →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
