import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Database Types
export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  category: string;
  rating: number;
  reviews_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  email: string;
  full_name?: string;
  phone?: string;
  address?: any;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  created_at: string;
  updated_at: string;
  product?: Product;
}

export interface Order {
  id: string;
  user_id: string;
  products: any[]; // Array of {product_id, title, price, quantity}
  total: number;
  status: 'pending' | 'shipped' | 'completed' | 'cancelled';
  shipping_address: any;
  created_at: string;
  updated_at: string;
}

// Auth helper functions
export const auth = {
  async signUp(email: string, password: string, metadata?: any) {
    return await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    });
  },

  async signIn(email: string, password: string) {
    return await supabase.auth.signInWithPassword({
      email,
      password
    });
  },

  async signOut() {
    return await supabase.auth.signOut();
  },

  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },

  async getCurrentProfile(): Promise<Profile | null> {
    const user = await this.getCurrentUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }

    return data;
  }
};

// Product helper functions
export const products = {
  async getAll(): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching products:', error);
      return [];
    }

    return data || [];
  },

  async getAllForAdmin(): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching all products for admin:', error);
      return [];
    }

    return data || [];
  },

  async getById(id: number): Promise<Product | null> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .eq('is_active', true)
      .single();

    if (error) {
      console.error('Error fetching product:', error);
      return null;
    }

    return data;
  },

  async getByCategory(category: string): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('category', category)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching products by category:', error);
      return [];
    }

    return data || [];
  },

  async create(product: Omit<Product, 'id' | 'created_at' | 'updated_at'>) {
    return await supabase
      .from('products')
      .insert([{
        name: product.name,
        description: product.description,
        price: product.price,
        image_url: product.image_url,
        category: product.category,
        rating: product.rating || 0,
        reviews_count: product.reviews_count || 0,
        is_active: product.is_active
      }])
      .select()
      .single();
  },

  async update(id: number, updates: Partial<Product>) {
    return await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
  },

  async delete(id: number) {
    return await supabase
      .from('products')
      .delete()
      .eq('id', id);
  }
};

// Cart helper functions
export const cart = {
  async getItems(userId: string): Promise<CartItem[]> {
    const { data, error } = await supabase
      .from('cart_items')
      .select(`
        *,
        product:products(*)
      `)
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching cart items:', error);
      return [];
    }

    return data || [];
  },

  async addItem(userId: string, productId: string, quantity: number = 1) {
    // Check if item already exists in cart
    const { data: existingItem } = await supabase
      .from('cart_items')
      .select('*')
      .eq('user_id', userId)
      .eq('product_id', productId)
      .single();

    if (existingItem) {
      // Update quantity
      return await supabase
        .from('cart_items')
        .update({ quantity: existingItem.quantity + quantity })
        .eq('id', existingItem.id)
        .select()
        .single();
    } else {
      // Add new item
      return await supabase
        .from('cart_items')
        .insert([{ user_id: userId, product_id: productId, quantity }])
        .select()
        .single();
    }
  },

  async updateQuantity(itemId: string, quantity: number) {
    if (quantity <= 0) {
      return this.removeItem(itemId);
    }

    return await supabase
      .from('cart_items')
      .update({ quantity })
      .eq('id', itemId)
      .select()
      .single();
  },

  async removeItem(itemId: string) {
    return await supabase
      .from('cart_items')
      .delete()
      .eq('id', itemId);
  },

  async clearCart(userId: string) {
    return await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', userId);
  }
};

// Orders helper functions
export const orders = {
  async create(order: Omit<Order, 'id' | 'created_at' | 'updated_at'>) {
    return await supabase
      .from('orders')
      .insert([order])
      .select()
      .single();
  },

  async getUserOrders(userId: string): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user orders:', error);
      return [];
    }

    return data || [];
  },

  async getAll(): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching all orders:', error);
      return [];
    }

    return data || [];
  },

  async updateStatus(orderId: string, status: Order['status']) {
    return await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId)
      .select()
      .single();
  }
};