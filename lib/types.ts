export interface Product {
  id: number;
  name: string;
  description: string | null;
  price: number;
  category: string | null;
  sous_category: string | null;
  stock: number;
  images: string[];
  sizes: string[];
  colors: string[];
  condition?: string | null;
  reference?: string | null;
  marque?: string | null;
  disponibilite?: string | null;
  created_at: string;
}

export interface ProductCreate {
  name: string;
  description?: string | null;
  price: number;
  category?: string | null;
  sous_category?: string | null;
  stock?: number;
  images?: string[];
  sizes?: string[];
  colors?: string[];
  condition?: string | null;
  reference?: string | null;
  marque?: string | null;
  disponibilite?: string | null;
}

export interface ProductUpdate extends Partial<ProductCreate> {}

export interface OrderItemCreate {
  product_id?: number | null;
  pack_id?: number | null;
  product_name: string;
  quantity: number;
  price: number;
  size?: string | null;
  color?: string | null;
}

export interface OrderItemResponse extends OrderItemCreate {
  id: number;
}

export interface OrderCreate {
  customer_name: string;
  customer_email: string;
  customer_phone?: string | null;
  customer_address?: string | null;
  payment_method: string;
  total_amount: number;
  delivery_method?: string | null;
  delivery_fee?: number;
  acompte_amount?: number | null;
  items: OrderItemCreate[];
}

export interface OrderUpdate {
  status?: string | null;
}

export interface Order {
  id: number;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  customer_address: string | null;
  payment_method: string;
  total_amount: number;
  acompte_amount?: number | null;
  invoice_number?: number | null;
  status: string;
  created_at: string;
  items: OrderItemResponse[];
}

export interface Survey {
  id: number;
  name: string;
  email: string;
  age: string | null;
  profession: string | null;
  style: string | null;
  brand: string | null;
  hobbies: string | null;
  monthly_budget: string | null;
  clothing_type: string | null;
  suggestions: string | null;
  created_at: string;
}

export interface CartItem {
  /** Pour un pack : produit « virtuel » portant le nom, le prix et l'image du pack. */
  product: Product;
  quantity: number;
  size?: string | null;
  color?: string | null;
  /** Renseigné quand la ligne du panier est un pack. */
  packId?: number | null;
  packItems?: PackItem[];
}

export interface PackItem {
  product_id: number;
  quantity: number;
  product_name: string;
  product_price: number;
  product_image: string | null;
  product_stock: number;
}

export interface Pack {
  id: number;
  name: string;
  description: string | null;
  price: number;
  images: string[];
  is_active: boolean;
  created_at: string;
  items: PackItem[];
  /** Somme des prix des produits du pack. */
  regular_price: number;
  savings: number;
  /** Nombre de packs réalisables avec le stock actuel. */
  stock: number;
}

export interface PackInput {
  name: string;
  description?: string | null;
  price: number;
  images?: string[];
  is_active?: boolean;
  items: { product_id: number; quantity: number }[];
}

export type PartnerStatus = "nouveau" | "contacte" | "valide" | "refuse";

export interface PartnerApplicationInput {
  full_name: string;
  company?: string | null;
  phone: string;
  email: string;
  city: string;
  zones?: string | null;
  specialties: string[];
  experience_years: string;
  team_size?: string | null;
  certifications?: string | null;
  message?: string | null;
}

export interface PartnerApplication extends PartnerApplicationInput {
  id: number;
  status: PartnerStatus;
  created_at: string;
}

export type OrderStatus = "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: string;
  is_active: boolean;
  created_at: string;
}
