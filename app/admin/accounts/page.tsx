"use client";
import { useState, useEffect, useMemo } from "react";
import {
  Users, Plus, X, Trash2, Eye, EyeOff, Search,
  ShieldCheck, ShieldAlert, KeyRound, Settings2,
} from "lucide-react";
import { adminUsersApi } from "@/lib/api";
import { AdminUser } from "@/lib/types";
import toast from "react-hot-toast";

const ROLE_STYLES: Record<string, string> = {
  superadmin: "bg-amber-100 text-amber-700",
  admin:      "bg-blue-100 text-blue-700",
};
const ROLE_LABELS: Record<string, string> = {
  superadmin: "Super Admin",
  admin:      "Admin",
};

const EMPTY_FORM = { name: "", email: "", password: "", role: "admin" };

export default function AdminAccountsPage() {
  const [admins, setAdmins]   = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtres
  const [search, setSearch]           = useState("");
  const [filterRole, setFilterRole]   = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  // Modals
  const [createOpen, setCreateOpen]     = useState(false);
  const [managedAdmin, setManagedAdmin] = useState<AdminUser | null>(null);
  const [detailAdmin, setDetailAdmin]   = useState<AdminUser | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);
  const [resetTarget, setResetTarget]   = useState<AdminUser | null>(null);

  // États formulaire création
  const [form, setForm]       = useState(EMPTY_FORM);
  const [saving, setSaving]   = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  // États reset mdp
  const [newPwd, setNewPwd]         = useState("");
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [resetting, setResetting]   = useState(false);

  // Suppression
  const [deleting, setDeleting] = useState(false);

  // Toggle actif (inline, depuis le modal gérer)
  const [toggling, setToggling] = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try { setAdmins(await adminUsersApi.list()); }
    catch { toast.error("Impossible de charger les comptes"); }
    finally { setLoading(false); }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await adminUsersApi.create(form);
      toast.success("Compte créé ✓");
      setCreateOpen(false);
      setForm(EMPTY_FORM);
      load();
    } catch (err: unknown) {
      const raw = err instanceof Error ? err.message : "";
      toast.error(raw.includes("déjà") ? "Cet email est déjà utilisé" : "Erreur lors de la création");
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleActive(admin: AdminUser) {
    setToggling(true);
    try {
      const updated = await adminUsersApi.update(admin.id, { is_active: !admin.is_active });
      setAdmins((prev) => prev.map((a) => (a.id === admin.id ? updated : a)));
      if (managedAdmin?.id === admin.id) setManagedAdmin(updated);
      toast.success(updated.is_active ? "Compte activé" : "Compte désactivé");
    } catch {
      toast.error("Erreur mise à jour");
    } finally {
      setToggling(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await adminUsersApi.delete(deleteTarget.id);
      toast.success("Compte supprimé");
      setDeleteTarget(null);
      setManagedAdmin(null);
      load();
    } catch {
      toast.error("Erreur suppression");
    } finally {
      setDeleting(false);
    }
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    if (!resetTarget || !newPwd) return;
    setResetting(true);
    try {
      await adminUsersApi.update(resetTarget.id, { password: newPwd });
      toast.success("Mot de passe réinitialisé ✓");
      setResetTarget(null);
      setNewPwd("");
    } catch {
      toast.error("Erreur réinitialisation");
    } finally {
      setResetting(false);
    }
  }

  function resetFilters() {
    setSearch(""); setFilterRole(""); setFilterStatus("");
  }

  const hasFilters = search || filterRole || filterStatus;

  const filtered = useMemo(() => {
    return admins.filter((a) => {
      const q = search.toLowerCase();
      const matchSearch = !search || a.name.toLowerCase().includes(q) || a.email.toLowerCase().includes(q);
      const matchRole   = !filterRole   || a.role === filterRole;
      const matchStatus = filterStatus === "actif" ? a.is_active : filterStatus === "inactif" ? !a.is_active : true;
      return matchSearch && matchRole && matchStatus;
    });
  }, [admins, search, filterRole, filterStatus]);

  return (
    <div>

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des comptes</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {hasFilters ? `${filtered.length} / ${admins.length}` : admins.length} compte(s) administrateur
          </p>
        </div>
        <button
          onClick={() => { setForm(EMPTY_FORM); setShowPwd(false); setCreateOpen(true); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white rounded-xl font-semibold text-sm hover:bg-gray-700 transition-colors"
        >
          <Plus size={16} /> Nouveau compte
        </button>
      </div>

      {/* ── Barre recherche + filtres ────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2 mb-4">

        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par nom ou email..."
            className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-amber-500 transition-colors bg-white"
          />
        </div>

        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="text-sm border border-gray-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:border-amber-500 transition-colors cursor-pointer"
        >
          <option value="">Tous les rôles</option>
          <option value="admin">Admin</option>
          <option value="superadmin">Super Admin</option>
        </select>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="text-sm border border-gray-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:border-amber-500 transition-colors cursor-pointer"
        >
          <option value="">Tous les statuts</option>
          <option value="actif">Actif</option>
          <option value="inactif">Désactivé</option>
        </select>

        {hasFilters && (
          <button onClick={resetFilters} className="flex items-center gap-1 text-sm text-red-500 hover:text-red-700 px-2 py-2 transition-colors">
            <X size={14} /> Réinitialiser
          </button>
        )}
      </div>

      {/* ── Tableau ──────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Chargement...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <Users size={40} strokeWidth={1} className="mx-auto mb-3" />
            <p>{hasFilters ? "Aucun compte ne correspond à votre recherche." : "Aucun compte supplémentaire. Créez-en un !"}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="min-w-[520px]">

              {/* En-têtes */}
              <div className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] bg-gray-50 border-b px-4 py-2.5">
                <span className="text-xs font-bold text-gray-500 uppercase">Compte</span>
                <span className="text-xs font-bold text-gray-500 uppercase text-center">Rôle</span>
                <span className="text-xs font-bold text-gray-500 uppercase text-center">Statut</span>
                <span className="text-xs font-bold text-gray-500 uppercase text-center">Créé le</span>
                <span className="text-xs font-bold text-gray-500 uppercase text-center w-20">Actions</span>
              </div>

              {/* Lignes */}
              {filtered.map((admin) => (
                <div
                  key={admin.id}
                  onClick={() => setDetailAdmin(admin)}
                  className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] items-center px-4 py-3 border-b last:border-b-0 hover:bg-amber-50 cursor-pointer transition-colors"
                >
                  {/* Compte */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-gray-900 text-white flex items-center justify-center font-black text-sm flex-shrink-0">
                      {admin.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 truncate text-sm">{admin.name}</p>
                      <p className="text-xs text-gray-400 truncate mt-0.5">{admin.email}</p>
                    </div>
                  </div>

                  {/* Rôle */}
                  <div className="flex justify-center">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${ROLE_STYLES[admin.role] ?? "bg-gray-100 text-gray-600"}`}>
                      {ROLE_LABELS[admin.role] ?? admin.role}
                    </span>
                  </div>

                  {/* Statut */}
                  <div className="flex justify-center">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${admin.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                      {admin.is_active ? "Actif" : "Désactivé"}
                    </span>
                  </div>

                  {/* Date */}
                  <p className="text-xs text-gray-400 text-center">
                    {new Date(admin.created_at).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })}
                  </p>

                  {/* Actions */}
                  <div className="flex justify-center w-20">
                    <button
                      onClick={(e) => { e.stopPropagation(); setManagedAdmin(admin); }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-semibold hover:bg-gray-200 transition-colors"
                    >
                      <Settings2 size={13} /> Gérer
                    </button>
                  </div>
                </div>
              ))}

            </div>
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          Modal — Détails du compte
      ══════════════════════════════════════════════════════════════════════ */}
      {detailAdmin && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-end sm:items-center justify-center sm:p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md shadow-2xl">

            <div className="sticky top-0 bg-white px-5 py-4 border-b flex items-center justify-between">
              <h2 className="text-base font-bold text-gray-900">Détails du compte</h2>
              <button onClick={() => setDetailAdmin(null)} className="p-1.5 rounded-full hover:bg-gray-100">
                <X size={18} />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Avatar + nom */}
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gray-900 text-white flex items-center justify-center font-black text-lg flex-shrink-0">
                  {detailAdmin.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="font-black text-gray-900 text-lg">{detailAdmin.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${ROLE_STYLES[detailAdmin.role] ?? "bg-gray-100 text-gray-600"}`}>
                      {ROLE_LABELS[detailAdmin.role] ?? detailAdmin.role}
                    </span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${detailAdmin.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                      {detailAdmin.is_active ? "Actif" : "Désactivé"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Infos */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Email",    value: detailAdmin.email },
                  { label: "Rôle",     value: ROLE_LABELS[detailAdmin.role] ?? detailAdmin.role },
                  { label: "Statut",   value: detailAdmin.is_active ? "Actif" : "Désactivé" },
                  { label: "Référence", value: `#${detailAdmin.id}` },
                  { label: "Créé le",  value: new Date(detailAdmin.created_at).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" }) },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-gray-50 rounded-xl p-3">
                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">{label}</p>
                    <p className="text-sm font-semibold text-gray-800 truncate">{value}</p>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-1">
                <button
                  onClick={() => { setManagedAdmin(detailAdmin); setDetailAdmin(null); }}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-blue-50 text-blue-700 rounded-xl font-semibold text-sm hover:bg-blue-100 transition-colors"
                >
                  <Settings2 size={15} /> Gérer
                </button>
                <button
                  onClick={() => { setDeleteTarget(detailAdmin); setDetailAdmin(null); }}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-50 text-red-600 rounded-xl font-semibold text-sm hover:bg-red-100 transition-colors"
                >
                  <Trash2 size={15} /> Supprimer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          Modal — Gérer
      ══════════════════════════════════════════════════════════════════════ */}
      {managedAdmin && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-end sm:items-center justify-center sm:p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-sm shadow-2xl">

            <div className="px-5 py-4 border-b flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-gray-900 text-white flex items-center justify-center font-black text-sm flex-shrink-0">
                  {managedAdmin.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-sm text-gray-900 truncate">{managedAdmin.name}</p>
                  <p className="text-xs text-gray-400 truncate">{managedAdmin.email}</p>
                </div>
              </div>
              <button onClick={() => setManagedAdmin(null)} className="p-1.5 rounded-full hover:bg-gray-100 flex-shrink-0">
                <X size={18} />
              </button>
            </div>

            <div className="p-4 space-y-2.5">
              {/* Activer / Désactiver */}
              <button
                onClick={() => handleToggleActive(managedAdmin)}
                disabled={toggling}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-colors disabled:opacity-60 ${
                  managedAdmin.is_active
                    ? "bg-red-50 text-red-600 hover:bg-red-100"
                    : "bg-green-50 text-green-700 hover:bg-green-100"
                }`}
              >
                {managedAdmin.is_active
                  ? <><ShieldAlert size={16} /> Désactiver le compte</>
                  : <><ShieldCheck size={16} /> Activer le compte</>
                }
              </button>

              {/* Réinitialiser mot de passe */}
              <button
                onClick={() => { setResetTarget(managedAdmin); setManagedAdmin(null); setNewPwd(""); setShowNewPwd(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 bg-blue-50 text-blue-700 rounded-xl font-semibold text-sm hover:bg-blue-100 transition-colors"
              >
                <KeyRound size={16} /> Réinitialiser le mot de passe
              </button>

              {/* Supprimer */}
              <button
                onClick={() => { setDeleteTarget(managedAdmin); setManagedAdmin(null); }}
                className="w-full flex items-center gap-3 px-4 py-3 bg-red-50 text-red-600 rounded-xl font-semibold text-sm hover:bg-red-100 transition-colors"
              >
                <Trash2 size={16} /> Supprimer le compte
              </button>

              <button
                onClick={() => setManagedAdmin(null)}
                className="w-full px-4 py-2.5 border border-gray-200 text-gray-500 rounded-xl text-sm font-medium hover:border-gray-300 transition-colors"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          Modal — Créer un compte
      ══════════════════════════════════════════════════════════════════════ */}
      {createOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-end sm:items-center justify-center sm:p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md max-h-[92vh] overflow-y-auto shadow-2xl">

            <div className="sticky top-0 bg-white px-5 py-4 border-b flex items-center justify-between">
              <h2 className="text-base font-bold text-gray-900">Nouveau compte admin</h2>
              <button onClick={() => setCreateOpen(false)} className="p-1.5 rounded-full hover:bg-gray-100">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Nom complet *</label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="ex: Jean Dupont"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Email *</label>
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="admin@email.com"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Mot de passe *</label>
                <div className="relative">
                  <input
                    required
                    type={showPwd ? "text" : "password"}
                    value={form.password}
                    onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                    placeholder="••••••••"
                    className="w-full px-3 py-2.5 pr-10 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-amber-500 transition-colors"
                  />
                  <button type="button" onClick={() => setShowPwd((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Rôle</label>
                <select
                  value={form.role}
                  onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-amber-500 bg-white transition-colors"
                >
                  <option value="admin">Admin</option>
                  <option value="superadmin">Super Admin</option>
                </select>
              </div>

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setCreateOpen(false)}
                  className="flex-1 py-2.5 border border-gray-200 rounded-xl font-semibold text-sm hover:border-gray-400 transition-colors">
                  Annuler
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 py-2.5 bg-gray-900 text-white rounded-xl font-bold text-sm hover:bg-gray-700 transition-colors disabled:opacity-60">
                  {saving ? "Création..." : "Créer le compte"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          Modal — Réinitialiser mot de passe
      ══════════════════════════════════════════════════════════════════════ */}
      {resetTarget && (
        <div className="fixed inset-0 z-[60] bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl">

            <div className="px-5 py-4 border-b flex items-center justify-between">
              <h2 className="text-base font-bold text-gray-900">Réinitialiser le mot de passe</h2>
              <button onClick={() => setResetTarget(null)} className="p-1.5 rounded-full hover:bg-gray-100">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleResetPassword} className="p-5 space-y-4">
              <div className="bg-gray-50 rounded-xl p-3 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-gray-900 text-white flex items-center justify-center font-black text-xs flex-shrink-0">
                  {resetTarget.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">{resetTarget.name}</p>
                  <p className="text-xs text-gray-400">{resetTarget.email}</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Nouveau mot de passe *</label>
                <div className="relative">
                  <input
                    required
                    type={showNewPwd ? "text" : "password"}
                    value={newPwd}
                    onChange={(e) => setNewPwd(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-2.5 pr-10 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-amber-500 transition-colors"
                  />
                  <button type="button" onClick={() => setShowNewPwd((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showNewPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setResetTarget(null)}
                  className="flex-1 py-2.5 border border-gray-200 rounded-xl font-semibold text-sm hover:border-gray-400 transition-colors">
                  Annuler
                </button>
                <button type="submit" disabled={resetting}
                  className="flex-1 py-2.5 bg-gray-900 text-white rounded-xl font-bold text-sm hover:bg-gray-700 transition-colors disabled:opacity-60">
                  {resetting ? "Mise à jour..." : "Réinitialiser"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          Modal — Confirmation suppression
      ══════════════════════════════════════════════════════════════════════ */}
      {deleteTarget && (
        <div className="fixed inset-0 z-[60] bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl">
            <div className="p-6 text-center">
              <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 size={24} className="text-red-500" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Supprimer ce compte ?</h3>
              <p className="text-sm text-gray-500 mb-1">Vous allez supprimer le compte de</p>
              <p className="text-sm font-bold text-gray-900 mb-1">« {deleteTarget.name} »</p>
              <p className="text-xs text-gray-400 mb-2">{deleteTarget.email}</p>
              <p className="text-xs text-red-500 mb-6">Cette action est irréversible.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteTarget(null)} disabled={deleting}
                  className="flex-1 py-2.5 border border-gray-200 rounded-xl font-semibold text-sm text-gray-600 hover:border-gray-400 transition-colors disabled:opacity-50">
                  Annuler
                </button>
                <button onClick={handleDelete} disabled={deleting}
                  className="flex-1 py-2.5 bg-red-500 text-white rounded-xl font-bold text-sm hover:bg-red-600 transition-colors disabled:opacity-60">
                  {deleting ? "Suppression..." : "Oui, supprimer"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
