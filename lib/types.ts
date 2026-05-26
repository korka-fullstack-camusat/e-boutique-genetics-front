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
}

export interface ProductUpdate extends Partial<ProductCreate> {}

export interface OrderItemCreate {
  product_id: number;
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
  product: Product;
  quantity: number;
  size?: string | null;
  color?: string | null;
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
