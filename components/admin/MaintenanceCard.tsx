"use client";
import { useEffect, useState } from "react";
import { Wrench, Loader2, ExternalLink } from "lucide-react";
import { settingsApi, revalidateApi } from "@/lib/api";
import { MaintenanceSetting } from "@/lib/types";
import toast from "react-hot-toast";

/** Interrupteur du mode maintenance : masque les pages publiques, l'administration reste accessible. */
export function MaintenanceCard() {
  const [state, setState]     = useState<MaintenanceSetting | null>(null);
  const [message, setMessage] = useState("");
  const [confirm, setConfirm] = useState<null | boolean>(null);   // valeur à appliquer après confirmation
  const [saving, setSaving]   = useState(false);

  useEffect(() => {
    settingsApi.maintenance()
      .then((m) => { setState(m); setMessage(m.message); })
      .catch(() => toast.error("Impossible de lire l'état de maintenance"));
  }, []);

  async function apply(enabled: boolean) {
    setSaving(true);
    try {
      const m = await settingsApi.setMaintenance({ enabled, message });
      setState(m);
      setMessage(m.message);
      revalidateApi.refresh();
      toast.success(enabled ? "Boutique en maintenance" : "Boutique de nouveau en ligne");
    } catch {
      toast.error("Erreur lors de la mise à jour");
    } finally {
      setSaving(false);
      setConfirm(null);
    }
  }

  async function saveMessage() {
    if (!state) return;
    setSaving(true);
    try {
      const m = await settingsApi.setMaintenance({ enabled: state.enabled, message });
      setState(m);
      setMessage(m.message);
      revalidateApi.refresh();
      toast.success("Message enregistré");
    } catch {
      toast.error("Erreur lors de l'enregistrement");
    } finally {
      setSaving(false);
    }
  }

  const enabled = !!state?.enabled;

  return (
    <div className={`rounded-2xl border shadow-sm p-5 mb-5 ${enabled ? "bg-amber-50 border-amber-300" : "bg-white border-gray-100"}`}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3 min-w-0">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${enabled ? "bg-amber-500 text-white" : "bg-gray-100 text-gray-500"}`}>
            <Wrench size={18} />
          </div>
          <div className="min-w-0">
            <h2 className="font-bold text-gray-900">Mode maintenance</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {state === null
                ? "Chargement…"
                : enabled
                  ? "Actif : les visiteurs voient uniquement le message de maintenance et les commandes sont suspendues. L’administration fonctionne normalement."
                  : "Inactif : la boutique est accessible normalement."}
            </p>
          </div>
        </div>

        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          aria-label="Activer le mode maintenance"
          disabled={state === null || saving}
          onClick={() => setConfirm(!enabled)}
          className={`relative inline-flex h-7 w-12 flex-shrink-0 items-center rounded-full transition-colors disabled:opacity-50 ${enabled ? "bg-amber-500" : "bg-gray-300"}`}
        >
          <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${enabled ? "translate-x-6" : "translate-x-1"}`} />
        </button>
      </div>

      {state !== null && (
        <div className="mt-4">
          <label className="block text-xs font-semibold text-gray-600 mb-1">Message affiché aux visiteurs</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={500}
            rows={2}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-amber-500 resize-none bg-white"
          />
          <div className="flex items-center justify-between mt-2">
            <a href="/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-800">
              Voir la page d’accueil <ExternalLink size={12} />
            </a>
            {message.trim() !== state.message && (
              <button onClick={saveMessage} disabled={saving} className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-gray-900 text-white hover:bg-gray-700 disabled:opacity-60">
                Enregistrer le message
              </button>
            )}
          </div>
        </div>
      )}

      {confirm !== null && (
        <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6 text-center">
            <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 ${confirm ? "bg-amber-100" : "bg-green-100"}`}>
              <Wrench size={24} className={confirm ? "text-amber-600" : "text-green-600"} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">
              {confirm ? "Mettre la boutique en maintenance ?" : "Remettre la boutique en ligne ?"}
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              {confirm
                ? "Les visiteurs ne verront plus que le message de maintenance et ne pourront plus commander. Vous gardez l’accès à l’administration."
                : "La boutique redeviendra accessible à tous les visiteurs."}
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirm(null)} className="flex-1 py-2.5 border border-gray-200 rounded-xl font-semibold text-sm text-gray-600">
                Annuler
              </button>
              <button
                onClick={() => apply(confirm)}
                disabled={saving}
                className={`flex-1 py-2.5 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 disabled:opacity-60 ${confirm ? "bg-amber-500 hover:bg-amber-600" : "bg-green-600 hover:bg-green-700"}`}
              >
                {saving && <Loader2 size={15} className="animate-spin" />}
                {confirm ? "Activer" : "Désactiver"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
