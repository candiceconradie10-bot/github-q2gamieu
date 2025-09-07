/*
  # Final Consolidated E-commerce Schema
  
  This migration consolidates all previous schemas into a clean, production-ready setup:
  - Complete e-commerce functionality with products, orders, cart, wishlist
  - Proper admin role management with both is_admin boolean and role field
  - Row Level Security (RLS) policies for all tables
  - Optimized indexes and triggers
  - Sample data seeding
  
  Tables created:
  - profiles: User profile information extending Supabase auth
  - products: Product catalog with stock management
  - cart_items: Persistent shopping cart items
  - orders: Order management with status tracking
  - wishlists: User wishlist functionality
  - payment_methods: Stored payment method information
  - admin_activity: Admin action audit logging
  - site_content: Dynamic site content management
  - media_files: File upload management
*/

-- Drop existing tables to ensure clean slate (CASCADE removes dependencies)
DROP TABLE IF EXISTS media_files CASCADE;
DROP TABLE IF EXISTS site_content CASCADE;
DROP TABLE IF EXISTS admin_activity CASCADE;
DROP TABLE IF EXISTS payment_methods CASCADE;
DROP TABLE IF EXISTS wishlists CASCADE;
DROP TABLE IF EXISTS cart_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Create profiles table (extends Supabase auth.users)
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text,
  phone text,
  address jsonb,
  -- Admin role management - using both approaches for flexibility
  is_admin boolean DEFAULT false,
  role text DEFAULT 'user' CHECK (role IN ('user', 'admin', 'customer')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create products table (using UUID for scalability)
CREATE TABLE products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  price numeric(10,2) NOT NULL CHECK (price >= 0),
  image_url text,
  category text NOT NULL DEFAULT 'general',
  stock integer NOT NULL DEFAULT 0 CHECK (stock >= 0),
  rating numeric(3,2) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  reviews_count integer DEFAULT 0 CHECK (reviews_count >= 0),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create orders table
CREATE TABLE orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  products jsonb NOT NULL, -- Array of {product_id, title, price, quantity}
  total numeric(10,2) NOT NULL CHECK (total >= 0),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'completed', 'cancelled')),
  shipping_address jsonb NOT NULL,
  payment_method text DEFAULT 'manual',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create cart_items table for persistent shopping cart
CREATE TABLE cart_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  quantity integer NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- Create wishlists table
CREATE TABLE wishlists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- Create payment_methods table
CREATE TABLE payment_methods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  provider text NOT NULL, -- 'stripe', 'mock', 'manual', etc.
  provider_pm_id text NOT NULL, -- token/id from provider
  is_default boolean DEFAULT false,
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create admin_activity table for audit logging
CREATE TABLE admin_activity (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  action text NOT NULL,
  target_type text,
  target_id text,
  payload jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create site_content table for dynamic content management
CREATE TABLE site_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  type text NOT NULL CHECK (type IN ('text', 'image', 'html', 'json')),
  value text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create media_files table for file management
CREATE TABLE media_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  filename text NOT NULL,
  file_path text NOT NULL,
  file_type text NOT NULL,
  file_size bigint NOT NULL CHECK (file_size > 0),
  uploaded_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  is_public boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_files ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND (p.is_admin = true OR p.role = 'admin')
    )
  );

-- Products policies
CREATE POLICY "Anyone can view active products"
  ON products FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage all products"
  ON products FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND (p.is_admin = true OR p.role = 'admin')
    )
  );

-- Orders policies
CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own orders"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view all orders"
  ON orders FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND (p.is_admin = true OR p.role = 'admin')
    )
  );

CREATE POLICY "Admins can update all orders"
  ON orders FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND (p.is_admin = true OR p.role = 'admin')
    )
  );

-- Cart items policies
CREATE POLICY "Users can manage own cart items"
  ON cart_items FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- Wishlists policies
CREATE POLICY "Users can manage own wishlist"
  ON wishlists FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- Payment methods policies
CREATE POLICY "Users can manage own payment methods"
  ON payment_methods FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- Admin activity policies (admin only)
CREATE POLICY "Admins can view admin activity"
  ON admin_activity FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND (p.is_admin = true OR p.role = 'admin')
    )
  );

CREATE POLICY "Admins can log admin activity"
  ON admin_activity FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND (p.is_admin = true OR p.role = 'admin')
    )
  );

