-- ==============================================================================
-- RENEO LIVE COMMERCE - SUPABASE DATABASE SCHEMA & ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ENUMS & TYPES
CREATE TYPE user_role AS ENUM ('seller', 'customer');
CREATE TYPE product_status AS ENUM ('active', 'out_of_stock', 'archived');
CREATE TYPE live_status AS ENUM ('scheduled', 'live', 'ended');

-- 3. PROFILES TABLE (Linked to auth.users)
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    avatar TEXT,
    role user_role NOT NULL DEFAULT 'customer',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Public profiles are viewable by everyone" 
    ON public.profiles FOR SELECT 
    USING (true);

CREATE POLICY "Users can insert their own profile" 
    ON public.profiles FOR INSERT 
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
    ON public.profiles FOR UPDATE 
    USING (auth.uid() = id);

-- 4. PRODUCTS TABLE
CREATE TABLE public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    seller_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    image TEXT NOT NULL,
    stock INT NOT NULL DEFAULT 0 CHECK (stock >= 0),
    status product_status NOT NULL DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on Products
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Products Policies:
-- Anyone can view active products
CREATE POLICY "Anyone can view products" 
    ON public.products FOR SELECT 
    USING (true);

-- Sellers can only insert products where seller_id matches their authenticated user ID
CREATE POLICY "Sellers can create their own products" 
    ON public.products FOR INSERT 
    WITH CHECK (
        auth.uid() = seller_id AND 
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'seller'
        )
    );

-- Sellers can only update their own products
CREATE POLICY "Sellers can update their own products" 
    ON public.products FOR UPDATE 
    USING (auth.uid() = seller_id)
    WITH CHECK (auth.uid() = seller_id);

-- Sellers can only delete their own products
CREATE POLICY "Sellers can delete their own products" 
    ON public.products FOR DELETE 
    USING (auth.uid() = seller_id);

-- 5. LIVE SESSIONS TABLE
CREATE TABLE public.live_sessions (
    live_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    host_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    status live_status NOT NULL DEFAULT 'scheduled',
    viewer_count INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on Live Sessions
ALTER TABLE public.live_sessions ENABLE ROW LEVEL SECURITY;

-- Live Sessions Policies
CREATE POLICY "Anyone can view live sessions" 
    ON public.live_sessions FOR SELECT 
    USING (true);

CREATE POLICY "Sellers can create live sessions" 
    ON public.live_sessions FOR INSERT 
    WITH CHECK (
        auth.uid() = host_id AND 
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'seller'
        )
    );

CREATE POLICY "Sellers can update their own live sessions" 
    ON public.live_sessions FOR UPDATE 
    USING (auth.uid() = host_id)
    WITH CHECK (auth.uid() = host_id);

CREATE POLICY "Sellers can delete their own live sessions" 
    ON public.live_sessions FOR DELETE 
    USING (auth.uid() = host_id);

-- 6. LIVE MESSAGES TABLE (Realtime Chat)
CREATE TABLE public.live_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    live_id UUID NOT NULL REFERENCES public.live_sessions(live_id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on Live Messages
ALTER TABLE public.live_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone in a live stream can view chat messages" 
    ON public.live_messages FOR SELECT 
    USING (true);

CREATE POLICY "Authenticated users can post chat messages" 
    ON public.live_messages FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

-- 7. SUPABASE STORAGE BUCKET FOR PRODUCT IMAGES
INSERT INTO storage.buckets (id, name, public) 
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public Read Access for Product Images"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

CREATE POLICY "Sellers Upload Product Images"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'product-images' AND 
    auth.role() = 'authenticated'
);

-- Enable Realtime for Live Sessions and Messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.live_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.live_messages;
