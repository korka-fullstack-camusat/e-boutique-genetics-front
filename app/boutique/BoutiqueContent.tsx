"use client";
import { useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { X, ShoppingBag } from "lucide-react";
import { Product } from "@/lib/types";
import { ProductCard } from "@/components/ProductCard";
import { CartSidebar } from "@/components/CartSidebar";
import { ProductDetailModal } from "@/components/ProductDetailModal";
import { CheckoutModal } from "@/components/CheckoutModal";
import { Header } from "@/components/Header";

// ── Inner component (needs useSearchParams → Suspense) ─────────────────────────
function BoutiqueInner({ initialProducts }: { initialProducts: Product[] }) {
  const searchParams = useSearchParams();

  const [search, setSearch]         = useState(searchParams.get("search") ?? "");
  const [category, setCategory]     = useState(searchParams.get("category") ?? "");
  const [sousCategory, setSousCategory] = useState("");
  const [cartOpen, setCartOpen]     = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);

  // Catégories extraites des données déjà chargées (pas d'appel API)
  const categories    = useMemo(() => [...new Set(initialProducts.map((p) => p.category).filter(Boolean) as string[])], [initialProducts]);
  const sousCategories = useMemo(() => [...new Set(initialProducts.map((p) => p.sous_category).filter(Boolean) as string[])], [initialProducts]);

  // Filtrage 100% local — instantané, zéro appel réseau
  const products = useMemo(() => {
    const q = search.toLowerCase().trim();
    return initialProducts.filter((p) => {
      const matchSearch   = !q || p.name.toLowerCase().includes(q) || (p.description || "").toLowerCase().includes(q);
      const matchCat      = !category     || p.category === category;
      const matchSousCat  = !sousCategory || p.sous_category === sousCategory;
      return matchSearch && matchCat && matchSousCat;
    });
  }, [initialProducts, search, category, sousCategory]);

  function reset() { setSearch(""); setCategory(""); setSousCategory(""); }

  const hasFilters = search || category || sousCategory;

  const filters = (
    <>
      <select
        value={category}
        onChange={(e) => { setCategory(e.target.value); setSousCategory(""); }}
        className="text-xs border border-white/20 rounded-lg px-2 py-1.5 bg-white/10 text-white focus:outline-none focus:border-amber-400 cursor-pointer flex-shrink-0"
      >
        <option value="" className="text-gray-900">Toutes catégories</option>
        {categories.map((c) => <option key={c} value={c} className="text-gray-900">{c}</option>)}
      </select>

      <select
        value={sousCategory}
        onChange={(e) => setSousCategory(e.target.value)}
        className="text-xs border border-white/20 rounded-lg px-2 py-1.5 bg-white/10 text-white focus:outline-none focus:border-amber-400 cursor-pointer flex-shrink-0"
      >
        <option value="" className="text-gray-900">Toutes sous-catégories</option>
        {sousCategories.map((s) => <option key={s} value={s} className="text-gray-900">{s}</option>)}
      </select>

      {hasFilters && (
        <button
          onClick={reset}
          className="flex items-center gap-1 text-xs text-amber-400 border border-amber-400/40 px-2 py-1.5 rounded-lg hover:bg-amber-400/10 transition-colors flex-shrink-0 whitespace-nowrap"
        >
          <X size={11} /> Réinitialiser
        </button>
      )}
    </>
  );

  return (
    <>
      <Header
        searchValue={search}
        onSearchChange={setSearch}
        onCartOpen={() => setCartOpen(true)}
        hideLogin
        filterSlot={filters}
      />

      <div className="bg-gray-900 py-6 text-center border-t border-white/10">
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Notre <span className="text-amber-400">Boutique</span>
        </h1>
        <p className="text-white/50 text-sm mt-1">Tous nos produits disponibles</p>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <p className="text-sm text-gray-400 mb-4">
          {products.length} produit{products.length !== 1 ? "s" : ""} trouvé{products.length !== 1 ? "s" : ""}
        </p>

        {products.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <ShoppingBag size={48} strokeWidth={1} className="mx-auto mb-4" />
            <p className="text-lg font-medium">Aucun produit trouvé</p>
            <p className="text-sm mt-1">Essayez de modifier vos filtres</p>
            {hasFilters && (
              <button onClick={reset} className="mt-4 text-amber-600 font-semibold text-sm hover:underline">
                Réinitialiser les filtres
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} onDetail={setDetailProduct} />
            ))}
          </div>
        )}
      </main>

      <footer className="bg-gray-900 text-white/50 text-center py-8 mt-8">
        <p className="font-bold text-white tracking-widest uppercase text-sm">GROUPE GENETICS</p>
        <p className="text-xs mt-1">© 2024 — Tous droits réservés</p>
      </footer>

      <CartSidebar
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        onCheckout={() => { setCartOpen(false); setCheckoutOpen(true); }}
      />
      <ProductDetailModal product={detailProduct} onClose={() => setDetailProduct(null)} />
      <CheckoutModal open={checkoutOpen} onClose={() => setCheckoutOpen(false)} />
    </>
  );
}

// ── Skeleton affiché pendant l'hydratation (rare) ─────────────────────────────
function BoutiqueSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="rounded-xl overflow-hidden border border-gray-100 bg-white">
            <div className="aspect-square bg-gray-100 animate-pulse" />
            <div className="p-3 space-y-2">
              <div className="h-3 bg-gray-100 rounded animate-pulse w-3/4" />
              <div className="h-4 bg-gray-100 rounded animate-pulse w-1/2" />
              <div className="h-8 bg-gray-100 rounded-lg animate-pulse mt-2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Export public ─────────────────────────────────────────────────────────────
export function BoutiqueContent({ initialProducts }: { initialProducts: Product[] }) {
  return (
    <Suspense fallback={<BoutiqueSkeleton />}>
      <BoutiqueInner initialProducts={initialProducts} />
    </Suspense>
  );
}
