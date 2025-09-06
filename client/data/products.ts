import { Product } from "@/lib/supabaseClient";

// Categories configuration for the site
export const categories = [
  {
    title: "Corporate Gifts",
    description: "Premium branded items for your business",
    image: "https://images.pexels.com/photos/6373478/pexels-photo-6373478.jpeg?auto=compress&cs=tinysrgb&w=800",
    href: "/corporate-gifts",
    count: 0, // Will be updated from database
  },
  {
    title: "Corporate Clothing",
    description: "Professional apparel for your team",
    image: "https://images.pexels.com/photos/8532616/pexels-photo-8532616.jpeg?auto=compress&cs=tinysrgb&w=800",
    href: "/corporate-clothing",
    count: 0,
  },
  {
    title: "Workwear",
    description: "Durable clothing for every industry",
    image: "https://images.pexels.com/photos/8486911/pexels-photo-8486911.jpeg?auto=compress&cs=tinysrgb&w=800",
    href: "/workwear",
    count: 0,
  },
  {
    title: "Headwear & Accessories",
    description: "Caps, hats, and promotional accessories",
    image: "https://images.pexels.com/photos/1124465/pexels-photo-1124465.jpeg?auto=compress&cs=tinysrgb&w=800",
    href: "/headwear-and-accessories",
    count: 0,
  },
];

// Helper function to get category display name
export const getCategoryDisplayName = (category: string): string => {
  const categoryMap: { [key: string]: string } = {
    'corporate-gifts': 'Corporate Gifts',
    'corporate-clothing': 'Corporate Clothing',
    'workwear': 'Workwear',
    'headwear-and-accessories': 'Headwear & Accessories',
  };
  return categoryMap[category] || category;
};

// Helper function to get products by category (using Supabase)
export const getProductsByCategory = async (category: string): Promise<Product[]> => {
  const { products } = await import('@/lib/supabaseClient');
  return await products.getByCategory(category);
};

// Helper function to get all products (using Supabase)
export const getAllProducts = async (): Promise<Product[]> => {
  const { products } = await import('@/lib/supabaseClient');
  return await products.getAll();
};

// Helper function to get product by ID (using Supabase)
export const getProductById = async (id: string): Promise<Product | null> => {
  const { products } = await import('@/lib/supabaseClient');
  return await products.getById(id);
};

// Helper function to get featured products (using Supabase)
export const getFeaturedProducts = async (limit: number = 4): Promise<Product[]> => {
  const allProducts = await getAllProducts();
  return allProducts.slice(0, limit);
};