import { HomeContent } from "./HomeContent";
import { Product } from "@/lib/types";

const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Pré-charge les 4 derniers produits sur le serveur — ISR 60 s
async function fetchLatestProducts(): Promise<Product[]> {
  try {
    const res = await fetch(`${BASE}/api/products/`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    const all: Product[] = await res.json();
    return all.slice(0, 4);
  } catch {
    return [];
  }
}

// Server Component — HTML pré-rendu avec les produits déjà dedans
export default async function HomePage() {
  const initialProducts = await fetchLatestProducts();
  return <HomeContent initialProducts={initialProducts} />;
}
