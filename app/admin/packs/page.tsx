"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { Plus, Pencil, Trash2, X, Upload, Package, Search, Minus, Eye, EyeOff, Loader2 } from "lucide-react";
import { packsApi, productsApi, uploadApi, revalidateApi } from "@/lib/api";
import { Pack, Product } from "@/lib/types";
import toast from "react-hot-toast";

type Line = { product: Product; quantity: number };

interface FormState {
  name: string;
  description: string;
  price: string;
  images: string[];
  is_active: boolean;
  lines: Line[];
}

const EMPTY: FormState = { name: "", description: "", price: "", images: [], is_active: true, lines: [] };

const fcfa = (n: number) => `${Math.round(n).toLocaleString("fr-FR")} F`;

function errorMessage(err: unknown): string {
  const raw = err instanceof Error ? err.message : String(err);
  try {
    const body = JSON.parse(raw);
    if (typeof body.detail === "string") return body.detail;
  } catch { /* texte brut */ }
  return raw || "Erreur";
}

export default function AdminPacksPage() {
  const [packs, setPacks]         = useState<Pack[]>([]);
  const [products, setProducts]   = useState<Product[]>([]);
  const [loading, setLoading]     = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing]     = useState<Pack | null>(null);
  const [form, setForm]           = useState<FormState>(EMPTY);
  const [saving, setSaving]       = useState(false);
  const [uploading, setUploading] = useState(false);
  const [picker, setPicker]       = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Pack | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    Promise.all([packsApi.listAll(), productsApi.list()])
      .then(([p, prods]) => { setPacks(p); setProducts(prods); })
      .catch((err) => toast.error(errorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  const regular = form.lines.reduce((s, l) => s + l.product.price * l.quantity, 0);
  const price = parseFloat(form.price) || 0;
  const savings = regular - price;

  const pickerResults = useMemo(() => {
    const q = picker.toLowerCase().trim();
    if (!q) return [];
    const chosen = new Set(form.lines.map((l) => l.product.id));
    return products
      .filter((p) => !chosen.has(p.id) && (p.name.toLowerCase().includes(q) || (p.reference || "").toLowerCase().includes(q)))
      .slice(0, 8);
  }, [picker, products, form.lines]);

  function openAdd() {
    setEditing(null);
    setForm(EMPTY);
    setPicker("");
    setModalOpen(true);
  }

  function openEdit(pack: Pack) {
    const byId = new Map(products.map((p) => [p.id, p]));
    setEditing(pack);
    setForm({
      name: pack.name,
      description: pack.description || "",
      price: String(pack.price),
      images: pack.images || [],
      is_active: pack.is_active,
      lines: pack.items
        .map((i) => ({ product: byId.get(i.product_id), quantity: i.quantity }))
        .filter((l): l is Line => !!l.product),
    });
    setPicker("");
    setModalOpen(true);
  }

  function addLine(p: Product) {
    setForm((f) => ({ ...f, lines: [...f.lines, { product: p, quantity: 1 }] }));
    setPicker("");
  }

  function setQty(id: number, qty: number) {
    if (qty < 1) return;
    setForm((f) => ({ ...f, lines: f.lines.map((l) => (l.product.id === id ? { ...l, quantity: qty } : l)) }));
  }

  function removeLine(id: number) {
    setForm((f) => ({ ...f, lines: f.lines.filter((l) => l.product.id !== id) }));
  }

  async function handleUpload(files: FileList) {
    setUploading(true);
    try {
      const urls = await uploadApi.images(Array.from(files));
      setForm((f) => ({ ...f, images: [...f.images, ...urls] }));
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) { toast.error("Donnez un nom au pack"); return; }
    if (form.lines.length === 0) { toast.error("Ajoutez au moins un produit"); return; }
    if (price <= 0) { toast.error("Indiquez le prix du pack"); return; }
    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || null,
      price,
      images: form.images,
      is_active: form.is_active,
      items: form.lines.map((l) => ({ product_id: l.product.id, quantity: l.quantity })),
    };
    setSaving(true);
    try {
      if (editing) {
        const updated = await packsApi.update(editing.id, payload);
        setPacks((ps) => ps.map((p) => (p.id === updated.id ? updated : p)));
        toast.success("Pack mis à jour");
      } else {
        const created = await packsApi.create(payload);
        setPacks((ps) => [created, ...ps]);
        toast.success("Pack créé");
      }
      revalidateApi.refresh();
      setModalOpen(false);
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(pack: Pack) {
    try {
      const updated = await packsApi.update(pack.id, { is_active: !pack.is_active });
      setPacks((ps) => ps.map((p) => (p.id === updated.id ? updated : p)));
      revalidateApi.refresh();
      toast.success(updated.is_active ? "Pack visible sur la boutique" : "Pack masqué");
    } catch (err) {
      toast.error(errorMessage(err));
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    try {
      await packsApi.delete(deleteTarget.id);
      setPacks((ps) => ps.filter((p) => p.id !== deleteTarget.id));
      revalidateApi.refresh();
      toast.success("Pack supprimé");
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setDeleteTarget(null);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Packs produits</h1>
          <p className="text-sm text-gray-500 mt-0.5">{packs.length} pack(s) · lots de produits vendus à prix groupé</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white rounded-xl font-semibold text-sm hover:bg-gray-700 transition-colors"
        >
          <Plus size={16} /> Nouveau pack
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Chargement...</div>
        ) : packs.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <Package size={40} strokeWidth={1} className="mx-auto mb-3" />
            <p>Aucun pack. Créez votre premier pack !</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="min-w-[640px]">
              <div className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] bg-gray-50 border-b px-4 py-2.5">
                <span className="text-xs font-bold text-gray-500 uppercase">Pack</span>
                <span className="text-xs font-bold text-gray-500 uppercase text-center">Prix pack</span>
                <span className="text-xs font-bold text-gray-500 uppercase text-center">Économie</span>
                <span className="text-xs font-bold text-gray-500 uppercase text-center">Stock</span>
                <span className="text-xs font-bold text-gray-500 uppercase text-center w-32">Actions</span>
              </div>
              {packs.map((p) => (
                <div key={p.id} className={`grid grid-cols-[2fr_1fr_1fr_1fr_auto] items-center px-4 py-3 border-b last:border-b-0 ${p.is_active ? "" : "opacity-60"}`}>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 truncate text-sm flex items-center gap-2">
                      {p.name}
                      {!p.is_active && <span className="text-[10px] font-bold uppercase bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded">Masqué</span>}
                    </p>
                    <p className="text-xs text-gray-400 truncate mt-0.5">
                      {p.items.map((i) => `${i.quantity}× ${i.product_name}`).join(" · ")}
                    </p>
                  </div>
                  <p className="text-sm font-bold text-amber-600 text-center">{fcfa(p.price)}</p>
                  <p className="text-sm text-center">
                    {p.savings > 0
                      ? <span className="text-green-600 font-semibold">-{fcfa(p.savings)}</span>
                      : <span className="text-gray-400">—</span>}
                  </p>
                  <div className="flex justify-center">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${p.stock > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                      {p.stock}
                    </span>
                  </div>
                  <div className="flex justify-center gap-1 w-32">
                    <button onClick={() => toggleActive(p)} title={p.is_active ? "Masquer" : "Afficher"} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
                      {p.is_active ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                    <button onClick={() => openEdit(p)} title="Modifier" className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
                      <Pencil size={15} />
                    </button>
                    <button onClick={() => setDeleteTarget(p)} title="Supprimer" className="p-2 rounded-lg hover:bg-red-50 text-red-500">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Modal création / édition ──────────────────────────────────────── */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <form onSubmit={handleSave} className="bg-white rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl">
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">{editing ? "Modifier le pack" : "Nouveau pack"}</h2>
              <button type="button" onClick={() => setModalOpen(false)} className="p-1.5 rounded-full hover:bg-gray-100"><X size={18} /></button>
            </div>

            <div className="overflow-y-auto p-6 space-y-5">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Nom du pack *</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Ex. Kit vidéosurveillance 4 caméras"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  placeholder="À qui s'adresse ce pack, ce qu'il permet…"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-amber-500 resize-none"
                />
              </div>

              {/* Produits du pack */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Produits du pack *</label>
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input
                    value={picker}
                    onChange={(e) => setPicker(e.target.value)}
                    placeholder="Rechercher un produit à ajouter…"
                    className="w-full pl-8 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-amber-500"
                  />
                  {pickerResults.length > 0 && (
                    <div className="absolute z-10 left-0 right-0 mt-1 bg-white border rounded-xl shadow-lg max-h-64 overflow-y-auto">
                      {pickerResults.map((p) => (
                        <button
                          type="button"
                          key={p.id}
                          onClick={() => addLine(p)}
                          className="w-full flex items-center gap-3 px-3 py-2 hover:bg-amber-50 text-left"
                        >
                          <div className="w-9 h-9 rounded bg-gray-50 flex-shrink-0 overflow-hidden flex items-center justify-center">
                            {p.images?.[0] ? <img src={p.images[0]} alt="" className="max-w-full max-h-full object-contain" /> : "🖥️"}
                          </div>
                          <span className="flex-1 text-sm truncate">{p.name}</span>
                          <span className="text-xs font-semibold text-amber-600">{fcfa(p.price)}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {form.lines.length > 0 ? (
                  <ul className="mt-3 border rounded-xl divide-y">
                    {form.lines.map((l) => (
                      <li key={l.product.id} className="flex items-center gap-3 px-3 py-2">
                        <span className="flex-1 text-sm truncate">{l.product.name}</span>
                        <span className="text-xs text-gray-400 w-20 text-right">{fcfa(l.product.price)}</span>
                        <div className="flex items-center gap-1">
                          <button type="button" onClick={() => setQty(l.product.id, l.quantity - 1)} className="p-1 rounded-full hover:bg-gray-100"><Minus size={12} /></button>
                          <span className="w-6 text-center text-sm font-semibold">{l.quantity}</span>
                          <button type="button" onClick={() => setQty(l.product.id, l.quantity + 1)} className="p-1 rounded-full hover:bg-gray-100"><Plus size={12} /></button>
                        </div>
                        <button type="button" onClick={() => removeLine(l.product.id)} className="p-1 text-red-400 hover:text-red-600"><X size={14} /></button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 text-xs text-gray-400">Aucun produit pour l’instant.</p>
                )}
              </div>

              {/* Prix */}
              <div className="grid sm:grid-cols-2 gap-4 items-end">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Prix du pack (FCFA) *</label>
                  <input
                    type="number" min={0} step={500}
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    placeholder={regular ? String(Math.round(regular * 0.9)) : "0"}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div className="text-sm bg-gray-50 rounded-xl px-3 py-2.5">
                  <p className="text-gray-500">Prix séparés : <strong className="text-gray-900">{fcfa(regular)}</strong></p>
                  {price > 0 && (
                    savings > 0
                      ? <p className="text-green-600 font-semibold">Économie client : {fcfa(savings)} ({Math.round((savings / regular) * 100)} %)</p>
                      : <p className="text-orange-600 font-semibold">Le pack n’est pas moins cher que les produits séparés</p>
                  )}
                </div>
              </div>

              {/* Images */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Image du pack <span className="text-gray-400 font-normal">(sinon, les photos des produits sont utilisées)</span></label>
                <div className="flex flex-wrap gap-2">
                  {form.images.map((img, i) => (
                    <div key={img} className="relative w-20 h-20 rounded-lg border overflow-hidden group">
                      <img src={img} alt="" className="w-full h-full object-contain" />
                      <button
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, images: f.images.filter((_, j) => j !== i) }))}
                        className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100"
                      >
                        <X size={11} />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading}
                    className="w-20 h-20 rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-400 hover:border-amber-400 hover:text-amber-500"
                  >
                    {uploading ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
                  </button>
                  <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => e.target.files && handleUpload(e.target.files)} />
                </div>
              </div>

              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="accent-gray-900" />
                Visible sur la boutique
              </label>
            </div>

            <div className="px-6 py-4 border-t flex gap-3">
              <button type="button" onClick={() => setModalOpen(false)} className="flex-1 py-2.5 border border-gray-200 rounded-xl font-semibold text-sm text-gray-600 hover:border-gray-400">
                Annuler
              </button>
              <button type="submit" disabled={saving} className="flex-1 py-2.5 bg-gray-900 text-white rounded-xl font-bold text-sm hover:bg-gray-700 disabled:opacity-60 flex items-center justify-center gap-2">
                {saving && <Loader2 size={15} className="animate-spin" />} {editing ? "Enregistrer" : "Créer le pack"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Confirmation suppression ─────────────────────────────────────── */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6 text-center">
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={22} className="text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">Supprimer ce pack ?</h3>
            <p className="text-sm text-gray-500 mb-6">« {deleteTarget.name} » sera retiré de la boutique. Les produits ne sont pas supprimés.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)} className="flex-1 py-2.5 border border-gray-200 rounded-xl font-semibold text-sm text-gray-600">Annuler</button>
              <button onClick={confirmDelete} className="flex-1 py-2.5 bg-red-500 text-white rounded-xl font-bold text-sm hover:bg-red-600">Supprimer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
