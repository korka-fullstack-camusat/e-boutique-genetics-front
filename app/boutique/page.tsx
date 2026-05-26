"use client";
import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { X, ShoppingBag } from "lucide-react";
import { productsApi } from "@/lib/api";
import { Product } from "@/lib/types";
import { ProductCard } from "@/components/ProductCard";
import { CartSidebar } from "@/components/CartSidebar";
import { ProductDetailModal } from "@/components/ProductDetailModal";
import { CheckoutModal } from "@/components/CheckoutModal";
import { Header } from "@/components/Header";

function BoutiqueContent() {
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [category, setCategory] = useState(searchParams.get("category") ?? "");
  const [sousCategory, setSousCategory] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [sousCategories, setSousCategories] = useState<string[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);

  useEffect(() => {
    productsApi.list().then((all) => {
      setCategories([...new Set(all.map((p) => p.category).filter(Boolean) as string[])]);
      setSousCategories([...new Set(all.map((p) => p.sous_category).filter(Boolean) as string[])]);
    });
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await productsApi.list({
        category: category || undefined,
        sous_category: sousCategory || undefined,
        search: search || undefined,
      });
      setProducts(data);
    } finally {
      setLoading(false);
    }
  }, [category, sousCategory, search]);

  useEffect(() => {
    const t = setTimeout(load, 280);
    return () => clearTimeout(t);
  }, [load]);

  function reset() {
    setSearch("");
    setCategory("");
    setSousCategory("");
  }

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

      {/* ── Page title ─────────────────────────────────────────────────── */}
      <div className="bg-gray-900 py-6 text-center border-t border-white/10">
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Notre <span className="text-amber-400">Boutique</span>
        </h1>
        <p className="text-white/50 text-sm mt-1">Tous nos produits disponibles</p>
      </div>

      {/* ── Products grid ──────────────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {!loading && (
          <p className="text-sm text-gray-400 mb-4">
            {products.length} produit{products.length !== 1 ? "s" : ""} trouvé{products.length !== 1 ? "s" : ""}
          </p>
        )}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-xl overflow-hidden">
                <div className="aspect-[3/4] bg-gray-100 animate-pulse" />
                <div className="p-3 space-y-2">
                  <div className="h-3 bg-gray-100 rounded animate-pulse w-3/4" />
                  <div className="h-4 bg-gray-100 rounded animate-pulse w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
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


      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <footer className="bg-gray-900 text-white/50 text-center py-8 mt-8">
        <p className="font-bold text-white tracking-widest uppercase text-sm">GROUPE GENETICS</p>
        <p className="text-xs mt-1">© 2024 — Tous droits réservés</p>
      </footer>

      {/* ── Overlays ───────────────────────────────────────────────────── */}
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

export default function BoutiquePage() {
  return (
    <Suspense>
      <BoutiqueContent />
    </Suspense>
  );
}
