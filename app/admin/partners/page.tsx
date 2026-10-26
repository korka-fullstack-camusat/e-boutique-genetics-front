"use client";
import { useEffect, useMemo, useState } from "react";
import { Handshake, X, Phone, Mail, MapPin, Trash2, Search } from "lucide-react";
import { partnersApi } from "@/lib/api";
import { PartnerApplication, PartnerStatus } from "@/lib/types";
import toast from "react-hot-toast";

const STATUS: Record<PartnerStatus, { label: string; cls: string }> = {
  nouveau:  { label: "Nouveau",  cls: "bg-amber-100 text-amber-800" },
  contacte: { label: "Contacté", cls: "bg-blue-100 text-blue-800" },
  valide:   { label: "Validé",   cls: "bg-green-100 text-green-800" },
  refuse:   { label: "Refusé",   cls: "bg-red-100 text-red-700" },
};

function StatusPill({ status }: { status: PartnerStatus }) {
  const s = STATUS[status] ?? STATUS.nouveau;
  return <span className={`text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${s.cls}`}>{s.label}</span>;
}

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });

export default function AdminPartnersPage() {
  const [apps, setApps]       = useState<PartnerApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<PartnerApplication | null>(null);
  const [filter, setFilter]   = useState<"" | PartnerStatus>("");
  const [search, setSearch]   = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    partnersApi.list()
      .then(setApps)
      .catch(() => toast.error("Impossible de charger les candidatures"))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return apps.filter((a) =>
      (!filter || a.status === filter) &&
      (!q || [a.full_name, a.company, a.city, a.email, a.phone].some((v) => (v || "").toLowerCase().includes(q)))
    );
  }, [apps, filter, search]);

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    apps.forEach((a) => { c[a.status] = (c[a.status] || 0) + 1; });
    return c;
  }, [apps]);

  async function changeStatus(app: PartnerApplication, status: PartnerStatus) {
    try {
      const updated = await partnersApi.updateStatus(app.id, status);
      setApps((as) => as.map((a) => (a.id === updated.id ? updated : a)));
      setSelected(updated);
      toast.success(`Statut : ${STATUS[status].label}`);
    } catch {
      toast.error("Erreur lors de la mise à jour");
    }
  }

  async function handleDelete(app: PartnerApplication) {
    try {
      await partnersApi.delete(app.id);
      setApps((as) => as.filter((a) => a.id !== app.id));
      setSelected(null);
      setConfirmDelete(false);
      toast.success("Candidature supprimée");
    } catch {
      toast.error("Erreur lors de la suppression");
    }
  }

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-gray-900">Partenaires installateurs</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {apps.length} candidature(s) · {counts.nouveau || 0} nouvelle(s) à traiter
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-4">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Nom, entreprise, ville, email…"
            className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-amber-500 bg-white"
          />
        </div>
        {(["", "nouveau", "contacte", "valide", "refuse"] as const).map((s) => (
          <button
            key={s || "all"}
            onClick={() => setFilter(s)}
            className={`text-xs font-semibold px-3 py-2 rounded-xl border transition-colors ${
              filter === s ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
            }`}
          >
            {s ? `${STATUS[s].label} (${counts[s] || 0})` : `Toutes (${apps.length})`}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Chargement...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <Handshake size={40} strokeWidth={1} className="mx-auto mb-3" />
            <p>{apps.length ? "Aucune candidature ne correspond." : "Aucune candidature pour le moment."}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="min-w-[640px]">
              <div className="grid grid-cols-[1.5fr_1fr_1.5fr_auto_auto] gap-3 bg-gray-50 border-b px-4 py-2.5">
                {["Candidat", "Ville", "Spécialités", "Reçue le", "Statut"].map((h) => (
                  <span key={h} className="text-xs font-bold text-gray-500 uppercase">{h}</span>
                ))}
              </div>
              {filtered.map((a) => (
                <div
                  key={a.id}
                  onClick={() => setSelected(a)}
                  className="grid grid-cols-[1.5fr_1fr_1.5fr_auto_auto] gap-3 items-center px-4 py-3 border-b last:border-b-0 hover:bg-amber-50 cursor-pointer"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-gray-900 truncate">{a.full_name}</p>
                    <p className="text-xs text-gray-400 truncate">{a.company || a.phone}</p>
                  </div>
                  <p className="text-sm text-gray-600 truncate">{a.city}</p>
                  <p className="text-xs text-gray-500 truncate">{a.specialties.join(", ")}</p>
                  <p className="text-xs text-gray-400 whitespace-nowrap">{fmtDate(a.created_at)}</p>
                  <StatusPill status={a.status} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Détail d'une candidature ─────────────────────────────────────── */}
      {selected && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => { setSelected(null); setConfirmDelete(false); }}>
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-gray-900">{selected.full_name}</h2>
                <p className="text-sm text-gray-500">{selected.company || "Indépendant"} · reçue le {fmtDate(selected.created_at)}</p>
              </div>
              <button onClick={() => { setSelected(null); setConfirmDelete(false); }} className="p-1.5 rounded-full hover:bg-gray-100"><X size={18} /></button>
            </div>

            <div className="p-6 space-y-4 text-sm">
              <div className="flex flex-wrap gap-2">
                <a href={`tel:${selected.phone}`} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-lg hover:bg-gray-200"><Phone size={13} /> {selected.phone}</a>
                <a href={`mailto:${selected.email}`} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-lg hover:bg-gray-200"><Mail size={13} /> {selected.email}</a>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-lg"><MapPin size={13} /> {selected.city}</span>
              </div>

              <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2">
                <dt className="text-gray-400">Spécialités</dt><dd className="font-medium">{selected.specialties.join(", ")}</dd>
                <dt className="text-gray-400">Zones</dt><dd>{selected.zones || "—"}</dd>
                <dt className="text-gray-400">Expérience</dt><dd>{selected.experience_years || "—"}</dd>
                <dt className="text-gray-400">Équipe</dt><dd>{selected.team_size || "—"}</dd>
                <dt className="text-gray-400">Certifications</dt><dd>{selected.certifications || "—"}</dd>
              </dl>

              {selected.message && (
                <div className="bg-gray-50 border rounded-xl p-3 whitespace-pre-wrap text-gray-700">{selected.message}</div>
              )}

              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Statut</p>
                <div className="flex flex-wrap gap-2">
                  {(Object.keys(STATUS) as PartnerStatus[]).map((s) => (
                    <button
                      key={s}
                      onClick={() => changeStatus(selected, s)}
                      className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors ${
                        selected.status === s ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                      }`}
                    >
                      {STATUS[s].label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t flex justify-end">
              {confirmDelete ? (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Supprimer définitivement ?</span>
                  <button onClick={() => setConfirmDelete(false)} className="px-3 py-1.5 text-sm border rounded-lg">Non</button>
                  <button onClick={() => handleDelete(selected)} className="px-3 py-1.5 text-sm bg-red-500 text-white rounded-lg font-semibold">Oui, supprimer</button>
                </div>
              ) : (
                <button onClick={() => setConfirmDelete(true)} className="inline-flex items-center gap-1.5 text-sm text-red-500 hover:text-red-700">
                  <Trash2 size={14} /> Supprimer
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
