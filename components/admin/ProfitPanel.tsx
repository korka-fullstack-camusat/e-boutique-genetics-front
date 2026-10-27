"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Wallet, Coins, TrendingUp, Percent, AlertTriangle, Trophy } from "lucide-react";
import { statsApi } from "@/lib/api";
import { ProfitPeriod, ProfitStats } from "@/lib/types";

type PeriodKey = "month" | "previous_month" | "all";

const PERIODS: { key: PeriodKey; label: string }[] = [
  { key: "month", label: "Ce mois-ci" },
  { key: "previous_month", label: "Mois dernier" },
  { key: "all", label: "Depuis le début" },
];

const MONTHS = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."];
const fcfa = (n: number) => `${Math.round(n).toLocaleString("fr-FR")} F`;
const monthLabel = (key: string) => MONTHS[Number(key.slice(5, 7)) - 1] ?? key;

function Kpi({ label, value, sub, icon: Icon, tone }: {
  label: string; value: string; sub?: string; icon: React.ElementType; tone: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">{label}</p>
        <Icon size={16} className={tone} />
      </div>
      <p className="text-xl sm:text-2xl font-black text-gray-900">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

/** Variation en % par rapport à une période de référence, ou null si non calculable. */
function delta(current: number, previous: number): number | null {
  if (!previous) return null;
  return Math.round(((current - previous) / Math.abs(previous)) * 100);
}

export function ProfitPanel() {
  const [stats, setStats]   = useState<ProfitStats | null>(null);
  const [error, setError]   = useState(false);
  const [period, setPeriod] = useState<PeriodKey>("month");

  useEffect(() => {
    statsApi.profit().then(setStats).catch(() => setError(true));
  }, []);

  if (error) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-5 text-sm text-gray-500">
        Impossible de charger les indicateurs de bénéfice.
      </div>
    );
  }
  if (!stats) {
    return <div className="bg-white rounded-2xl border border-gray-100 h-40 animate-pulse" />;
  }

  const p: ProfitPeriod = stats.periods[period];
  const profitDelta = period === "month" ? delta(p.profit, stats.periods.previous_month.profit) : null;
  const maxBar = Math.max(1, ...stats.monthly.map((m) => Math.max(m.revenue, m.profit)));

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Bénéfice</h2>
          <p className="text-xs text-gray-400 mt-0.5">Commandes validées, expédiées ou livrées (hors attente et annulées)</p>
        </div>
        <div className="flex bg-gray-100 rounded-xl p-1">
          {PERIODS.map((x) => (
            <button
              key={x.key}
              onClick={() => setPeriod(x.key)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${period === x.key ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-800"}`}
            >
              {x.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Kpi label="Chiffre d'affaires" value={fcfa(p.revenue)} sub={`${p.orders} commande${p.orders > 1 ? "s" : ""}`} icon={Wallet} tone="text-amber-500" />
        <Kpi label="Coût d'achat" value={fcfa(p.cost)} sub="Prix d'achat des articles vendus" icon={Coins} tone="text-gray-400" />
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Bénéfice brut</p>
            <TrendingUp size={16} className="text-green-500" />
          </div>
          <p className={`text-xl sm:text-2xl font-black ${p.profit >= 0 ? "text-green-600" : "text-red-600"}`}>{fcfa(p.profit)}</p>
          <p className="text-xs text-gray-400 mt-1">
            {profitDelta === null ? "CA − coût d'achat" : (
              <span className={profitDelta >= 0 ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>
                {profitDelta >= 0 ? "+" : ""}{profitDelta} % vs mois dernier
              </span>
            )}
          </p>
        </div>
        <Kpi
          label="Marge"
          value={p.margin === null ? "—" : `${p.margin.toLocaleString("fr-FR")} %`}
          sub={p.margin === null ? "Aucun prix d'achat renseigné" : "Bénéfice / CA (articles avec prix d'achat)"}
          icon={Percent}
          tone="text-blue-500"
        />
      </div>

      {(p.revenue_without_cost > 0 || stats.products_without_cost > 0) && (
        <div className="flex gap-3 items-start bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm">
          <AlertTriangle size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-amber-900">
            {p.revenue_without_cost > 0 && (
              <p>
                <strong>{fcfa(p.revenue_without_cost)}</strong> de ventes sur cette période concernent des articles
                sans prix d&apos;achat : elles sont comptées dans le CA mais pas dans le bénéfice.
                {stats.missing_cost.length > 0 && (
                  <span className="block text-xs text-amber-800 mt-1">
                    Articles concernés : {stats.missing_cost.slice(0, 5).map((m) => m.name).join(", ")}
                    {stats.missing_cost.length > 5 ? "…" : ""}
                  </span>
                )}
              </p>
            )}
            {stats.products_without_cost > 0 && (
              <p className={p.revenue_without_cost > 0 ? "mt-2" : ""}>
                {stats.products_without_cost} produit{stats.products_without_cost > 1 ? "s" : ""} sur {stats.products_total} n&apos;ont
                pas encore de prix d&apos;achat.{" "}
                <Link href="/admin" className="font-semibold underline">Les renseigner dans Produits</Link>
              </p>
            )}
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-[2fr_1fr] gap-4">
        {/* Évolution sur 6 mois */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900 text-sm">6 derniers mois</h3>
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-amber-400" /> CA</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-green-500" /> Bénéfice</span>
            </div>
          </div>
          <div className="flex items-end gap-2 sm:gap-4 h-40">
            {stats.monthly.map((m) => (
              <div key={m.month} className="flex-1 flex flex-col items-center gap-1 h-full justify-end" title={`${monthLabel(m.month)} : CA ${fcfa(m.revenue)} · bénéfice ${fcfa(m.profit)}`}>
                <div className="flex items-end gap-1 w-full justify-center h-full">
                  <div className="w-1/3 max-w-5 bg-amber-400 rounded-t" style={{ height: `${(m.revenue / maxBar) * 100}%` }} />
                  <div className="w-1/3 max-w-5 bg-green-500 rounded-t" style={{ height: `${(Math.max(0, m.profit) / maxBar) * 100}%` }} />
                </div>
                <span className="text-[11px] text-gray-400">{monthLabel(m.month)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Produits les plus rentables */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="font-bold text-gray-900 text-sm mb-3 flex items-center gap-2">
            <Trophy size={15} className="text-amber-500" /> Plus rentables (total)
          </h3>
          {stats.top_products.length === 0 ? (
            <p className="text-xs text-gray-400">Renseignez les prix d&apos;achat pour voir les produits les plus rentables.</p>
          ) : (
            <ol className="space-y-2.5">
              {stats.top_products.map((t, i) => (
                <li key={t.name} className="flex items-center gap-2 text-sm">
                  <span className="w-5 text-xs font-bold text-gray-400">{i + 1}.</span>
                  <span className="flex-1 truncate text-gray-800" title={t.name}>{t.name}</span>
                  <span className="font-semibold text-green-600 whitespace-nowrap">{fcfa(t.profit)}</span>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </section>
  );
}
