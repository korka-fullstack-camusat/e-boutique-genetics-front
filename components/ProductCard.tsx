"use client";
import { Product } from "@/lib/types";
import { CategoryBadge } from "./ui/Badge";
import { useCartStore } from "@/store/cartStore";
import toast from "react-hot-toast";

interface Props {
  product: Product;
  onDetail: (p: Product) => void;
}

export function ProductCard({ product, onDetail }: Props) {
  const addItem = useCartStore((s) => s.addItem);

  const img = product.images?.[0];
  const hasOptions = product.sizes?.length > 0 || product.colors?.length > 0;

  function handleAdd(e: React.MouseEvent) {
    e.stopPropagation();
    if (hasOptions) {
      onDetail(product);
    } else {
      addItem(product, 1);
      toast.success(`${product.name} ajouté au panier`);
    }
  }

  return (
    <div
      className="group border border-gray-100 rounded-xl overflow-hidden bg-white cursor-pointer hover:-translate-y-1 hover:shadow-lg transition-all duration-200 flex flex-col"
      onClick={() => onDetail(product)}
    >
      {/* Image */}
      <div className="aspect-[3/4] bg-gray-50 overflow-hidden relative">
        {img ? (
          <img
            src={img}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl text-gray-200 bg-gradient-to-br from-gray-50 to-gray-100">
            🖥️
          </div>
        )}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-white text-black text-xs font-bold px-3 py-1 rounded-full">
              Épuisé
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col gap-1.5 flex-1">
        <div className="flex flex-wrap gap-1">
          {product.category && <CategoryBadge label={product.category} />}
          {product.sous_category && <CategoryBadge label={product.sous_category} />}
        </div>
        <h3 className="text-sm font-semibold leading-snug line-clamp-2 text-gray-900">
          {product.name}
        </h3>
        <p className="text-base font-bold text-amber-600 mt-auto">
          {product.price.toLocaleString("fr-FR")} FCFA
        </p>
        <button
          onClick={handleAdd}
          disabled={product.stock === 0}
          className="mt-1 w-full py-2 bg-gray-900 text-white rounded-lg text-sm font-semibold hover:bg-gray-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {product.stock === 0 ? "Épuisé" : hasOptions ? "Choisir" : "Ajouter"}
        </button>
      </div>
    </div>
  );
}
