import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes('YOUR_SUPABASE')
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Initial Seed Data for Instant Experience & Testing
export const INITIAL_DEMO_PROFILES = [
  {
    id: 'seller_101',
    name: 'Amina Kwamboka (Nairobi Artisans)',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
    role: 'seller',
    email: 'seller@reneo.live',
    created_at: new Date().toISOString(),
  },
  {
    id: 'customer_202',
    name: 'Kwame Osei',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300',
    role: 'customer',
    email: 'customer@reneo.live',
    created_at: new Date().toISOString(),
  },
];

export const INITIAL_DEMO_PRODUCTS = [
  {
    id: 'prod_kente_bag',
    seller_id: 'seller_101',
    seller_name: 'Amina Kwamboka',
    seller_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
    name: 'Handwoven Authentic Kente Tote Bag',
    description: 'Masterfully woven by Ashanti craftspeople using pure cotton thread. Features reinforced leather straps and brass zipper closure.',
    price: 45.00,
    image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&q=80&w=600',
    stock: 12,
    status: 'active' as const,
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'prod_shea_butter',
    seller_id: 'seller_101',
    seller_name: 'Amina Kwamboka',
    seller_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
    name: 'Raw Organic Unrefined Ghana Shea Butter (250g)',
    description: '100% pure cold-pressed unrefined shea butter enriched with vitamins A & E. Sourced directly from Northern Ghana women cooperatives.',
    price: 18.50,
    image: 'https://images.unsplash.com/photo-1608248597262-8382d6451634?auto=format&fit=crop&q=80&w=600',
    stock: 25,
    status: 'active' as const,
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: 'prod_beaded_necklace',
    seller_id: 'seller_101',
    seller_name: 'Amina Kwamboka',
    seller_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
    name: 'Maasai Tribal Beaded Collar Necklace',
    description: 'Handcrafted traditional Maasai glass beadwork featuring vibrant symbolic color geometry. Lightweight and adjustable.',
    price: 32.00,
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=600',
    stock: 8,
    status: 'active' as const,
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'prod_ethiopian_coffee',
    seller_id: 'seller_101',
    seller_name: 'Amina Kwamboka',
    seller_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
    name: 'Yirgacheffe Specialty Coffee Beans (500g)',
    description: 'Single-origin Ethiopian highland beans with bright citrus aroma, floral jasmine finish, and silky body.',
    price: 22.00,
    image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&q=80&w=600',
    stock: 18,
    status: 'active' as const,
    created_at: new Date().toISOString(),
  },
];

export const INITIAL_DEMO_SESSIONS = [
  {
    live_id: 'live_kente_showcase',
    host_id: 'seller_101',
    host_name: 'Amina Kwamboka',
    host_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
    product_id: 'prod_kente_bag',
    product: INITIAL_DEMO_PRODUCTS[0],
    title: 'Live Handwoven Kente Showcase & Direct Q&A 👜',
    status: 'live' as const,
    viewer_count: 42,
    created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
  },
];

export const INITIAL_DEMO_CHAT = [
  {
    id: 'm1',
    live_id: 'live_kente_showcase',
    user_id: 'customer_202',
    user_name: 'Kwame Osei',
    user_role: 'customer' as const,
    user_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300',
    message: 'Jambo Amina! Is the tote bag strap adjustable?',
    timestamp: new Date(Date.now() - 1000 * 60 * 12).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  },
  {
    id: 'm2',
    live_id: 'live_kente_showcase',
    user_id: 'seller_101',
    user_name: 'Amina Kwamboka (Host)',
    user_role: 'seller' as const,
    user_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
    message: 'Habari Kwame! Yes, the shoulder strap has 3 brass adjustment holes.',
    timestamp: new Date(Date.now() - 1000 * 60 * 10).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  },
  {
    id: 'm3',
    live_id: 'live_kente_showcase',
    user_id: 'customer_303',
    user_name: 'Zainab Diallo',
    user_role: 'customer' as const,
    user_avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&q=80&w=300',
    message: 'Love the yellow weave pattern! Adding one to cart now ❤️',
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  },
];
