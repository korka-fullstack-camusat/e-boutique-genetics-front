"use client";
import { useState, useEffect } from "react";
import { Trash2, ClipboardList, X } from "lucide-react";
import { surveysApi } from "@/lib/api";
import { Survey } from "@/lib/types";
import toast from "react-hot-toast";

export default function AdminSurveysPage() {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Survey | null>(null);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try { setSurveys(await surveysApi.list()); }
    finally { setLoading(false); }
  }

  async function handleDelete(s: Survey) {
    if (!confirm(`Supprimer le sondage de ${s.name} ?`)) return;
    try {
      await surveysApi.delete(s.id);
      setSurveys((prev) => prev.filter((x) => x.id !== s.id));
      if (selected?.id === s.id) setSelected(null);
      toast.success("Sondage supprimé");
    } catch { toast.error("Erreur suppression"); }
  }

  const FIELDS: { key: keyof Survey; label: string }[] = [
    { key: "name", label: "Nom" }, { key: "email", label: "Email" },
    { key: "age", label: "Âge" }, { key: "profession", label: "Profession" },
    { key: "style", label: "Style" }, { key: "brand", label: "Marque préférée" },
    { key: "hobbies", label: "Loisirs" }, { key: "monthly_budget", label: "Budget mensuel" },
    { key: "clothing_type", label: "Type de vêtement" }, { key: "suggestions", label: "Suggestions" },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Sondages</h1>
        <p className="text-sm text-gray-500 mt-0.5">{surveys.length} réponse(s)</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Chargement...</div>
        ) : surveys.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <ClipboardList size={40} strokeWidth={1} className="mx-auto mb-3" />
            <p>Aucune réponse pour le moment</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wide">Participant</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Style</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wide hidden md:table-cell">Budget</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Date</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody>
                {surveys.map((s) => (
                  <tr key={s.id} className="border-b last:border-b-0 hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => setSelected(s)}>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-gray-900">{s.name}</p>
                      <p className="text-xs text-gray-400">{s.email}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-600 hidden sm:table-cell">{s.style || "—"}</td>
                    <td className="px-4 py-3 text-gray-600 hidden md:table-cell">{s.monthly_budget || "—"}</td>
                    <td className="px-4 py-3 text-xs text-gray-400 hidden lg:table-cell">
                      {new Date(s.created_at).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleDelete(s)}
                        className="p-1.5 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white px-5 py-4 border-b flex items-center justify-between">
              <h2 className="text-lg font-bold">Sondage — {selected.name}</h2>
              <button onClick={() => setSelected(null)} className="p-1.5 rounded-full hover:bg-gray-100">
                <X size={18} />
              </button>
            </div>
            <div className="p-5 space-y-3">
              {FIELDS.map(({ key, label }) => selected[key] && (
                <div key={key} className="flex gap-3 text-sm">
                  <p className="text-gray-400 font-semibold w-32 flex-shrink-0">{label}</p>
                  <p className="text-gray-900">{String(selected[key])}</p>
                </div>
              ))}
              <p className="text-xs text-gray-400 pt-2 border-t">
                Répondu le {new Date(selected.created_at).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
