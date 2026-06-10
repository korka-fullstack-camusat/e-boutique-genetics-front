import {
  Product, ProductCreate, ProductUpdate,
  Order, OrderCreate, OrderUpdate,
  Survey, AdminUser,
} from "./types";

const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(BASE + path, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const msg = await res.text().catch(() => res.statusText);
    throw new Error(msg);
  }
  return res.json();
}

/** Returns Authorization header from localStorage token (browser only). */
function authHeaders(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem("gg_admin_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function authRequest<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(BASE + path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
      ...(options?.headers as Record<string, string> | undefined),
    },
  });
  if (!res.ok) {
    const msg = await res.text().catch(() => res.statusText);
    throw new Error(msg);
  }
  return res.json();
}

// ── Products ──────────────────────────────────────────────────────────────────
export const productsApi = {
  list: (params?: { category?: string; sous_category?: string; search?: string }) => {
    const qs = new URLSearchParams();
    if (params?.category) qs.set("category", params.category);
    if (params?.sous_category) qs.set("sous_category", params.sous_category);
    if (params?.search) qs.set("search", params.search);
    return request<Product[]>(`/api/products/?${qs}`);
  },
  get: (id: number) => request<Product>(`/api/products/${id}`),
  create: (data: ProductCreate) =>
    request<Product>("/api/products/", { method: "POST", body: JSON.stringify(data) }),
  update: (id: number, data: ProductUpdate) =>
    request<Product>(`/api/products/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  delete: (id: number) =>
    request<unknown>(`/api/products/${id}`, { method: "DELETE" }),
};

// ── Orders ────────────────────────────────────────────────────────────────────
export const ordersApi = {
  list: () => request<Order[]>("/api/orders/"),
  get: (id: number) => request<Order>(`/api/orders/${id}`),
  create: (data: OrderCreate) =>
    request<unknown>("/api/orders/", { method: "POST", body: JSON.stringify(data) }),
  updateStatus: (id: number, data: OrderUpdate) =>
    request<Order>(`/api/orders/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
};

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authApi = {
  login: (email: string, password: string) =>
    request<{ success: boolean; message: string; user?: Record<string, unknown> }>(
      "/api/auth/login",
      { method: "POST", body: JSON.stringify({ email, password }) }
    ),
};

// ── Upload ────────────────────────────────────────────────────────────────────
export const uploadApi = {
  images: async (files: File[]): Promise<string[]> => {
    const form = new FormData();
    files.forEach((f) => form.append("files", f));
    const res = await fetch(BASE + "/api/upload/", { method: "POST", body: form });
    if (!res.ok) throw new Error(await res.text());
    const data = await res.json();
    return data.images as string[];
  },
};

// ── Admin users ───────────────────────────────────────────────────────────────
export const adminUsersApi = {
  list: () => authRequest<AdminUser[]>("/api/admin-users/"),

  create: (data: { name: string; email: string; password: string; role?: string }) =>
    authRequest<AdminUser>("/api/admin-users/", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: number, data: { name?: string; password?: string; is_active?: boolean }) =>
    authRequest<AdminUser>(`/api/admin-users/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  delete: (id: number) =>
    authRequest<{ success: boolean }>(`/api/admin-users/${id}`, { method: "DELETE" }),
};

// ── Devis / Contact ───────────────────────────────────────────────────────────
export const contactApi = {
  devis: (data: {
    name: string;
    email: string;
    phone?: string;
    service: string;
    description: string;
  }) =>
    request<{ message: string }>("/api/contact/devis", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

// ── Revalidation (cache ISR du site public) ───────────────────────────────────
export const revalidateApi = {
  /** Vide le cache des pages "/" et "/boutique" pour refléter les changements produits immédiatement. */
  refresh: () => fetch("/api/revalidate", { method: "POST" }).catch(() => {}),
};

// ── Survey ────────────────────────────────────────────────────────────────────
export const surveysApi = {
  list: () => request<Survey[]>("/api/survey/surveys/"),
  get: (id: number) => request<Survey>(`/api/survey/surveys/${id}`),
  delete: (id: number) => request<unknown>(`/api/survey/surveys/${id}`, { method: "DELETE" }),
};
