"use client";
import { useState } from "react";
import { ArrowRight, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { Product } from "@/lib/types";
import { ProductCard } from "@/components/ProductCard";
import { CartSidebar } from "@/components/CartSidebar";
import { ProductDetailModal } from "@/components/ProductDetailModal";
import { CheckoutModal } from "@/components/CheckoutModal";
import { ContactModal } from "@/components/ContactModal";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

interface Props {
  initialProducts: Product[];
}

export function HomeContent({ initialProducts }: Props) {
  const [cartOpen, setCartOpen]       = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);
  const [contactOpen, setContactOpen] = useState(false);

  return (
    <>
      <Header onCartOpen={() => setCartOpen(true)} hideMobileLogin />

      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <section className="relative bg-gray-900 overflow-hidden">
        <div
          className="absolute inset-0 opacity-20 bg-gradient-to-br from-amber-500 via-transparent to-transparent"
          aria-hidden
        />
        <div className="relative max-w-7xl mx-auto px-4 py-14 sm:py-24 text-center">
          <h1 className="hero-line hero-line-1 text-2xl sm:text-4xl lg:text-5xl font-black text-white leading-snug px-2">
            Le meilleur de la <span className="text-amber-400">technologie</span>, à portée de clic
          </h1>
          <p className="hero-line hero-line-2 text-white/70 mt-4 text-sm sm:text-lg max-w-xl mx-auto px-2">
            Acheter plus qu'un produit, investissez dans la performance.
          </p>
          <div className="hero-line hero-line-4 flex items-center justify-center gap-3 mt-8 flex-wrap px-4">
            <Link
              href="/boutique"
              className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-3.5 bg-amber-500 text-gray-900 rounded-full font-bold text-sm hover:bg-amber-400 transition-colors"
            >
              Commander <ArrowRight size={16} />
            </Link>
            <button
              onClick={() => setContactOpen(true)}
              className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-3.5 border-2 border-white/40 text-white rounded-full font-bold text-sm hover:bg-white/10 transition-colors"
            >
              Contactez-nous
            </button>
          </div>
        </div>
      </section>

      {/* ── Nouveautés ─────────────────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Nouveautés</h2>
            <p className="text-sm text-gray-400 mt-0.5">Les derniers articles ajoutés</p>
          </div>
          <Link
            href="/boutique"
            className="flex items-center gap-1.5 text-sm font-semibold text-amber-600 hover:text-amber-700 transition-colors"
          >
            Voir tout <ArrowRight size={14} />
          </Link>
        </div>

        {initialProducts.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <ShoppingBag size={40} strokeWidth={1} className="mx-auto mb-3" />
            <p>Aucun produit disponible pour le moment</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-5">
            {initialProducts.map((p) => (
              <ProductCard key={p.id} product={p} onDetail={setDetailProduct} />
            ))}
          </div>
        )}

        <div className="text-center mt-10">
          <Link
            href="/boutique"
            className="inline-flex items-center gap-2 px-10 py-3.5 border-2 border-gray-900 text-gray-900 rounded-full font-bold text-sm hover:bg-gray-900 hover:text-white transition-all"
          >
            Voir tous les produits <ArrowRight size={15} />
          </Link>
        </div>
      </main>

      <Footer />

      {/* ── Overlays ───────────────────────────────────────────────────── */}
      <CartSidebar
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        onCheckout={() => { setCartOpen(false); setCheckoutOpen(true); }}
      />
      <ProductDetailModal product={detailProduct} onClose={() => setDetailProduct(null)} />
      <CheckoutModal open={checkoutOpen} onClose={() => setCheckoutOpen(false)} />
      <ContactModal open={contactOpen} onClose={() => setContactOpen(false)} />
    </>
  );
}
