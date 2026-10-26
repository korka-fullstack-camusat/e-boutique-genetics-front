import { HomeContent } from "./HomeContent";
import { Pack, Product } from "@/lib/types";

const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function fetchJson<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${BASE}${path}`, { cache: "no-store" });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

// Server Component — HTML pré-rendu avec les 4 derniers produits et les packs déjà dedans
export default async function HomePage() {
  const [products, packs] = await Promise.all([
    fetchJson<Product[]>("/api/products/"),
    fetchJson<Pack[]>("/api/packs/"),
  ]);
  return <HomeContent initialProducts={(products ?? []).slice(0, 4)} initialPacks={packs ?? []} />;
}
