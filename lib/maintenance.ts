import { MaintenanceSetting } from "./types";

const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/**
 * Lit l'état du mode maintenance côté serveur (pages publiques).
 * En cas d'erreur de l'API, le site reste accessible : on considère la maintenance désactivée.
 */
export async function getMaintenance(): Promise<MaintenanceSetting | null> {
  try {
    const res = await fetch(`${BASE}/api/settings/maintenance`, { cache: "no-store" });
    if (!res.ok) return null;
    const data: MaintenanceSetting = await res.json();
    return data.enabled ? data : null;
  } catch {
    return null;
  }
}
