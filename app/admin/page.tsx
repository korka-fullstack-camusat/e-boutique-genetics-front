"use client";
import { useState, useEffect, useRef, useMemo } from "react";
import { Plus, Pencil, Trash2, X, Upload, Package, Settings2, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { productsApi, uploadApi, revalidateApi } from "@/lib/api";
import { Product, ProductCreate, ProductUpdate } from "@/lib/types";
import toast from "react-hot-toast";

const CATEGORIES = [
  "Vidéosurveillance",
  "Contrôle d'Accès/Anti-intrusion",
  "Câblage informatique",
  "Énergie",
  "Ordinateurs/Serveurs",
  "Connectivité/Sécurité",
  "Téléphonie/Visioconférence",
  "Accessoires et Périphériques",
];
const PAGE_SIZE = 10;

const EMPTY: ProductCreate = {
  name: "", description: "", price: 0, category: "",
  sous_category: "", stock: 0, images: [], sizes: [], colors: [],
  condition: "neuf",
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductCreate>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [managedProduct, setManagedProduct] = useState<Product | null>(null);
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterStock, setFilterStock] = useState("");
  const [page, setPage] = useState(1);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { loadProducts(); }, []);

  async function loadProducts() {
    setLoading(true);
    try { setProducts(await productsApi.list()); }
    finally { setLoading(false); }
  }

  function openAdd() {
    setEditing(null);
    setForm(EMPTY);
    setModalOpen(true);
  }

  function openEdit(p: Product) {
    setEditing(p);
    setForm({
      name: p.name, description: p.description || "",
      price: p.price, category: p.category || "",
      sous_category: p.sous_category || "", stock: p.stock,
      images: p.images || [], sizes: [], colors: [],
      condition: p.condition || "neuf",
    });
    setModalOpen(true);
  }

  async function handleUpload(files: FileList) {
    setUploading(true);
    try {
      const urls = await uploadApi.images(Array.from(files));
      setForm((f) => ({ ...f, images: [...(f.images || []), ...urls] }));
    } catch { toast.error("Erreur upload"); }
    finally { setUploading(false); }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.price) { toast.error("Nom et prix requis"); return; }
    setSaving(true);
    try {
      if (editing) {
        await productsApi.update(editing.id, { ...form } as ProductUpdate);
        toast.success("Produit mis à jour");
      } else {
        await productsApi.create(form);
        toast.success("Produit créé");
      }
      setModalOpen(false);
      loadProducts();
      revalidateApi.refresh(); // reflète immédiatement le changement côté client
    } catch { toast.error("Erreur lors de la sauvegarde"); }
    finally { setSaving(false); }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await productsApi.delete(deleteTarget.id);
      toast.success("Produit supprimé");
      setDeleteTarget(null);
      setManagedProduct(null);
      setDetailProduct(null);
      loadProducts();
      revalidateApi.refresh(); // reflète immédiatement le changement côté client
    } catch { toast.error("Erreur suppression"); }
    finally { setDeleting(false); }
  }

  function set(field: string, value: string | number) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  // Filtered + paginated list
  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || (p.description || "").toLowerCase().includes(search.toLowerCase());
      const matchCat = !filterCategory || p.category === filterCategory;
      const matchStock = filterStock === "dispo" ? p.stock > 0 : filterStock === "epuise" ? p.stock === 0 : true;
      return matchSearch && matchCat && matchStock;
    });
  }, [products, search, filterCategory, filterStock]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  function resetFilters() {
    setSearch(""); setFilterCategory(""); setFilterStock(""); setPage(1);
  }

  const hasFilters = search || filterCategory || filterStock;

  return (
    <div>
      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des produits</h1>
          <p className="text-sm text-gray-500 mt-0.5">{filtered.length} / {products.length} produit(s)</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white rounded-xl font-semibold text-sm hover:bg-gray-700 transition-colors"
        >
          <Plus size={16} /> Nouveau produit
        </button>
      </div>

      {/* ── Barre de recherche + filtres ─────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {/* Search */}
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Rechercher un produit..."
            className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-amber-500 transition-colors bg-white"
          />
        </div>

        {/* Filtre catégorie */}
        <select
          value={filterCategory}
          onChange={(e) => { setFilterCategory(e.target.value); setPage(1); }}
          className="text-sm border border-gray-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:border-amber-500 transition-colors cursor-pointer"
        >
          <option value="">Toutes catégories</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>

        {/* Filtre stock */}
        <select
          value={filterStock}
          onChange={(e) => { setFilterStock(e.target.value); setPage(1); }}
          className="text-sm border border-gray-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:border-amber-500 transition-colors cursor-pointer"
        >
          <option value="">Tout le stock</option>
          <option value="dispo">En stock</option>
          <option value="epuise">Épuisés</option>
        </select>

        {hasFilters && (
          <button onClick={resetFilters} className="flex items-center gap-1 text-sm text-red-500 hover:text-red-700 px-2 py-2 transition-colors">
            <X size={14} /> Réinitialiser
          </button>
        )}
      </div>

      {/* ── Table ────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Chargement...</div>
        ) : paginated.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <Package size={40} strokeWidth={1} className="mx-auto mb-3" />
            <p>{hasFilters ? "Aucun produit ne correspond à votre recherche." : "Aucun produit. Ajoutez-en un !"}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            {/* Grille CSS — titres et lignes partagent le même template de colonnes */}
            <div className="min-w-[520px]">

              {/* En-têtes */}
              <div className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] bg-gray-50 border-b px-4 py-2.5">
                <span className="text-xs font-bold text-gray-500 uppercase">Produit</span>
                <span className="text-xs font-bold text-gray-500 uppercase text-center">Catégorie</span>
                <span className="text-xs font-bold text-gray-500 uppercase text-center">Prix</span>
                <span className="text-xs font-bold text-gray-500 uppercase text-center">Stock</span>
                <span className="text-xs font-bold text-gray-500 uppercase text-center w-20">Actions</span>
              </div>

              {/* Lignes */}
              {paginated.map((p) => (
                <div
                  key={p.id}
                  onClick={() => setDetailProduct(p)}
                  className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] items-center px-4 py-3 border-b last:border-b-0 hover:bg-amber-50 cursor-pointer transition-colors"
                >
                  {/* Produit */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      {p.images?.[0]
                        ? <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center text-lg">🖥️</div>
                      }
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 truncate text-sm">{p.name}</p>
                      {p.description && <p className="text-xs text-gray-400 truncate mt-0.5">{p.description}</p>}
                    </div>
                  </div>

                  {/* Catégorie */}
                  <div className="flex justify-center">
                    <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium whitespace-nowrap">
                      {p.category || "—"}
                    </span>
                  </div>

                  {/* Prix */}
                  <p className="text-sm font-bold text-amber-600 text-center">
                    {p.price.toLocaleString("fr-FR")} F
                  </p>

                  {/* Stock */}
                  <div className="flex justify-center">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${p.stock > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                      {p.stock}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-center w-20">
                    <button
                      onClick={(e) => { e.stopPropagation(); setManagedProduct(p); }}
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

      {/* ── Pagination ───────────────────────────────────────────────────── */}
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
                    className={`w-8 h-8 rounded-lg text-sm font-semibold transition-colors ${currentPage === n ? "bg-gray-900 text-white" : "border border-gray-200 text-gray-600 hover:bg-gray-50"}`}
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

      {/* ── Modal Détails produit ────────────────────────────────────────── */}
      {detailProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-end sm:items-center justify-center sm:p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg max-h-[92vh] overflow-y-auto shadow-2xl">

            <div className="sticky top-0 bg-white px-5 py-4 border-b flex items-center justify-between">
              <h2 className="text-base font-bold text-gray-900">Détails du produit</h2>
              <button onClick={() => setDetailProduct(null)} className="p-1.5 rounded-full hover:bg-gray-100">
                <X size={18} />
              </button>
            </div>

            <div className="p-5 space-y-5">
              {/* Images */}
              {(detailProduct.images || []).length > 0 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {detailProduct.images.map((img, i) => (
                    <div key={i} className="relative flex-shrink-0 w-28 h-28 rounded-xl overflow-hidden border border-gray-100">
                      <img src={img} alt={`photo-${i + 1}`} className="w-full h-full object-cover" />
                      {i === 0 && (
                        <span className="absolute bottom-0 left-0 right-0 text-[9px] font-bold text-center bg-amber-500 text-white py-0.5">
                          Principale
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Infos principales */}
              <div>
                <h3 className="text-lg font-black text-gray-900">{detailProduct.name}</h3>
                {detailProduct.description && (
                  <p className="text-sm text-gray-500 mt-1">{detailProduct.description}</p>
                )}
              </div>

              {/* Grille infos */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-amber-50 rounded-xl p-3">
                  <p className="text-xs font-bold text-gray-400 uppercase mb-1">Prix</p>
                  <p className="text-xl font-black text-amber-600">{detailProduct.price.toLocaleString("fr-FR")} <span className="text-sm font-semibold">FCFA</span></p>
                </div>
                <div className={`rounded-xl p-3 ${detailProduct.stock > 0 ? "bg-green-50" : "bg-red-50"}`}>
                  <p className="text-xs font-bold text-gray-400 uppercase mb-1">Stock</p>
                  <p className={`text-xl font-black ${detailProduct.stock > 0 ? "text-green-600" : "text-red-500"}`}>
                    {detailProduct.stock}
                    <span className="text-sm font-semibold ml-1">{detailProduct.stock > 0 ? "dispo" : "épuisé"}</span>
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs font-bold text-gray-400 uppercase mb-1">Catégorie</p>
                  <p className="text-sm font-semibold text-gray-800">{detailProduct.category || "—"}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs font-bold text-gray-400 uppercase mb-1">Référence</p>
                  <p className="text-sm font-semibold text-gray-800">#{detailProduct.id}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs font-bold text-gray-400 uppercase mb-1">État</p>
                  <p className="text-sm font-semibold text-gray-800">
                    {detailProduct.condition === "reconditionne" ? "Reconditionné" : "Neuf"}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-1">
                <button
                  onClick={() => { openEdit(detailProduct); setDetailProduct(null); }}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-blue-50 text-blue-700 rounded-xl font-semibold text-sm hover:bg-blue-100 transition-colors"
                >
                  <Pencil size={15} /> Modifier
                </button>
                <button
                  onClick={() => setDeleteTarget(detailProduct)}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-50 text-red-600 rounded-xl font-semibold text-sm hover:bg-red-100 transition-colors"
                >
                  <Trash2 size={15} /> Supprimer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal Confirmation suppression ──────────────────────────────── */}
      {deleteTarget && (
        <div className="fixed inset-0 z-[60] bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl animate-in">
            <div className="p-6 text-center">
              <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 size={24} className="text-red-500" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Supprimer ce produit ?</h3>
              <p className="text-sm text-gray-500 mb-1">
                Vous êtes sur le point de supprimer
              </p>
              <p className="text-sm font-semibold text-gray-800 mb-5">
                « {deleteTarget.name} »
              </p>
              <p className="text-xs text-red-500 mb-6">Cette action est irréversible.</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteTarget(null)}
                  disabled={deleting}
                  className="flex-1 py-2.5 border border-gray-200 rounded-xl font-semibold text-sm text-gray-600 hover:border-gray-400 transition-colors disabled:opacity-50"
                >
                  Annuler
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={deleting}
                  className="flex-1 py-2.5 bg-red-500 text-white rounded-xl font-bold text-sm hover:bg-red-600 transition-colors disabled:opacity-60"
                >
                  {deleting ? "Suppression..." : "Oui, supprimer"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal Gérer ──────────────────────────────────────────────────── */}
      {managedProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-end sm:items-center justify-center sm:p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-sm shadow-2xl">
            <div className="px-5 py-4 border-b flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                  {managedProduct.images?.[0]
                    ? <img src={managedProduct.images[0]} alt="" className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-lg">🖥️</div>
                  }
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-sm text-gray-900 truncate">{managedProduct.name}</p>
                  <p className="text-xs text-amber-600 font-semibold">{managedProduct.price.toLocaleString("fr-FR")} FCFA</p>
                </div>
              </div>
              <button onClick={() => setManagedProduct(null)} className="p-1.5 rounded-full hover:bg-gray-100 flex-shrink-0">
                <X size={18} />
              </button>
            </div>
            <div className="p-4 space-y-2.5">
              <button
                onClick={() => { openEdit(managedProduct); setManagedProduct(null); }}
                className="w-full flex items-center gap-3 px-4 py-3 bg-blue-50 text-blue-700 rounded-xl font-semibold text-sm hover:bg-blue-100 transition-colors"
              >
                <Pencil size={16} /> Modifier le produit
              </button>
              <button
                onClick={() => setDeleteTarget(managedProduct)}
                className="w-full flex items-center gap-3 px-4 py-3 bg-red-50 text-red-600 rounded-xl font-semibold text-sm hover:bg-red-100 transition-colors"
              >
                <Trash2 size={16} /> Supprimer le produit
              </button>
              <button
                onClick={() => setManagedProduct(null)}
                className="w-full px-4 py-2.5 border border-gray-200 text-gray-500 rounded-xl text-sm font-medium hover:border-gray-300 transition-colors"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal Formulaire ──────────────────────────────────────────────── */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-end sm:items-center justify-center sm:p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-2xl max-h-[92vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white px-6 py-4 border-b flex items-center justify-between">
              <h2 className="text-base font-bold">{editing ? "Modifier le produit" : "Nouveau produit"}</h2>
              <button onClick={() => setModalOpen(false)} className="p-1.5 rounded-full hover:bg-gray-100">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-5">
              {/* Nom */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Nom du produit *</label>
                <input
                  required value={form.name} onChange={(e) => set("name", e.target.value)}
                  placeholder="ex: Laptop Dell Inspiron 15"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>

              {/* Prix + Stock */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Prix (FCFA) *</label>
                  <input
                    required type="number" min="0" value={form.price}
                    onChange={(e) => set("price", Number(e.target.value))}
                    placeholder="0"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-amber-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Stock</label>
                  <input
                    type="number" min="0" value={form.stock}
                    onChange={(e) => set("stock", Number(e.target.value))}
                    placeholder="0"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-amber-500 transition-colors"
                  />
                </div>
              </div>

              {/* Catégorie */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Catégorie</label>
                <select
                  value={form.category || ""}
                  onChange={(e) => set("category", e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-amber-500 transition-colors bg-white"
                >
                  <option value="">Sélectionner une catégorie</option>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {/* État du produit */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">État du produit</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => set("condition", "neuf")}
                    className={`py-2.5 rounded-xl text-sm font-semibold border transition-colors ${
                      (form.condition || "neuf") === "neuf"
                        ? "bg-gray-900 text-white border-gray-900"
                        : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                    }`}
                  >
                    Neuf
                  </button>
                  <button
                    type="button"
                    onClick={() => set("condition", "reconditionne")}
                    className={`py-2.5 rounded-xl text-sm font-semibold border transition-colors ${
                      form.condition === "reconditionne"
                        ? "bg-gray-900 text-white border-gray-900"
                        : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                    }`}
                  >
                    Reconditionné
                  </button>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">
                  Description <span className="font-normal text-gray-400 normal-case">(optionnel)</span>
                </label>
                <textarea
                  value={form.description || ""}
                  onChange={(e) => set("description", e.target.value)}
                  rows={3} placeholder="Caractéristiques principales du produit..."
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-amber-500 transition-colors resize-none"
                />
              </div>

              {/* Images */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
                  Photos du produit <span className="font-normal text-gray-400 normal-case">(plusieurs possibles)</span>
                </label>
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="w-full py-4 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center gap-2 text-sm text-gray-400 hover:border-amber-400 hover:text-amber-500 transition-colors"
                >
                  <Upload size={16} />
                  {uploading ? "Upload en cours..." : "Cliquer pour ajouter des photos"}
                </button>
                <input
                  ref={fileRef} type="file" multiple accept="image/*" className="hidden"
                  onChange={(e) => e.target.files && handleUpload(e.target.files)}
                />
                {(form.images || []).length > 0 && (
                  <div className="mt-3 grid grid-cols-4 sm:grid-cols-6 gap-2">
                    {(form.images || []).map((img, i) => (
                      <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-gray-100 group">
                        <img src={img} alt={`photo-${i + 1}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setForm((f) => ({ ...f, images: (f.images || []).filter((_, j) => j !== i) }))}
                          className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                        >
                          <X size={16} className="text-white" />
                        </button>
                        {i === 0 && (
                          <span className="absolute bottom-0 left-0 right-0 text-[9px] font-bold text-center bg-amber-500 text-white py-0.5">
                            Principale
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setModalOpen(false)}
                  className="flex-1 py-2.5 border border-gray-200 rounded-xl font-semibold text-sm hover:border-gray-400 transition-colors">
                  Annuler
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 py-2.5 bg-amber-500 text-white rounded-xl font-bold text-sm hover:bg-amber-600 transition-colors disabled:opacity-60">
                  {saving ? "Sauvegarde..." : editing ? "Mettre à jour" : "Créer le produit"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
