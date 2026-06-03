import { BoutiqueContent } from "./BoutiqueContent";
import { Product } from "@/lib/types";

const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Pré-charge tous les produits côté serveur — revalide automatiquement toutes les 60 s
async function fetchProducts(): Promise<Product[]> {
  try {
    const res = await fetch(`${BASE}/api/products/`, {
      next: { revalidate: 60 }, // ISR : servi depuis le cache Vercel, ultra-rapide
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

// Server Component — s'exécute sur le serveur, l'utilisateur reçoit le HTML déjà rempli
export default async function BoutiquePage() {
  const initialProducts = await fetchProducts();
  return <BoutiqueContent initialProducts={initialProducts} />;
}