-- Site content policies
CREATE POLICY "Anyone can read site content"
  ON site_content FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage site content"
  ON site_content FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND (p.is_admin = true OR p.role = 'admin')
    )
  );

-- Media files policies
CREATE POLICY "Public can read public media files"
  ON media_files FOR SELECT
  USING (is_public = true);

CREATE POLICY "Users can read own media files"
  ON media_files FOR SELECT
  TO authenticated
  USING (uploaded_by = auth.uid());

CREATE POLICY "Authenticated users can upload media files"
  ON media_files FOR INSERT
  TO authenticated
  WITH CHECK (uploaded_by = auth.uid());

CREATE POLICY "Admins can manage all media files"
  ON media_files FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND (p.is_admin = true OR p.role = 'admin')
    )
  );

-- Function to handle new user signup (creates profile automatically)
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, is_admin, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    CASE 
      WHEN NEW.email = 'jantjieskurt7@gmail.com' THEN true
      ELSE false
    END,
    CASE 
      WHEN NEW.email = 'jantjieskurt7@gmail.com' THEN 'admin'
      ELSE 'user'
    END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at timestamps
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_cart_items_updated_at
  BEFORE UPDATE ON cart_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_site_content_updated_at
  BEFORE UPDATE ON site_content
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Create optimized indexes for performance
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_admin ON profiles(is_admin);
CREATE INDEX idx_profiles_role ON profiles(role);

CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_active ON products(is_active);
CREATE INDEX idx_products_price ON products(price);
CREATE INDEX idx_products_rating ON products(rating);

CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);

CREATE INDEX idx_cart_items_user_id ON cart_items(user_id);
CREATE INDEX idx_cart_items_product_id ON cart_items(product_id);

CREATE INDEX idx_wishlists_user_id ON wishlists(user_id);
CREATE INDEX idx_wishlists_product_id ON wishlists(product_id);

CREATE INDEX idx_payment_methods_user_id ON payment_methods(user_id);
CREATE INDEX idx_payment_methods_default ON payment_methods(is_default);

CREATE INDEX idx_admin_activity_admin_id ON admin_activity(admin_id);
CREATE INDEX idx_admin_activity_created_at ON admin_activity(created_at DESC);

CREATE INDEX idx_site_content_key ON site_content(key);
CREATE INDEX idx_site_content_type ON site_content(type);

CREATE INDEX idx_media_files_uploaded_by ON media_files(uploaded_by);
CREATE INDEX idx_media_files_public ON media_files(is_public);
CREATE INDEX idx_media_files_type ON media_files(file_type);

-- Create storage bucket for product images (idempotent)
INSERT INTO storage.buckets (id, name, public)
VALUES ('products', 'products', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for product images
CREATE POLICY "Product images: public read access" ON storage.objects
  FOR SELECT USING (bucket_id = 'products');

CREATE POLICY "Product images: admin upload access" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'products' 
    AND EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = auth.uid() 
      AND (p.role = 'admin' OR p.is_admin = true)
    )
  );

CREATE POLICY "Product images: admin update access" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'products' 
    AND EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = auth.uid() 
      AND (p.role = 'admin' OR p.is_admin = true)
    )
  );

CREATE POLICY "Product images: admin delete access" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'products' 
    AND EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = auth.uid() 
      AND (p.role = 'admin' OR p.is_admin = true)
    )
  );

-- Insert default site content
INSERT INTO site_content (key, type, value, description) VALUES
  ('hero_title', 'text', 'Welcome to W.O.S APEX', 'Main hero section title'),
  ('hero_subtitle', 'text', 'Your one-stop destination for premium clothing, workwear and gifting', 'Hero section subtitle'),
  ('hero_background_1', 'image', 'https://images.pexels.com/photos/33737019/pexels-photo-33737019.jpeg?auto=compress&cs=tinysrgb&w=1920', 'Hero slideshow background 1'),
  ('hero_background_2', 'image', 'https://images.pexels.com/photos/8486911/pexels-photo-8486911.jpeg?auto=compress&cs=tinysrgb&w=1920', 'Hero slideshow background 2'),
  ('hero_background_3', 'image', 'https://images.pexels.com/photos/4194843/pexels-photo-4194843.jpeg?auto=compress&cs=tinysrgb&w=1920', 'Hero slideshow background 3'),
  ('about_title', 'text', 'Welcome to W.O.S APEX', 'About section title'),
  ('about_description', 'text', 'At W.O.S APEX we believe your clothing should work as hard as you do, and look good doing it. W.O.S APEX is your one-stop online destination for premium clothing, durable workwear and curated gifting.', 'About section description'),
  ('contact_phone', 'text', '+27 76 035 5295', 'Contact phone number'),
  ('contact_email', 'text', 'apex@w-o-s.co.za', 'Contact email address'),
  ('company_address', 'text', 'Cape Town, South Africa', 'Company address')
