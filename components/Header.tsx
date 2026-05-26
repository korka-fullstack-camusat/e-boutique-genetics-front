"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, ShoppingBag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/store/cartStore";
import { LoginModal } from "./LoginModal";

interface Props {
  searchValue?: string;
  onSearchChange?: (val: string) => void;
  onCartOpen?: () => void;
  hideLogin?: boolean;
  hideMobileLogin?: boolean;
  filterSlot?: React.ReactNode;
}

export function Header({ searchValue, onSearchChange, onCartOpen, hideLogin, hideMobileLogin, filterSlot }: Props) {
  const router = useRouter();
  const [loginOpen, setLoginOpen] = useState(false);
  const [localSearch, setLocalSearch] = useState(searchValue ?? "");
  const cartCount = useCartStore((s) => s.count());
  const [mounted, setMounted] = useState(false);
  const redirectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { setMounted(true); }, []);

  function handleChange(val: string) {
    setLocalSearch(val);
    if (onSearchChange) {
      onSearchChange(val);
    } else {
      if (redirectTimer.current) clearTimeout(redirectTimer.current);
      redirectTimer.current = setTimeout(() => {
        router.push(`/boutique${val ? `?search=${encodeURIComponent(val)}` : ""}`);
      }, 400);
    }
  }

  useEffect(() => {
    return () => {
      if (redirectTimer.current) clearTimeout(redirectTimer.current);
    };
  }, []);

  return (
    <>
      <header className="sticky top-0 z-30 bg-gray-900 shadow-lg">
        <div className="w-full max-w-7xl mx-auto px-3 sm:px-4">

          {/* ── Main row ─────────────────────────────────────────────── */}
          <div className="h-14 sm:h-16 flex items-center gap-2 sm:gap-4">

            {/* Logo + brand */}
            <Link href="/" className="flex items-center gap-2 flex-shrink-0 group">
              <Image
                src="/logo.png"
                alt="Groupe Genetics"
                width={52}
                height={52}
                className="object-contain hidden sm:block w-14 h-14"
                priority
              />
              <span className="text-white font-bold text-sm sm:text-base tracking-wide group-hover:text-amber-400 transition-colors whitespace-nowrap">
                E-Boutique
              </span>
            </Link>

            {/* Search bar — desktop: filters inline to the right */}
            <div className="flex-1 flex items-center gap-2 min-w-0">
              <div className="relative flex-1">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  size={14}
                />
                <input
                  type="text"
                  value={localSearch}
                  onChange={(e) => handleChange(e.target.value)}
                  placeholder="Rechercher un produit..."
                  className="w-full pl-8 pr-3 py-2 bg-white/10 border border-white/20 rounded-full text-white text-sm placeholder-white/40 focus:outline-none focus:border-amber-400 transition-colors"
                />
              </div>
              {/* Filters inline — desktop only */}
              {filterSlot && (
                <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
                  {filterSlot}
                </div>
              )}
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              {onCartOpen && (
                <button
                  onClick={onCartOpen}
                  className="relative text-white p-2 hover:opacity-80 transition-opacity"
                  aria-label="Panier"
                >
                  <ShoppingBag size={22} />
                  {mounted && cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-[10px] font-bold min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1">
                      {cartCount}
                    </span>
                  )}
                </button>
              )}
              {!hideLogin && (
                <button
                  onClick={() => setLoginOpen(true)}
                  className={`text-xs sm:text-sm font-semibold text-white border border-white/30 px-3 sm:px-4 py-1.5 rounded-lg hover:bg-white/10 transition-colors whitespace-nowrap ${hideMobileLogin ? "hidden sm:block" : ""}`}
                >
                  Se connecter
                </button>
              )}
            </div>
          </div>

          {/* ── Filter row — mobile only ──────────────────────────────── */}
          {filterSlot && (
            <div className="flex sm:hidden items-center gap-2 pb-2.5 overflow-x-auto">
              {filterSlot}
            </div>
          )}

        </div>
      </header>

      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
    </>
  );
}
