import type { Metadata } from "next";
import { PacksContent } from "./PacksContent";
import { Pack } from "@/lib/types";
import { getMaintenance } from "@/lib/maintenance";
import { MaintenanceScreen } from "@/components/MaintenanceScreen";

const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const metadata: Metadata = {
  title: "Packs — E-Boutique Groupe Genetics",
  description: "Des solutions complètes à prix groupé : vidéosurveillance, réseau, informatique…",
};

async function fetchPacks(): Promise<Pack[]> {
  try {
    const res = await fetch(`${BASE}/api/packs/`, { cache: "no-store" });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export default async function PacksPage() {
  const maintenance = await getMaintenance();
  if (maintenance) return <MaintenanceScreen message={maintenance.message} />;

  const packs = await fetchPacks();
  return <PacksContent initialPacks={packs} />;
}
