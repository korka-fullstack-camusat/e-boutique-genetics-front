import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

/**
 * Endpoint interne appelé par l'admin après création/modification/suppression
 * d'un produit. Vide le cache ISR des pages publiques pour que le nouveau
 * produit apparaisse immédiatement côté client (sans attendre 60s).
 */
export async function POST() {
  revalidatePath("/");
  revalidatePath("/boutique");
  return NextResponse.json({ revalidated: true, now: Date.now() });
}
