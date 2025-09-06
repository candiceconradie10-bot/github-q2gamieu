import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useAuth } from "./AuthContext";
import { cart, Product, CartItem as DBCartItem } from "@/lib/supabaseClient";
import { toast } from "sonner";

export interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  product: Product;
}

interface CartState {
  items: CartItem[];
  total: number;
  itemCount: number;
  loading: boolean;
}

interface CartContextType {
  state: CartState;
  addToCart: (product: Product, quantity?: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const [state, setState] = useState<CartState>({
    items: [],
    total: 0,
    itemCount: 0,
    loading: false
  });

  const calculateTotals = (items: CartItem[]) => {
    const total = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
    return { total, itemCount };
  };

  const refreshCart = async () => {
    if (!user) {
      setState(prev => ({ ...prev, items: [], total: 0, itemCount: 0 }));
      return;
    }

    setState(prev => ({ ...prev, loading: true }));
    
    try {
      const cartItems = await cart.getItems(user.id);
      const transformedItems: CartItem[] = cartItems.map(item => ({
        id: item.id,
        product_id: item.product_id,
        quantity: item.quantity,
        product: item.product!
      }));
      
      const { total, itemCount } = calculateTotals(transformedItems);
      
      setState({
        items: transformedItems,
        total,
        itemCount,
        loading: false
      });
    } catch (error) {
      console.error('Error refreshing cart:', error);
      toast.error('Failed to load cart');
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => {
    if (!authLoading) {
      refreshCart();
    }
  }, [user, authLoading]);

  const addToCart = async (product: Product, quantity: number = 1) => {
    if (!user) {
      toast.error('Please log in to add items to cart');
      return;
    }

    try {
      await cart.addItem(user.id, product.id, quantity);
      await refreshCart();
      toast.success(`${product.title} added to cart`);
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add item to cart');
    }
  };

  const removeFromCart = async (itemId: string) => {
    if (!user) return;

    try {
      await cart.removeItem(itemId);
      await refreshCart();
      toast.success('Item removed from cart');
    } catch (error) {
      console.error('Error removing from cart:', error);
      toast.error('Failed to remove item from cart');
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (!user) return;

    try {
      await cart.updateQuantity(itemId, quantity);
      await refreshCart();
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast.error('Failed to update quantity');
    }
  };

  const clearCart = async () => {
    if (!user) return;

    try {
      await cart.clearCart(user.id);
      await refreshCart();
      toast.success('Cart cleared');
    } catch (error) {
      console.error('Error clearing cart:', error);
      toast.error('Failed to clear cart');
    }
  };

  const value = {
    state,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    refreshCart
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};