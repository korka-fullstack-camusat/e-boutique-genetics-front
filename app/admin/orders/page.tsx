"use client";
import { useState, useEffect, useMemo } from "react";
import { ShoppingCart, Eye, X, CheckCircle, XCircle, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { ordersApi } from "@/lib/api";
import { Order } from "@/lib/types";
import toast from "react-hot-toast";

const STATUS_STYLES: Record<string, string> = {
  pending:   "bg-yellow-100 text-yellow-700",
  confirmed: "bg-blue-100 text-blue-700",
  shipped:   "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-600",
};

const STATUS_LABELS: Record<string, string> = {
  pending:   "En attente",
  confirmed: "Confirmé",
  shipped:   "Expédié",
  delivered: "Livré",
  cancelled: "Annulé",
};

const PAGE_SIZE = 10;

export default function AdminOrdersPage() {
  const [orders, setOrders]   = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Order | null>(null);
  const [updating, setUpdating] = useState(false);

  // Filtres
  const [search, setSearch]         = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [page, setPage]             = useState(1);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try { setOrders(await ordersApi.list()); }
    finally { setLoading(false); }
  }

  async function handleAction(status: "confirmed" | "cancelled") {
    if (!selected) return;
    setUpdating(true);
    try {
      const updated = await ordersApi.updateStatus(selected.id, { status });
      setOrders((prev) => prev.map((o) => (o.id === selected.id ? updated : o)));
      setSelected(updated);
      toast.success(status === "confirmed" ? "Commande validée ✓" : "Commande rejetée");
    } catch {
      toast.error("Erreur mise à jour");
    } finally {
      setUpdating(false);
    }
  }

  const stats = {
    total:     orders.length,
    pending:   orders.filter((o) => o.status === "pending").length,
    delivered: orders.filter((o) => o.status === "delivered").length,
    revenue:   orders.filter((o) => o.status !== "cancelled").reduce((s, o) => s + o.total_amount, 0),
  };

  // ── Filtrage + pagination ──────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return orders.filter((o) => {
      const q = search.toLowerCase();
      const matchSearch =
        !search ||
        String(o.id).includes(q) ||
        o.customer_name.toLowerCase().includes(q) ||
        o.customer_email.toLowerCase().includes(q);
      const matchStatus = !filterStatus || o.status === filterStatus;
      return matchSearch && matchStatus;
    });
  }, [orders, search, filterStatus]);

  const totalPages  = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated   = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  function resetFilters() {
    setSearch(""); setFilterStatus(""); setPage(1);
  }

  const hasFilters = search || filterStatus;
  const isPending  = selected?.status === "pending";

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Gestion des commandes</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {hasFilters ? `${filtered.length} / ${orders.length}` : orders.length} commande(s)
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total",      value: stats.total,                                  color: "text-gray-900" },
          { label: "En attente", value: stats.pending,                                color: "text-yellow-600" },
          { label: "Livrées",    value: stats.delivered,                              color: "text-green-600" },
          { label: "Revenus",    value: `${stats.revenue.toLocaleString("fr-FR")} F`, color: "text-amber-600" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <p className="text-xs font-bold text-gray-400 uppercase">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* ── Barre de recherche + filtres ──────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2 mb-4">

        {/* Search */}
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Rechercher par client, email, #ID..."
            className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-amber-500 transition-colors bg-white"
          />
        </div>

        {/* Filtre statut */}
        <select
          value={filterStatus}
          onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
          className="text-sm border border-gray-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:border-amber-500 transition-colors cursor-pointer"
        >
          <option value="">Tous les statuts</option>
          {Object.entries(STATUS_LABELS).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>

        {hasFilters && (
          <button
            onClick={resetFilters}
            className="flex items-center gap-1 text-sm text-red-500 hover:text-red-700 px-2 py-2 transition-colors"
          >
            <X size={14} /> Réinitialiser
          </button>
        )}
      </div>

      {/* ── Table ──────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Chargement...</div>
        ) : paginated.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <ShoppingCart size={40} strokeWidth={1} className="mx-auto mb-3" />
            <p>{hasFilters ? "Aucune commande ne correspond à votre recherche." : "Aucune commande pour le moment"}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">#</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Client</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase hidden sm:table-cell">Total</th>
                  <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase">Statut</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase hidden lg:table-cell">Date</th>
                  <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase">Détails</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((o) => (
                  <tr
                    key={o.id}
                    onClick={() => setSelected(o)}
                    className="border-b last:border-b-0 hover:bg-amber-50 transition-colors cursor-pointer"
                  >
                    <td className="px-4 py-3 text-gray-400 font-mono text-xs">#{o.id}</td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-gray-900">{o.customer_name}</p>
                      <p className="text-xs text-gray-400">{o.customer_email}</p>
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-amber-600 hidden sm:table-cell">
                      {o.total_amount.toLocaleString("fr-FR")} F
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_STYLES[o.status] ?? "bg-gray-100 text-gray-600"}`}>
                        {STATUS_LABELS[o.status] ?? o.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400 hidden lg:table-cell">
                      {new Date(o.created_at).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={(e) => { e.stopPropagation(); setSelected(o); }}
                        className="p-1.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        <Eye size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Pagination ──────────────────────────────────────────────────────── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 px-1">
          <p className="text-sm text-gray-400">
            Page {currentPage} sur {totalPages} · {filtered.length} résultat{filtered.length !== 1 ? "s" : ""}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={15} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((n) => n === 1 || n === totalPages || Math.abs(n - currentPage) <= 1)
              .reduce<(number | "...")[]>((acc, n, i, arr) => {
                if (i > 0 && n - (arr[i - 1] as number) > 1) acc.push("...");
                acc.push(n);
                return acc;
              }, [])
              .map((n, i) =>
                n === "..." ? (
                  <span key={`dots-${i}`} className="px-1 text-gray-400 text-sm">…</span>
                ) : (
                  <button
                    key={n}
                    onClick={() => setPage(n as number)}
                    className={`w-8 h-8 rounded-lg text-sm font-semibold transition-colors ${
                      currentPage === n ? "bg-gray-900 text-white" : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {n}
                  </button>
                )
              )}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      )}

      {/* ── Détail commande ───────────────────────────────────────────────── */}
      {selected && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-end sm:items-center justify-center sm:p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg max-h-[92vh] overflow-y-auto shadow-2xl">

            {/* Header modal */}
            <div className="sticky top-0 bg-white px-5 py-4 border-b flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-gray-900">Commande #{selected.id}</h2>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_STYLES[selected.status] ?? "bg-gray-100 text-gray-600"}`}>
                  {STATUS_LABELS[selected.status] ?? selected.status}
                </span>
              </div>
              <button onClick={() => setSelected(null)} className="p-1.5 rounded-full hover:bg-gray-100">
                <X size={18} />
              </button>
            </div>

            <div className="p-5 space-y-5">

              {/* Infos client */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Client",    value: selected.customer_name },
                  { label: "Email",     value: selected.customer_email },
                  { label: "Téléphone", value: selected.customer_phone || "—" },
                  { label: "Adresse",   value: selected.customer_address || "—" },
                  { label: "Paiement",  value: selected.payment_method },
                  { label: "Date",      value: new Date(selected.created_at).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" }) },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-gray-50 rounded-xl p-3">
                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">{label}</p>
                    <p className="text-sm font-semibold text-gray-800 truncate">{value}</p>
                  </div>
                ))}
              </div>

              {/* Articles */}
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase mb-3">Articles commandés</p>
                <div className="space-y-2">
                  {selected.items.map((item) => (
                    <div key={item.id} className="flex justify-between items-center bg-gray-50 rounded-xl p-3">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{item.product_name}</p>
                        <p className="text-xs text-gray-400 mt-0.5">Qté : {item.quantity}</p>
                      </div>
                      <p className="font-bold text-amber-600 text-sm">{(item.price * item.quantity).toLocaleString("fr-FR")} F</p>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between font-black text-base mt-3 pt-3 border-t">
                  <span>Total</span>
                  <span className="text-amber-600">{selected.total_amount.toLocaleString("fr-FR")} FCFA</span>
                </div>
              </div>

              {/* Boutons action */}
              {isPending ? (
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <button
                    onClick={() => handleAction("confirmed")}
                    disabled={updating}
                    className="flex items-center justify-center gap-2 py-3 bg-green-500 text-white rounded-xl font-bold text-sm hover:bg-green-600 transition-colors disabled:opacity-60"
                  >
                    <CheckCircle size={16} /> Valider
                  </button>
                  <button
                    onClick={() => handleAction("cancelled")}
                    disabled={updating}
                    className="flex items-center justify-center gap-2 py-3 bg-red-500 text-white rounded-xl font-bold text-sm hover:bg-red-600 transition-colors disabled:opacity-60"
                  >
                    <XCircle size={16} /> Rejeter
                  </button>
                </div>
              ) : (
                <div className={`flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold ${STATUS_STYLES[selected.status]}`}>
                  {STATUS_LABELS[selected.status]}
                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