ON CONFLICT (key) DO NOTHING;

-- Insert sample products for testing and demonstration
INSERT INTO products (name, description, price, image_url, stock, category, rating, reviews_count) VALUES
  (
    'Premium Corporate Polo Shirt',
    'High-quality cotton polo shirt perfect for corporate branding. Available in multiple colors with embroidery options. Comfortable fit and durable fabric.',
    249.00,
    'https://images.pexels.com/photos/8532616/pexels-photo-8532616.jpeg?auto=compress&cs=tinysrgb&w=800',
    150,
    'corporate-clothing',
    4.8,
    124
  ),
  (
    'Executive Gift Set',
    'Luxury executive gift set including premium pen, leather notebook, and business card holder. Perfect for corporate gifting and special occasions.',
    599.00,
    'https://images.pexels.com/photos/6373478/pexels-photo-6373478.jpeg?auto=compress&cs=tinysrgb&w=800',
    45,
    'corporate-gifts',
    4.9,
    89
  ),
  (
    'Safety Workwear Bundle',
    'Complete safety workwear package including high-visibility vest, hard hat, safety boots, and protective gloves. Meets all safety standards.',
    1299.00,
    'https://images.pexels.com/photos/8486911/pexels-photo-8486911.jpeg?auto=compress&cs=tinysrgb&w=800',
    30,
    'workwear',
    4.7,
    156
  ),
  (
    'Custom Branded Cap',
    'Adjustable cap with custom embroidery options. Perfect for promotional events and corporate branding. One size fits all with comfortable fit.',
    89.00,
    'https://images.pexels.com/photos/1124465/pexels-photo-1124465.jpeg?auto=compress&cs=tinysrgb&w=800',
    200,
    'headwear-and-accessories',
    4.6,
    203
  ),
  (
    'Corporate Hoodie',
    'Comfortable cotton blend hoodie with modern fit. Ideal for casual corporate wear and team building events. Available in multiple sizes.',
    399.00,
    'https://images.pexels.com/photos/8532616/pexels-photo-8532616.jpeg?auto=compress&cs=tinysrgb&w=800',
    75,
    'corporate-clothing',
    4.5,
    167
  ),
  (
    'Promotional Tote Bag',
    'Eco-friendly canvas tote bag perfect for promotional campaigns and corporate events. Durable construction with custom printing options.',
    45.00,
    'https://images.pexels.com/photos/6373478/pexels-photo-6373478.jpeg?auto=compress&cs=tinysrgb&w=800',
    300,
    'corporate-gifts',
    4.4,
    289
  ),
  (
    'Premium Work Jacket',
    'Water-resistant work jacket with multiple pockets and reinforced seams. Perfect for outdoor work environments.',
    799.00,
    'https://images.pexels.com/photos/8486911/pexels-photo-8486911.jpeg?auto=compress&cs=tinysrgb&w=800',
    60,
    'workwear',
    4.3,
    98
  ),
  (
    'Corporate T-Shirt',
    'Soft cotton t-shirt perfect for casual corporate wear and promotional events. Comfortable fit with custom branding options.',
    149.00,
    'https://images.pexels.com/photos/8532616/pexels-photo-8532616.jpeg?auto=compress&cs=tinysrgb&w=800',
    250,
    'corporate-clothing',
    4.7,
    201
  );

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Final consolidated schema created successfully!';
    RAISE NOTICE 'Tables created: profiles, products, orders, cart_items, wishlists, payment_methods, admin_activity, site_content, media_files';
    RAISE NOTICE 'RLS policies enabled for all tables';
    RAISE NOTICE 'Admin role: jantjieskurt7@gmail.com will be automatically set as admin on signup';
    RAISE NOTICE 'Sample products and site content inserted';
END $$;