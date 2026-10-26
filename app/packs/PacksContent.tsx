"use client";
import { useState } from "react";
import Link from "next/link";
import { Package } from "lucide-react";
import { Pack } from "@/lib/types";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PackCard } from "@/components/PackCard";
import { PackDetailModal } from "@/components/PackDetailModal";
import { CartSidebar } from "@/components/CartSidebar";
import { CheckoutModal } from "@/components/CheckoutModal";

export function PacksContent({ initialPacks }: { initialPacks: Pack[] }) {
  const [cartOpen, setCartOpen]         = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [detailPack, setDetailPack]     = useState<Pack | null>(null);

  return (
    <>
      <Header onCartOpen={() => setCartOpen(true)} hideLogin />

      <div className="bg-gray-900 py-6 text-center border-t border-white/10">
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Nos <span className="text-amber-400">Packs</span>
        </h1>
        <p className="text-white/50 text-sm mt-1">Des solutions complètes à prix groupé</p>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {initialPacks.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <Package size={48} strokeWidth={1} className="mx-auto mb-4" />
            <p className="text-lg font-medium">Aucun pack disponible pour le moment</p>
            <Link href="/boutique" className="mt-4 inline-block text-amber-600 font-semibold text-sm hover:underline">
              Voir tous les produits
            </Link>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-400 mb-4">
              {initialPacks.length} pack{initialPacks.length > 1 ? "s" : ""} disponible{initialPacks.length > 1 ? "s" : ""}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
              {initialPacks.map((p) => <PackCard key={p.id} pack={p} onDetail={setDetailPack} />)}
            </div>
          </>
        )}
      </main>

      <Footer />

      <CartSidebar
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        onCheckout={() => { setCartOpen(false); setCheckoutOpen(true); }}
      />
      <PackDetailModal pack={detailPack} onClose={() => setDetailPack(null)} />
      <CheckoutModal open={checkoutOpen} onClose={() => setCheckoutOpen(false)} />
    </>
  );
}
