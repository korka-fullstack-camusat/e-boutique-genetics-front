"use client";
import { useState } from "react";
import { X, ShoppingCart } from "lucide-react";
import { Product } from "@/lib/types";
import { CategoryBadge, ConditionBadge, DisponibiliteBadge } from "./ui/Badge";
import { useCartStore } from "@/store/cartStore";
import toast from "react-hot-toast";

interface Props {
  product: Product | null;
  onClose: () => void;
}

export function ProductDetailModal({ product, onClose }: Props) {
  const [imgIdx, setImgIdx] = useState(0);
  const [imgError, setImgError] = useState(false);
  const addItem = useCartStore((s) => s.addItem);

  if (!product) return null;

  function selectImg(i: number) {
    setImgIdx(i);
    setImgError(false);
  }

  function handleAdd() {
    if (!product) return;
    addItem(product, 1);
    toast.success(`${product.name} ajouté au panier`);
    onClose();
  }

  const images = product.images?.length > 0 ? product.images : [];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/60">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-xl max-h-[92vh] overflow-y-auto shadow-2xl">

        {/* Header */}
        <div className="sticky top-0 bg-white px-5 py-4 border-b flex items-center justify-between z-10">
          <h2 className="text-base font-bold text-gray-900 truncate pr-4">{product.name}</h2>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-gray-100 flex-shrink-0">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-5">

          {/* ── Image principale ───────────────────────────────────────── */}
          <div className="aspect-square rounded-2xl overflow-hidden bg-white border border-gray-100">
            {images.length > 0 && !imgError ? (
              <img
                src={images[imgIdx]}
                alt={product.name}
                className="w-full h-full object-contain p-4"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-6xl text-gray-200 bg-gray-50">
                🖥️
              </div>
            )}
          </div>

          {/* ── Miniatures ─────────────────────────────────────────────── */}
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => selectImg(i)}
                  className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-colors ${
                    i === imgIdx ? "border-amber-500" : "border-gray-100 hover:border-gray-300"
                  }`}
                >
                  <img
                    src={img}
                    alt=""
                    className="w-full h-full object-contain p-1"
                    onError={(e) => { (e.target as HTMLImageElement).style.opacity = "0.2"; }}
                  />
                </button>
              ))}
            </div>
          )}

          {/* ── Infos ──────────────────────────────────────────────────── */}
          <div className="space-y-3">
            {/* Badges */}
            <div className="flex flex-wrap gap-1.5">
              <ConditionBadge condition={product.condition} />
              {product.disponibilite && <DisponibiliteBadge disponibilite={product.disponibilite} />}
              {product.category     && <CategoryBadge label={product.category} />}
              {product.sous_category && <CategoryBadge label={product.sous_category} />}
            </div>

            {/* Marque */}
            {product.marque && (
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{product.marque}</p>
            )}

            {/* Prix + stock */}
            <div className="flex items-center justify-between">
              <p className="text-2xl font-black text-amber-600">
                {product.price.toLocaleString("fr-FR")} <span className="text-base font-bold">FCFA</span>
              </p>
              <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${
                product.stock === 0 ? "bg-red-100 text-red-600"
                : product.stock <= 5 ? "bg-orange-100 text-orange-600"
                : "bg-green-100 text-green-700"
              }`}>
                {product.stock === 0 ? "✗ Épuisé"
                  : product.stock <= 5 ? `⚠ Plus que ${product.stock} en stock`
                  : "✓ En stock"}
              </span>
            </div>

            {/* Référence */}
            {product.reference && (
              <p className="text-xs text-gray-400 font-mono">Référence : <span className="font-semibold text-gray-600">{product.reference}</span></p>
            )}

            {/* Délai de livraison */}
            {product.disponibilite && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="font-semibold">Délai de livraison :</span>
                <DisponibiliteBadge disponibilite={product.disponibilite} />
              </div>
            )}

            {/* Description */}
            {product.description && (
              <p className="text-sm text-gray-600 leading-relaxed">{product.description}</p>
            )}
          </div>

          {/* ── Bouton ─────────────────────────────────────────────────── */}
          <button
            onClick={handleAdd}
            disabled={product.stock === 0}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-gray-900 text-white rounded-xl font-bold text-sm hover:bg-gray-700 transition-colors disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
          >
            <ShoppingCart size={17} />
            {product.stock === 0 ? "Épuisé" : "Ajouter au panier"}
          </button>

        </div>
      </div>
    </div>
  );
}
