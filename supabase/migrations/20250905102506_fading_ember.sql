/*
  # Admin Management System

  1. New Tables
    - `site_content` - Manages dynamic site content (texts, images, etc.)
      - `id` (uuid, primary key)
      - `key` (text, unique identifier for content)
      - `type` (text, content type: text, image, html)
      - `value` (text, content value)
      - `description` (text, human readable description)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `products` - Product management table
      - `id` (serial, primary key)
      - `name` (text, product name)
      - `description` (text, product description)
      - `price` (numeric, product price)
      - `category` (text, product category)
      - `image_url` (text, product image URL)
      - `rating` (numeric, average rating)
      - `reviews_count` (integer, number of reviews)
      - `is_active` (boolean, product visibility)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `media_files` - File management for images and PDFs
      - `id` (uuid, primary key)
      - `filename` (text, original filename)
      - `file_path` (text, storage path)
      - `file_type` (text, MIME type)
      - `file_size` (bigint, file size in bytes)
      - `uploaded_by` (uuid, user who uploaded)
      - `is_public` (boolean, public accessibility)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Admin-only policies for content and product management
    - Public read access for active content and products
    - Secure file upload policies

  3. Functions
    - Trigger to update `updated_at` timestamps
    - Function to handle new user profile creation
*/

-- Create site_content table for dynamic content management
CREATE TABLE IF NOT EXISTS site_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  type text NOT NULL CHECK (type IN ('text', 'image', 'html', 'json')),
  value text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create products table for product management
CREATE TABLE IF NOT EXISTS products (
  id serial PRIMARY KEY,
  name text NOT NULL,
  description text,
  price numeric(10,2) NOT NULL CHECK (price >= 0),
  category text NOT NULL,
  image_url text,
  rating numeric(3,2) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  reviews_count integer DEFAULT 0 CHECK (reviews_count >= 0),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create media_files table for file management
CREATE TABLE IF NOT EXISTS media_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  filename text NOT NULL,
  file_path text NOT NULL,
  file_type text NOT NULL,
  file_size bigint NOT NULL CHECK (file_size > 0),
  uploaded_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  is_public boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_files ENABLE ROW LEVEL SECURITY;

-- Site Content Policies
CREATE POLICY "Public can read active site content"
  ON site_content
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Admins can manage site content"
  ON site_content
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Products Policies
CREATE POLICY "Public can read active products"
  ON products
  FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Admins can manage all products"
  ON products
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Media Files Policies
CREATE POLICY "Public can read public media files"
  ON media_files
  FOR SELECT
  TO public
  USING (is_public = true);

CREATE POLICY "Users can read own media files"
  ON media_files
  FOR SELECT
  TO authenticated
  USING (uploaded_by = auth.uid());

CREATE POLICY "Admins can manage all media files"
  ON media_files
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Authenticated users can upload media files"
  ON media_files
  FOR INSERT
  TO authenticated
  WITH CHECK (uploaded_by = auth.uid());

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_site_content_key ON site_content(key);
CREATE INDEX IF NOT EXISTS idx_site_content_type ON site_content(type);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_rating ON products(rating);
CREATE INDEX IF NOT EXISTS idx_media_files_type ON media_files(file_type);
CREATE INDEX IF NOT EXISTS idx_media_files_public ON media_files(is_public);
CREATE INDEX IF NOT EXISTS idx_media_files_uploaded_by ON media_files(uploaded_by);

-- Create triggers for updated_at
CREATE TRIGGER update_site_content_updated_at
  BEFORE UPDATE ON site_content
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

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

-- Insert sample products
INSERT INTO products (name, description, price, category, image_url, rating, reviews_count) VALUES
  ('Premium Corporate Polo Shirt', 'High-quality cotton polo shirt perfect for corporate branding. Available in multiple colors with embroidery options.', 249.00, 'corporate-clothing', 'https://images.pexels.com/photos/8532616/pexels-photo-8532616.jpeg?auto=compress&cs=tinysrgb&w=400', 4.8, 124),
  ('Executive Gift Set', 'Luxury executive gift set including pen, notebook, and business card holder in premium leather.', 599.00, 'corporate-gifts', 'https://images.pexels.com/photos/6373478/pexels-photo-6373478.jpeg?auto=compress&cs=tinysrgb&w=400', 4.9, 89),
  ('Safety Workwear Bundle', 'Complete safety workwear package including high-visibility vest, hard hat, and safety boots.', 1299.00, 'workwear', 'https://images.pexels.com/photos/8486911/pexels-photo-8486911.jpeg?auto=compress&cs=tinysrgb&w=400', 4.7, 156),
  ('Custom Branded Cap', 'Adjustable cap with custom embroidery. Perfect for promotional events and corporate branding.', 89.00, 'headwear-and-accessories', 'https://images.pexels.com/photos/1124465/pexels-photo-1124465.jpeg?auto=compress&cs=tinysrgb&w=400', 4.6, 203),
  ('Corporate Hoodie', 'Comfortable cotton hoodie with modern fit. Ideal for casual corporate wear and team building events.', 399.00, 'corporate-clothing', 'https://images.pexels.com/photos/8532616/pexels-photo-8532616.jpeg?auto=compress&cs=tinysrgb&w=400', 4.5, 167),
  ('Promotional Tote Bag', 'Eco-friendly canvas tote bag perfect for promotional campaigns and corporate events.', 45.00, 'corporate-gifts', 'https://images.pexels.com/photos/6373478/pexels-photo-6373478.jpeg?auto=compress&cs=tinysrgb&w=400', 4.4, 289)
ON CONFLICT DO NOTHING;