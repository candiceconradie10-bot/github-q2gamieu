import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY;
if (!url || !anon) throw new Error('VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY missing');

export const supabase = createClient(url, anon);

// Database Types
export interface Product {
  id: string; // UUID type
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  category: string;
  stock: number; // Added stock field
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
  role?: string; // Add role field for admin checks
  created_at: string;
  updated_at: string;
}

// New interfaces for wishlist and payment methods
export interface WishlistItem {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
  product?: Product;
}

export interface PaymentMethod {
  id: string;
  user_id: string;
  provider: string; // 'stripe', 'mock', etc.
  provider_pm_id: string;
  is_default: boolean;
  metadata?: any;
  created_at: string;
}

export interface AdminActivity {
  id: string;
  admin_id?: string;
  action: string;
  target_type?: string;
  target_id?: string;
  payload?: any;
  created_at: string;
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

  async getById(id: string): Promise<Product | null> {
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
        stock: product.stock || 0,
        rating: product.rating || 0,
        reviews_count: product.reviews_count || 0,
        is_active: product.is_active
      }])
      .select()
      .single();
  },

  async update(id: string, updates: Partial<Product>) {
    return await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
  },

  async delete(id: string) {
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

// Wishlist helper functions
export const wishlist = {
  async add(userId: string, productId: string) {
    return await supabase
      .from('wishlists')
      .insert({ user_id: userId, product_id: productId })
      .select()
      .single();
  },

  async remove(userId: string, productId: string) {
    return await supabase
      .from('wishlists')
      .delete()
      .match({ user_id: userId, product_id: productId });
  },

  async getItems(userId: string): Promise<WishlistItem[]> {
    const { data, error } = await supabase
      .from('wishlists')
      .select(`
        *,
        products(*)
      `)
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching wishlist items:', error);
      return [];
    }

    return data || [];
  },

  async isInWishlist(userId: string, productId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('wishlists')
      .select('id')
      .eq('user_id', userId)
      .eq('product_id', productId)
      .single();

    return !error && !!data;
  }
};

// Payment Methods helper functions
export const paymentMethods = {
  async getAll(userId: string): Promise<PaymentMethod[]> {
    const { data, error } = await supabase
      .from('payment_methods')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching payment methods:', error);
      return [];
    }

    return data || [];
  },

  async add(userId: string, method: Omit<PaymentMethod, 'id' | 'user_id' | 'created_at'>) {
    return await supabase
      .from('payment_methods')
      .insert([{ user_id: userId, ...method }])
      .select()
      .single();
  },

  async remove(methodId: string) {
    return await supabase
      .from('payment_methods')
      .delete()
      .eq('id', methodId);
  },

  async setDefault(userId: string, methodId: string) {
    // First, unset all defaults for user
    await supabase
      .from('payment_methods')
      .update({ is_default: false })
      .eq('user_id', userId);

    // Then set the selected one as default
    return await supabase
      .from('payment_methods')
      .update({ is_default: true })
      .eq('id', methodId)
      .eq('user_id', userId);
  }
};

// Admin Activity helper functions
export const adminActivity = {
  async log(adminId: string, action: string, targetType?: string, targetId?: string, payload?: any) {
    return await supabase
      .from('admin_activity')
      .insert([{
        admin_id: adminId,
        action,
        target_type: targetType,
        target_id: targetId,
        payload
      }])
      .select()
      .single();
  },

  async getAll(limit: number = 100): Promise<AdminActivity[]> {
    const { data, error } = await supabase
      .from('admin_activity')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching admin activity:', error);
      return [];
    }

    return data || [];
  }
};

// Admin helper functions
export const admin = {
  async isAdmin(userId?: string): Promise<boolean> {
    if (!userId) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;
      userId = user.id;
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('is_admin, role')
      .eq('id', userId)
      .single();

    if (error || !data) return false;
    
    return data.is_admin || data.role === 'admin';
  }
};