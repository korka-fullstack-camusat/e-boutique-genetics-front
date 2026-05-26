"use client";
import { useState } from "react";
import { X } from "lucide-react";
import { Product } from "@/lib/types";
import { CategoryBadge } from "./ui/Badge";
import { useCartStore } from "@/store/cartStore";
import toast from "react-hot-toast";

interface Props {
  product: Product | null;
  onClose: () => void;
}

export function ProductDetailModal({ product, onClose }: Props) {
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [imgIdx, setImgIdx] = useState(0);
  const addItem = useCartStore((s) => s.addItem);

  if (!product) return null;

  function handleAdd() {
    if (!product) return;
    if (product.sizes?.length > 0 && !selectedSize) {
      toast.error("Veuillez choisir une taille");
      return;
    }
    if (product.colors?.length > 0 && !selectedColor) {
      toast.error("Veuillez choisir une couleur");
      return;
    }
    addItem(product, 1, selectedSize, selectedColor);
    toast.success(`${product.name} ajouté au panier`);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="sticky top-0 bg-white px-5 py-4 border-b flex items-center justify-between z-10">
          <h2 className="text-lg font-bold truncate pr-4">{product.name}</h2>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-gray-100 flex-shrink-0">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Images */}
          <div>
            <div className="aspect-[3/4] rounded-xl overflow-hidden bg-gray-50">
              {product.images?.length > 0 ? (
                <img src={product.images[imgIdx]} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-6xl bg-gray-100">👕</div>
              )}
            </div>
            {product.images?.length > 1 && (
              <div className="flex gap-2 mt-2">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setImgIdx(i)}
                    className={`w-14 h-16 rounded-lg overflow-hidden border-2 transition-colors ${i === imgIdx ? "border-amber-500" : "border-transparent"}`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-1.5">
              {product.category && <CategoryBadge label={product.category} />}
              {product.sous_category && <CategoryBadge label={product.sous_category} />}
            </div>

            <p className="text-2xl font-bold text-amber-600">
              {product.price.toLocaleString("fr-FR")} FCFA
            </p>

            {product.description && (
              <p className="text-sm text-gray-600 leading-relaxed">{product.description}</p>
            )}

            {product.sizes?.length > 0 && (
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Taille</p>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSelectedSize(s)}
                      className={`px-4 py-1.5 rounded-lg border text-sm font-medium transition-all ${selectedSize === s ? "bg-gray-900 text-white border-gray-900" : "border-gray-200 hover:border-gray-900"}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {product.colors?.length > 0 && (
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Couleur</p>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((c) => (
                    <button
                      key={c}
                      onClick={() => setSelectedColor(c)}
                      className={`px-4 py-1.5 rounded-lg border text-sm font-medium transition-all ${selectedColor === c ? "bg-gray-900 text-white border-gray-900" : "border-gray-200 hover:border-gray-900"}`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <p className={`text-xs font-medium ${product.stock > 0 ? "text-green-600" : "text-red-500"}`}>
              {product.stock > 0 ? `✓ En stock (${product.stock})` : "✗ Épuisé"}
            </p>

            <button
              onClick={handleAdd}
              disabled={product.stock === 0}
              className="mt-auto w-full py-3.5 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Ajouter au panier
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
