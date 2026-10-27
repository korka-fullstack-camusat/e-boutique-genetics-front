import { BoutiqueContent } from "./BoutiqueContent";
import { Product } from "@/lib/types";
import { getMaintenance } from "@/lib/maintenance";
import { MaintenanceScreen } from "@/components/MaintenanceScreen";

const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Pré-charge tous les produits côté serveur — revalide automatiquement toutes les 60 s
async function fetchProducts(): Promise<Product[]> {
  try {
    const res = await fetch(`${BASE}/api/products/`, {
      cache: "no-store",
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

// Server Component — s'exécute sur le serveur, l'utilisateur reçoit le HTML déjà rempli
export default async function BoutiquePage() {
  const maintenance = await getMaintenance();
  if (maintenance) return <MaintenanceScreen message={maintenance.message} />;

  const initialProducts = await fetchProducts();
  return <BoutiqueContent initialProducts={initialProducts} />;
}
