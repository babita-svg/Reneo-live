export type UserRole = 'seller' | 'customer';

export type ProductStatus = 'active' | 'out_of_stock' | 'archived';

export type LiveStatus = 'scheduled' | 'live' | 'ended';

export interface UserProfile {
  id: string;
  name: string;
  avatar: string;
  role: UserRole;
  email?: string;
  created_at: string;
}

export interface Product {
  id: string;
  seller_id: string;
  seller_name?: string;
  seller_avatar?: string;
  name: string;
  description: string;
  price: number;
  image: string;
  stock: number;
  status: ProductStatus;
  created_at: string;
}

export interface LiveSession {
  live_id: string;
  host_id: string;
  host_name: string;
  host_avatar: string;
  product_id: string | null;
  product?: Product | null;
  title: string;
  status: LiveStatus;
  viewer_count: number;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  live_id: string;
  user_id: string;
  user_name: string;
  user_role: UserRole;
  user_avatar: string;
  message: string;
  timestamp: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface FloatingEmoji {
  id: string;
  emoji: string;
  leftPercent: number;
}

export interface StreamErrorNotice {
  id: string;
  type: 'camera_denied' | 'mic_unavailable' | 'agora_failed' | 'ended' | 'product_not_found' | 'session_expired' | 'network_error';
  title: string;
  message: string;
  actionableText?: string;
}
