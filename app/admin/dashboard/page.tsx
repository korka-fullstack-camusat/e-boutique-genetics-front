"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ShoppingCart, Package, TrendingUp, Clock, ArrowRight, CheckCircle2, XCircle } from "lucide-react";
import { productsApi, ordersApi } from "@/lib/api";
import { Order, Product } from "@/lib/types";
import Link from "next/link";

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending:   { label: "En attente",  color: "bg-yellow-100 text-yellow-700" },
  confirmed: { label: "Confirmé",    color: "bg-blue-100 text-blue-700" },
  shipped:   { label: "Expédié",     color: "bg-purple-100 text-purple-700" },
  delivered: { label: "Livré",       color: "bg-green-100 text-green-700" },
  cancelled: { label: "Annulé",      color: "bg-red-100 text-red-600" },
};

export default function DashboardPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([ordersApi.list(), productsApi.list()])
      .then(([o, p]) => { setOrders(o); setProducts(p); })
      .finally(() => setLoading(false));
  }, []);

  const stats = {
    totalOrders:   orders.length,
    pending:       orders.filter((o) => o.status === "pending").length,
    delivered:     orders.filter((o) => o.status === "delivered").length,
    cancelled:     orders.filter((o) => o.status === "cancelled").length,
    revenue:       orders.filter((o) => o.status !== "cancelled").reduce((s, o) => s + o.total_amount, 0),
    totalProducts: products.length,
    outOfStock:    products.filter((p) => p.stock === 0).length,
  };

  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 8);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 h-24 animate-pulse" />
          ))}
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 h-64 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
        <p className="text-sm text-gray-500 mt-0.5">Vue d'ensemble de votre boutique</p>
      </div>

      {/* ── Stat cards ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Commandes</p>
            <ShoppingCart size={16} className="text-amber-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-gray-900">{stats.totalOrders}</p>
          <p className="text-xs text-yellow-600 mt-1 font-medium">{stats.pending} en attente</p>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Revenus</p>
            <TrendingUp size={16} className="text-green-500" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-gray-900">
            {stats.revenue.toLocaleString("fr-FR")}
          </p>
          <p className="text-xs text-gray-400 mt-1">FCFA</p>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Livrées</p>
            <CheckCircle2 size={16} className="text-green-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-green-600">{stats.delivered}</p>
          <p className="text-xs text-red-500 mt-1 font-medium">{stats.cancelled} annulée{stats.cancelled !== 1 ? "s" : ""}</p>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Produits</p>
            <Package size={16} className="text-blue-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-gray-900">{stats.totalProducts}</p>
          {stats.outOfStock > 0 && (
            <p className="text-xs text-red-500 mt-1 font-medium">{stats.outOfStock} épuisé{stats.outOfStock !== 1 ? "s" : ""}</p>
          )}
        </div>
      </div>

      {/* ── Recent orders ─────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-amber-500" />
            <h2 className="font-bold text-gray-900">Dernières commandes</h2>
          </div>
          <Link
            href="/admin/orders"
            className="flex items-center gap-1 text-xs font-semibold text-amber-600 hover:text-amber-700 transition-colors"
          >
            Voir tout <ArrowRight size={12} />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="p-10 text-center text-gray-400">
            <ShoppingCart size={36} strokeWidth={1} className="mx-auto mb-3" />
            <p className="text-sm">Aucune commande pour le moment</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {recentOrders.map((o) => {
              const st = STATUS_LABELS[o.status] ?? { label: o.status, color: "bg-gray-100 text-gray-600" };
              return (
                <div
                  key={o.id}
                  onClick={() => router.push("/admin/orders")}
                  className="flex items-center gap-3 px-5 py-3.5 hover:bg-amber-50 cursor-pointer transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-gray-400">#{o.id}</span>
                      <p className="text-sm font-semibold text-gray-900 truncate">{o.customer_name}</p>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5 truncate">{o.customer_email}</p>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    <p className="text-sm font-bold text-amber-600 hidden sm:block">
                      {o.total_amount.toLocaleString("fr-FR")} F
                    </p>
                    <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full whitespace-nowrap ${st.color}`}>
                      {st.label}
                    </span>
                    <p className="text-xs text-gray-400 hidden md:block">
                      {new Date(o.created_at).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
