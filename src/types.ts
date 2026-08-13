export type UserRole = 'seller' | 'customer';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
  role: UserRole;
  created_at: string;
}

export interface Product {
  id: string;
  seller_id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  image_url: string;
  stock: number;
  status: 'active' | 'archived';
  created_at: string;
}

export interface LiveSession {
  id: string;
  seller_id: string;
  seller_name: string;
  title: string;
  channel_name: string;
  current_product_id?: string;
  featured_product?: Product;
  status: 'live' | 'ended';
  viewer_count: number;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  user_name: string;
  user_role: UserRole;
  message: string;
  timestamp: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}
