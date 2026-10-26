"use client";
import { Package } from "lucide-react";
import { Pack } from "@/lib/types";
import { useCartStore } from "@/store/cartStore";
import toast from "react-hot-toast";

interface Props {
  pack: Pack;
  onDetail: (p: Pack) => void;
}

/** Pourcentage d'économie arrondi, ou 0 si le pack n'est pas moins cher. */
export function savingsPercent(pack: Pack): number {
  if (!pack.regular_price || pack.savings <= 0) return 0;
  return Math.round((pack.savings / pack.regular_price) * 100);
}

/** Image du pack, sinon les images de ses produits (mosaïque). */
export function PackVisual({ pack, className = "" }: { pack: Pack; className?: string }) {
  if (pack.images?.[0]) {
    return <img src={pack.images[0]} alt={pack.name} className={`w-full h-full object-contain p-3 ${className}`} />;
  }
  const imgs = pack.items.map((i) => i.product_image).filter(Boolean).slice(0, 4) as string[];
  if (imgs.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-50 to-gray-100">
        <Package size={48} strokeWidth={1} className="text-amber-500" />
      </div>
    );
  }
  return (
    <div className={`w-full h-full grid gap-1 p-2 ${imgs.length > 1 ? "grid-cols-2" : "grid-cols-1"} ${className}`}>
      {imgs.map((src, i) => (
        <div key={i} className="bg-white rounded-md overflow-hidden flex items-center justify-center">
          <img src={src} alt="" className="max-w-full max-h-full object-contain" />
        </div>
      ))}
    </div>
  );
}

export function PackCard({ pack, onDetail }: Props) {
  const addPack = useCartStore((s) => s.addPack);
  const pct = savingsPercent(pack);
  const soldOut = pack.stock === 0;

  function handleAdd(e: React.MouseEvent) {
    e.stopPropagation();
    addPack(pack, 1);
    toast.success(`Pack ${pack.name} ajouté au panier`);
  }

  return (
    <div
      className="group border-2 border-amber-200 rounded-xl overflow-hidden bg-white cursor-pointer hover:-translate-y-1 hover:shadow-lg transition-all duration-200 flex flex-col"
      onClick={() => onDetail(pack)}
    >
      <div className="aspect-square bg-white overflow-hidden relative border-b border-gray-100">
        <PackVisual pack={pack} className="group-hover:scale-105 transition-transform duration-300" />
        <div className="absolute top-2 left-2">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-gray-900 text-amber-400 uppercase tracking-wide">
            <Package size={11} /> Pack
          </span>
        </div>
        {pct > 0 && (
          <div className="absolute top-2 right-2">
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-red-500 text-white">-{pct} %</span>
          </div>
        )}
        {soldOut && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-white text-black text-xs font-bold px-3 py-1 rounded-full">Épuisé</span>
          </div>
        )}
      </div>

      <div className="p-3 flex flex-col gap-1 flex-1">
        <h3 className="text-sm font-semibold leading-snug line-clamp-2 text-gray-900">{pack.name}</h3>
        <p className="text-[11px] text-gray-500 line-clamp-2">
          {pack.items.map((i) => `${i.quantity}× ${i.product_name}`).join(" · ")}
        </p>
        <div className="mt-auto pt-1">
          {pack.savings > 0 && (
            <p className="text-xs text-gray-400 line-through">{pack.regular_price.toLocaleString("fr-FR")} FCFA</p>
          )}
          <p className="text-base font-bold text-amber-600">{pack.price.toLocaleString("fr-FR")} FCFA</p>
        </div>
        <button
          onClick={handleAdd}
          disabled={soldOut}
          className="mt-1 w-full py-2 bg-gray-900 text-white rounded-lg text-sm font-semibold hover:bg-gray-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {soldOut ? "Épuisé" : "Ajouter le pack"}
        </button>
      </div>
    </div>
  );
}
